import { ImportCandidateRecord, ImportJob } from '../types';

export interface ImportPreviewResult {
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: string[];
  records: ImportCandidateRecord[];
}

export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = '';

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());

    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, idx) => {
      rowObj[hdr] = values[idx] ? values[idx].replace(/^["']|["']$/g, '') : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export function parseJsonImport(rawJson: string): ImportPreviewResult {
  const errors: string[] = [];
  const records: ImportCandidateRecord[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  const seenEmails = new Set<string>();

  try {
    const parsed = JSON.parse(rawJson);
    const rawList: any[] = Array.isArray(parsed)
      ? parsed
      : parsed?.candidates && Array.isArray(parsed.candidates)
      ? parsed.candidates
      : [parsed];

    rawList.forEach((item, idx) => {
      const name = item.name || item.fullName || `Candidate #${idx + 1}`;
      const email = (item.email || item.contactEmail || `cand_${idx}@example.io`).toLowerCase().trim();
      const detectedRole = item.detectedRole || item.role || 'Software Engineer';
      const keySkills = Array.isArray(item.keySkills)
        ? item.keySkills
        : typeof item.skills === 'string'
        ? item.skills.split(',').map((s: string) => s.trim())
        : ['TypeScript', 'Node.js'];

      if (seenEmails.has(email)) {
        duplicateCount++;
        errors.push(`Duplicate email found for ${email} in entry #${idx + 1}.`);
      } else {
        seenEmails.add(email);
        validCount++;
        records.push({
          name,
          email,
          role: detectedRole,
          detectedRole,
          keySkills,
          skills: keySkills.join(', '),
          claims: item.claims || [],
          education: item.education || 'B.S. Computer Science',
          experienceYears: item.experienceYears || '5+',
          github: item.github || '',
          linkedin: item.linkedin || '',
        });
      }
    });
  } catch (err: any) {
    errors.push(`JSON Syntax Error: ${err.message}`);
  }

  return {
    validCount,
    duplicateCount,
    errorCount: errors.length,
    errors,
    records,
  };
}

export function parseCsvImport(rawCsv: string): ImportPreviewResult {
  const { headers, rows } = parseCSV(rawCsv);
  const errors: string[] = [];
  const records: ImportCandidateRecord[] = [];
  let validCount = 0;
  let duplicateCount = 0;
  const seenEmails = new Set<string>();

  if (rows.length === 0) {
    errors.push('CSV contains no data rows.');
  }

  rows.forEach((row, idx) => {
    const name = row['Name'] || row['name'] || row['Candidate'] || `Candidate #${idx + 1}`;
    const email = (row['Email'] || row['email'] || `cand_${idx}@example.io`).toLowerCase().trim();
    const role = row['Role'] || row['role'] || row['Title'] || 'Software Engineer';
    const skills = row['Skills'] || row['skills'] || 'TypeScript, React';
    const keySkills = skills.split(';').join(',').split(',').map((s) => s.trim()).filter(Boolean);

    if (seenEmails.has(email)) {
      duplicateCount++;
      errors.push(`Duplicate email found for ${email} at row #${idx + 2}.`);
    } else {
      seenEmails.add(email);
      validCount++;
      records.push({
        name,
        email,
        role,
        detectedRole: role,
        skills,
        keySkills,
        claims: keySkills.map((sk) => ({
          title: sk,
          description: `Imported claim for skill ${sk}`,
          claimType: 'Technical Skill',
          evidenceStatus: 'Unverified',
        })),
        education: row['Education'] || 'B.S. Computer Science',
        experienceYears: row['Experience'] || '3+',
      });
    }
  });

  return {
    validCount,
    duplicateCount,
    errorCount: errors.length,
    errors,
    records,
  };
}

export function validateImportFile(
  filename: string,
  rawContent: string,
  existingEmails: string[]
): ImportJob {
  const isJSON = filename.toLowerCase().endsWith('.json');
  const fileType: 'JSON' | 'CSV' = isJSON ? 'JSON' : 'CSV';
  const preview = isJSON ? parseJsonImport(rawContent) : parseCsvImport(rawContent);

  return {
    id: `import-${Date.now()}`,
    filename,
    fileType,
    uploadedAt: new Date().toISOString(),
    recordsDetected: preview.records.length,
    validRecords: preview.validCount,
    invalidRecords: preview.errorCount,
    duplicates: preview.duplicateCount,
    fieldsDetected: ['Name', 'Email', 'Role', 'Skills'],
    status: preview.errorCount > 0 && preview.validCount === 0 ? 'Error' : 'Validated',
    records: preview.records,
    errors: preview.errors,
  };
}
