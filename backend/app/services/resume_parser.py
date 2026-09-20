from typing import Dict, List, Optional
import re


def extract_resume_text(file_content: bytes, filename: str) -> str:
    """Extract text from resume file (PDF, DOCX, TXT)"""
    file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if file_extension == 'pdf':
        return extract_from_pdf(file_content)
    elif file_extension in ['docx', 'doc']:
        return extract_from_docx(file_content)
    elif file_extension == 'txt':
        return file_content.decode('utf-8', errors='ignore')
    else:
        # Try to decode as text
        try:
            return file_content.decode('utf-8', errors='ignore')
        except:
            return ""


def extract_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        import pypdf
        from io import BytesIO
        
        pdf_file = BytesIO(file_content)
        pdf_reader = pypdf.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""


def extract_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        from docx import Document
        from io import BytesIO
        
        docx_file = BytesIO(file_content)
        doc = Document(docx_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""


# Known technical keywords to detect from extracted text
KNOWN_SKILLS = [
    # Languages
    {"name": "Python", "category": "Language"},
    {"name": "TypeScript", "category": "Language"},
    {"name": "JavaScript", "category": "Language"},
    {"name": "Go", "category": "Language"},
    {"name": "Java", "category": "Language"},
    {"name": "C++", "category": "Language"},
    {"name": "Rust", "category": "Language"},
    {"name": "C#", "category": "Language"},
    {"name": "Ruby", "category": "Language"},
    {"name": "Swift", "category": "Language"},
    {"name": "Kotlin", "category": "Language"},
    {"name": "SQL", "category": "Language"},
    # Frameworks
    {"name": "React", "category": "Framework"},
    {"name": "Next.js", "category": "Framework"},
    {"name": "Node.js", "category": "Framework"},
    {"name": "Express", "category": "Framework"},
    {"name": "FastAPI", "category": "Framework"},
    {"name": "Django", "category": "Framework"},
    {"name": "Spring Boot", "category": "Framework"},
    {"name": "Vue.js", "category": "Framework"},
    {"name": "Angular", "category": "Framework"},
    {"name": "Tailwind CSS", "category": "Framework"},
    # Databases
    {"name": "PostgreSQL", "category": "Database"},
    {"name": "MySQL", "category": "Database"},
    {"name": "MongoDB", "category": "Database"},
    {"name": "Redis", "category": "Database"},
    {"name": "Elasticsearch", "category": "Database"},
    {"name": "DynamoDB", "category": "Database"},
    # Cloud / DevOps
    {"name": "Docker", "category": "Cloud/DevOps"},
    {"name": "Kubernetes", "category": "Cloud/DevOps"},
    {"name": "AWS", "category": "Cloud/DevOps"},
    {"name": "GCP", "category": "Cloud/DevOps"},
    {"name": "Azure", "category": "Cloud/DevOps"},
    {"name": "Terraform", "category": "Cloud/DevOps"},
    {"name": "CI/CD", "category": "Cloud/DevOps"},
    # Tools & Architecture
    {"name": "Git", "category": "Tool"},
    {"name": "GraphQL", "category": "Tool"},
    {"name": "Kafka", "category": "Tool"},
    {"name": "Microservices", "category": "Architecture"},
    {"name": "Distributed Systems", "category": "Architecture"},
    {"name": "REST API", "category": "Architecture"},
]


def parse_resume_data(text: str, filename: str) -> Dict:
    """Parse extracted resume text into structured data"""
    lines = text.split('\n')
    lines = [line.strip() for line in lines if line.strip()]
    
    # Email regex
    email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', text)
    email = email_match.group(1) if email_match else "NOT FOUND"
    
    # Phone regex
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else "NOT FOUND"
    
    # Links
    github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    portfolio_match = re.search(r'(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_-]+\.(?:dev|me|io|com|org|app))', text, re.IGNORECASE)
    
    links = {
        "github": github_match.group(0) if github_match else None,
        "linkedin": linkedin_match.group(0) if linkedin_match else None,
        "portfolio": portfolio_match.group(0) if portfolio_match and not portfolio_match.group(0).includes('github') and not portfolio_match.group(0).includes('linkedin') else None
    }
    
    # Name extraction heuristics
    name = "REQUIRES REVIEW"
    file_clean = filename.replace(r'\.(pdf|docx|txt|json|csv)$', '', re.IGNORECASE).replace('[-_]', ' ').replace(r'\b(resume|cv|profile|portfolio)\b', '', re.IGNORECASE).strip()
    
    if lines:
        first_line = lines[0]
        if len(first_line) < 50 and '@' not in first_line and 'resume' not in first_line.lower():
            name = first_line
        elif len(file_clean) > 2:
            name = file_clean
    elif len(file_clean) > 2:
        name = file_clean
    else:
        name = "NOT FOUND"
    
    # Education detection
    degree = "NOT FOUND"
    institution = "NOT FOUND"
    graduation_year = "NOT FOUND"
    
    degree_match = re.search(r'(?:Bachelor|Master|B\.?S\.?|B\.?Tech|B\.?E\.?|M\.?S\.?|Ph\.?D\.?)[^,\n.]*(?:in|of)?[^,\n.]*', text, re.IGNORECASE)
    if degree_match:
        degree = degree_match.group(0).strip()
    
    grad_match = re.search(r'\b(20\d{2}|19\d{2})\b', text)
    if grad_match:
        graduation_year = grad_match.group(1)
    
    univ_match = re.search(r'([A-Z][A-Za-z\s]+(?:University|Institute|College|Academy)[A-Za-z\s]*)', text)
    if univ_match:
        institution = univ_match.group(1).strip()
    
    # Skills detection
    detected_skills = []
    lower_text = text.lower()
    
    for skill in KNOWN_SKILLS:
        regex = re.compile(r'\b' + re.escape(skill['name']) + r'\b', re.IGNORECASE)
        if regex.search(text):
            level = "Mentioned in Resume"
            if f"expert in {skill['name'].lower()}" in lower_text or f"senior {skill['name'].lower()}" in lower_text:
                level = "Expert"
            elif f"advanced {skill['name'].lower()}" in lower_text or f"proficient in {skill['name'].lower()}" in lower_text:
                level = "Advanced"
            
            detected_skills.append({
                "name": skill['name'],
                "category": skill['category'],
                "level": level
            })
    
    # Detected Role
    detected_role = "Software Engineer (Requires Review)"
    if 'full-stack' in lower_text or 'full stack' in lower_text:
        detected_role = "Full-Stack Software Engineer"
    elif 'frontend' in lower_text or 'front-end' in lower_text:
        detected_role = "Frontend Engineer"
    elif 'backend' in lower_text or 'back-end' in lower_text:
        detected_role = "Backend Engineer"
    elif 'data engineer' in lower_text:
        detected_role = "Data Engineer"
    elif 'machine learning' in lower_text or 'ai engineer' in lower_text or 'ml engineer' in lower_text:
        detected_role = "AI / Machine Learning Engineer"
    elif 'devops' in lower_text or 'sre' in lower_text or 'cloud engineer' in lower_text:
        detected_role = "DevOps / Cloud Platform Engineer"
    
    # Project detection
    detected_projects = []
    project_header_index = -1
    for i, line in enumerate(lines):
        if re.match(r'^(projects|key projects|selected projects|technical projects)', line, re.IGNORECASE):
            project_header_index = i
            break
    
    if project_header_index != -1:
        for i in range(project_header_index + 1, min(len(lines), project_header_index + 12)):
            line = lines[i]
            if re.match(r'^(experience|education|skills|certifications|work history)', line, re.IGNORECASE):
                break
            if len(line) > 5 and not line.startswith('-') and not line.startswith('•'):
                next_lines = []
                j = i + 1
                while j < min(len(lines), i + 4) and (lines[j].startswith('-') or lines[j].startswith('•') or len(lines[j]) > 20):
                    if re.match(r'^(experience|education|skills)', lines[j], re.IGNORECASE):
                        break
                    next_lines.append(lines[j].lstrip('-•*').strip())
                    j += 1
                
                proj_skills = []
                for skill in detected_skills:
                    if skill['name'].lower() in line.lower() or any(skill['name'].lower() in nl.lower() for nl in next_lines):
                        proj_skills.append(skill['name'])
                
                detected_projects.append({
                    "name": line[:60],
                    "description": ' '.join(next_lines)[:240] if next_lines else "Project extracted from resume claims section.",
                    "skills": proj_skills if proj_skills else ["General Engineering"]
                })
                i = j - 1
    
    # Fallback project if none parsed but skills found
    if not detected_projects and detected_skills:
        detected_projects.append({
            "name": f"{detected_skills[0]['name']} System & Core Implementation",
            "description": f"Resume projects section requires manual review or additional documentation upload. Found mention of {', '.join([s['name'] for s in detected_skills[:3]])}.",
            "skills": [s['name'] for s in detected_skills[:3]]
        })
    
    # Location heuristics
    location = "NOT FOUND"
    loc_match = re.search(r'(?:Remote|[A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|USA|Canada|UK|India|Germany|Australia))', text)
    if loc_match:
        location = loc_match.group(0).strip()
    
    # Summary
    summary_line = None
    for line in lines:
        if line.lower().startswith(('summary', 'profile', 'about')):
            summary_line = line
            break
    
    summary = summary_line[:200] if summary_line else f"Extracted candidate profile from {filename}. Detected {len(detected_skills)} claimed skills and {len(detected_projects)} projects."
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "detected_role": detected_role,
        "summary": summary,
        "degree": degree,
        "institution": institution,
        "graduation_year": graduation_year,
        "skills": detected_skills,
        "projects": detected_projects,
        "links": links,
        "raw_text": text
    }
