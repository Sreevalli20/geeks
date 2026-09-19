import pdf from 'pdf-parse';

// @ts-ignore - mammoth doesn't have proper TypeScript definitions
import mammoth from 'mammoth';

export async function extractResumeText(file: Express.Multer.File): Promise<string> {
  const mimeType = file.mimetype;
  const originalName = file.originalname.toLowerCase();

  try {
    if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
      const data = await pdf(file.buffer);
      return data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalName.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else if (
      mimeType === 'text/plain' ||
      mimeType === 'text/markdown' ||
      originalName.endsWith('.txt') ||
      originalName.endsWith('.md')
    ) {
      return file.buffer.toString('utf-8');
    } else {
      // For images and other files, return placeholder
      return `[Binary file: ${file.originalname} - ${file.size} bytes]`;
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to extract text from file');
  }
}

export function parseCandidateFromText(text: string, filename: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Email extraction
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  // Phone extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Links extraction
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);

  // Name extraction from filename or first line
  let name = filename.replace(/\.(pdf|docx|txt|md)$/i, '').replace(/[-_]/g, ' ').trim();
  if (lines.length > 0 && lines[0].length < 50 && !lines[0].includes('@')) {
    name = lines[0];
  }

  // Skills detection
  const knownSkills = [
    'Python', 'TypeScript', 'JavaScript', 'Go', 'Java', 'C++', 'Rust', 'C#', 'Ruby', 'Swift', 'Kotlin', 'SQL',
    'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Django', 'Spring Boot', 'Vue.js', 'Angular', 'Tailwind CSS',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD',
    'Git', 'GraphQL', 'Kafka', 'Microservices', 'Distributed Systems', 'REST API'
  ];

  const detectedSkills = knownSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  // Role detection
  let detectedRole = 'Software Engineer';
  const lowerText = text.toLowerCase();
  if (lowerText.includes('full-stack') || lowerText.includes('full stack')) {
    detectedRole = 'Full-Stack Software Engineer';
  } else if (lowerText.includes('frontend') || lowerText.includes('front-end')) {
    detectedRole = 'Frontend Engineer';
  } else if (lowerText.includes('backend') || lowerText.includes('back-end')) {
    detectedRole = 'Backend Engineer';
  } else if (lowerText.includes('data engineer')) {
    detectedRole = 'Data Engineer';
  } else if (lowerText.includes('machine learning') || lowerText.includes('ai engineer')) {
    detectedRole = 'AI / Machine Learning Engineer';
  } else if (lowerText.includes('devops') || lowerText.includes('sre')) {
    detectedRole = 'DevOps / Cloud Platform Engineer';
  }

  // Education detection
  const degreeMatch = text.match(/(?:Bachelor|Master|B\.?S\.?|B\.?Tech|B\.?E\.?|M\.?S\.?|Ph\.?D\.?)[^,\n.]*(?:in|of)?[^,\n.]*/i);
  const degree = degreeMatch ? degreeMatch[0].trim() : '';

  const institutionMatch = text.match(/([A-Z][A-Za-z\s]+(?:University|Institute|College|Academy)[A-Za-z\s]*)/);
  const institution = institutionMatch ? institutionMatch[1].trim() : '';

  return {
    name,
    email,
    phone,
    detectedRole,
    keySkills: detectedSkills,
    summary: `Extracted from ${filename}. Detected ${detectedSkills.length} claimed skills.`,
    education_degree: degree,
    education_institution: institution,
    github_url: githubMatch ? githubMatch[0] : '',
    linkedin_url: linkedinMatch ? linkedinMatch[0] : '',
    rawText: text
  };
}
