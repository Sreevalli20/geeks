import { Candidate, Claim, Skill, Project, EvidenceItem, EvidenceCategory } from '../types';
import { apiClient } from './api';

// Known technical keywords to detect from extracted text
const KNOWN_SKILLS: { name: string; category: Skill['category'] }[] = [
  // Languages
  { name: 'Python', category: 'Language' },
  { name: 'TypeScript', category: 'Language' },
  { name: 'JavaScript', category: 'Language' },
  { name: 'Go', category: 'Language' },
  { name: 'Java', category: 'Language' },
  { name: 'C++', category: 'Language' },
  { name: 'Rust', category: 'Language' },
  { name: 'C#', category: 'Language' },
  { name: 'Ruby', category: 'Language' },
  { name: 'Swift', category: 'Language' },
  { name: 'Kotlin', category: 'Language' },
  { name: 'SQL', category: 'Language' },
  // Frameworks
  { name: 'React', category: 'Framework' },
  { name: 'Next.js', category: 'Framework' },
  { name: 'Node.js', category: 'Framework' },
  { name: 'Express', category: 'Framework' },
  { name: 'FastAPI', category: 'Framework' },
  { name: 'Django', category: 'Framework' },
  { name: 'Spring Boot', category: 'Framework' },
  { name: 'Vue.js', category: 'Framework' },
  { name: 'Angular', category: 'Framework' },
  { name: 'Tailwind CSS', category: 'Framework' },
  // Databases
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MySQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Redis', category: 'Database' },
  { name: 'Elasticsearch', category: 'Database' },
  { name: 'DynamoDB', category: 'Database' },
  // Cloud / DevOps
  { name: 'Docker', category: 'Cloud/DevOps' },
  { name: 'Kubernetes', category: 'Cloud/DevOps' },
  { name: 'AWS', category: 'Cloud/DevOps' },
  { name: 'GCP', category: 'Cloud/DevOps' },
  { name: 'Azure', category: 'Cloud/DevOps' },
  { name: 'Terraform', category: 'Cloud/DevOps' },
  { name: 'CI/CD', category: 'Cloud/DevOps' },
  // Tools & Architecture
  { name: 'Git', category: 'Tool' },
  { name: 'GraphQL', category: 'Tool' },
  { name: 'Kafka', category: 'Tool' },
  { name: 'Microservices', category: 'Architecture' },
  { name: 'Distributed Systems', category: 'Architecture' },
  { name: 'REST API', category: 'Architecture' },
];

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file text'));
    reader.readAsText(file);
  });
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
}

export function detectCategoryFromFilename(filename: string): EvidenceCategory {
  const lower = filename.toLowerCase();
  if (lower.includes('resume') || lower.includes('cv')) return 'Resume';
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    if (lower.includes('cert') || lower.includes('badge') || lower.includes('diploma')) return 'Certificate';
    return 'Screenshot';
  }
  if (
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.py') ||
    lower.endsWith('.go') ||
    lower.endsWith('.java') ||
    lower.endsWith('.cpp') ||
    lower.endsWith('.rs') ||
    lower.endsWith('.js') ||
    lower.endsWith('.jsx')
  ) {
    return 'Source Code';
  }
  if (lower.endsWith('.zip') || lower.endsWith('.tar') || lower.endsWith('.gz')) return 'Project';
  if (lower.endsWith('.md') || lower.endsWith('.doc') || lower.endsWith('.docx')) {
    if (lower.includes('rfc') || lower.includes('doc') || lower.includes('architecture') || lower.includes('design')) {
      return 'Documentation';
    }
    return 'Resume';
  }
  if (lower.endsWith('.json') || lower.endsWith('.csv')) return 'Assessment';
  return 'Other';
}

// Upload resume to backend
export async function uploadResumeToBackend(file: File, candidateId?: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (candidateId) {
    formData.append('candidate_id', candidateId);
  }

  const response = await apiClient.upload('/api/uploads/resume', formData);
  return response.data;
}

// Upload evidence files to backend
export async function uploadEvidenceToBackend(files: File[], candidateId: string): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('candidate_id', candidateId);

  const response = await apiClient.upload('/api/uploads/evidence', formData);
  return response.data;
}

export interface ExtractedCandidateData {
  name: string;
  nameStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW';
  email: string;
  emailStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW';
  phone: string;
  phoneStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW';
  location: string;
  locationStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW';
  detectedRole: string;
  summary: string;
  degree: string;
  institution: string;
  graduationYear: string;
  educationStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW';
  skills: { name: string; category: Skill['category']; level: string }[];
  projects: { name: string; description: string; skills: string[] }[];
  experiences: { company: string; role: string; period: string; description: string }[];
  links: { github?: string; linkedin?: string; portfolio?: string };
  rawText: string;
}

export function extractFromResumeText(text: string, filename: string): ExtractedCandidateData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Email regex
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : 'NOT FOUND';
  const emailStatus = emailMatch ? 'FOUND' : 'NOT FOUND';

  // Phone regex
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : 'NOT FOUND';
  const phoneStatus = phoneMatch ? 'FOUND' : 'NOT FOUND';

  // Links
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const portfolioMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_-]+\.(?:dev|me|io|com|org|app))/i);

  const links = {
    github: githubMatch ? githubMatch[0] : undefined,
    linkedin: linkedinMatch ? linkedinMatch[0] : undefined,
    portfolio: portfolioMatch && !portfolioMatch[0].includes('github') && !portfolioMatch[0].includes('linkedin') ? portfolioMatch[0] : undefined,
  };

  // Name extraction heuristics
  let name = 'REQUIRES REVIEW';
  let nameStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW' = 'REQUIRES REVIEW';

  // Clean filename candidate name (e.g. John_Doe_Resume.pdf -> John Doe)
  const fileClean = filename.replace(/\.(pdf|docx|txt|json|csv)$/i, '').replace(/[-_]/g, ' ').replace(/\b(resume|cv|profile|portfolio)\b/gi, '').trim();

  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.toLowerCase().includes('resume')) {
      name = firstLine;
      nameStatus = 'FOUND';
    } else if (fileClean.length > 2) {
      name = fileClean;
      nameStatus = 'REQUIRES REVIEW';
    }
  } else if (fileClean.length > 2) {
    name = fileClean;
    nameStatus = 'REQUIRES REVIEW';
  } else {
    name = 'NOT FOUND';
    nameStatus = 'NOT FOUND';
  }

  // Education detection
  let degree = 'NOT FOUND';
  let institution = 'NOT FOUND';
  let graduationYear = 'NOT FOUND';
  let educationStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW' = 'NOT FOUND';

  const degreeMatch = text.match(/(?:Bachelor|Master|B\.?S\.?|B\.?Tech|B\.?E\.?|M\.?S\.?|Ph\.?D\.?)[^,\n.]*(?:in|of)?[^,\n.]*/i);
  if (degreeMatch) {
    degree = degreeMatch[0].trim();
    educationStatus = 'FOUND';
  }

  const gradMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
  if (gradMatch) {
    graduationYear = gradMatch[1];
  }

  const univMatch = text.match(/([A-Z][A-Za-z\s]+(?:University|Institute|College|Academy)[A-Za-z\s]*)/);
  if (univMatch) {
    institution = univMatch[1].trim();
    educationStatus = 'FOUND';
  }

  // Skills detection
  const detectedSkills: { name: string; category: Skill['category']; level: string }[] = [];
  const lowerText = text.toLowerCase();

  for (const s of KNOWN_SKILLS) {
    // Regex boundary check
    const regex = new RegExp(`\\b${s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      let level = 'Mentioned in Resume';
      if (lowerText.includes(`expert in ${s.name.toLowerCase()}`) || lowerText.includes(`senior ${s.name.toLowerCase()}`)) {
        level = 'Expert';
      } else if (lowerText.includes(`advanced ${s.name.toLowerCase()}`) || lowerText.includes(`proficient in ${s.name.toLowerCase()}`)) {
        level = 'Advanced';
      }
      detectedSkills.push({
        name: s.name,
        category: s.category,
        level,
      });
    }
  }

  // Detected Role
  let detectedRole = 'Software Engineer (Requires Review)';
  if (lowerText.includes('full-stack') || lowerText.includes('full stack')) {
    detectedRole = 'Full-Stack Software Engineer';
  } else if (lowerText.includes('frontend') || lowerText.includes('front-end')) {
    detectedRole = 'Frontend Engineer';
  } else if (lowerText.includes('backend') || lowerText.includes('back-end')) {
    detectedRole = 'Backend Engineer';
  } else if (lowerText.includes('data engineer')) {
    detectedRole = 'Data Engineer';
  } else if (lowerText.includes('machine learning') || lowerText.includes('ai engineer') || lowerText.includes('ml engineer')) {
    detectedRole = 'AI / Machine Learning Engineer';
  } else if (lowerText.includes('devops') || lowerText.includes('sre') || lowerText.includes('cloud engineer')) {
    detectedRole = 'DevOps / Cloud Platform Engineer';
  }

  // Project detection
  const detectedProjects: { name: string; description: string; skills: string[] }[] = [];
  const projectHeaderIndex = lines.findIndex((l) => /^(projects|key projects|selected projects|technical projects)/i.test(l));

  if (projectHeaderIndex !== -1) {
    for (let i = projectHeaderIndex + 1; i < Math.min(lines.length, projectHeaderIndex + 12); i++) {
      const line = lines[i];
      if (/^(experience|education|skills|certifications|work history)/i.test(line)) break;
      if (line.length > 5 && !line.startsWith('-') && !line.startsWith('•')) {
        const nextLines: string[] = [];
        let j = i + 1;
        while (j < Math.min(lines.length, i + 4) && (lines[j].startsWith('-') || lines[j].startsWith('•') || lines[j].length > 20)) {
          if (/^(experience|education|skills)/i.test(lines[j])) break;
          nextLines.push(lines[j].replace(/^[-•*]\s*/, ''));
          j++;
        }
        const projSkills = detectedSkills.filter((sk) => line.toLowerCase().includes(sk.name.toLowerCase()) || nextLines.join(' ').toLowerCase().includes(sk.name.toLowerCase())).map((s) => s.name);
        detectedProjects.push({
          name: line.substring(0, 60),
          description: nextLines.join(' ').substring(0, 240) || 'Project extracted from resume claims section.',
          skills: projSkills.length > 0 ? projSkills : ['General Engineering'],
        });
        i = j - 1;
      }
    }
  }

  // Fallback project if none parsed but skills found
  if (detectedProjects.length === 0 && detectedSkills.length > 0) {
    detectedProjects.push({
      name: `${detectedSkills[0].name} System & Core Implementation`,
      description: `Resume projects section requires manual review or additional documentation upload. Found mention of ${detectedSkills.slice(0, 3).map((s) => s.name).join(', ')}.`,
      skills: detectedSkills.slice(0, 3).map((s) => s.name),
    });
  }

  // Location heuristics
  let location = 'NOT FOUND';
  let locationStatus: 'FOUND' | 'NOT FOUND' | 'REQUIRES REVIEW' = 'NOT FOUND';
  const locMatch = text.match(/(?:Remote|[A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|USA|Canada|UK|India|Germany|Australia))/);
  if (locMatch) {
    location = locMatch[0].trim();
    locationStatus = 'FOUND';
  }

  // Summary
  const summaryLine = lines.find((l) => l.toLowerCase().startsWith('summary') || l.toLowerCase().startsWith('profile') || l.toLowerCase().startsWith('about'));
  const summary = summaryLine ? summaryLine.substring(0, 200) : `Extracted candidate profile from ${filename}. Detected ${detectedSkills.length} claimed skills and ${detectedProjects.length} projects.`;

  return {
    name,
    nameStatus,
    email,
    emailStatus,
    phone,
    phoneStatus,
    location,
    locationStatus,
    detectedRole,
    summary,
    degree,
    institution,
    graduationYear,
    educationStatus,
    skills: detectedSkills,
    projects: detectedProjects,
    experiences: [],
    links,
    rawText: text,
  };
}
