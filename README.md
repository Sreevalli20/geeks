# SkillProof

**DON'T HIRE THE RESUME. HIRE THE PROOF.**

Turn candidate claims into verifiable skill evidence through automated resume processing, GitHub repository analysis, and practical validation challenges.

## 🚀 Features

- **Zero Manual Data Entry**: Upload resumes and automatically extract candidate information, skills, projects, and claims
- **GitHub Integration**: Analyze public GitHub repositories to support or challenge resume claims
- **Evidence-Based Verification**: Track claims vs. proof with explainable confidence scores
- **Practical Challenges**: Role-specific coding challenges to validate claimed skills
- **Full-Stack Architecture**: Production-ready Node.js/Express backend with PostgreSQL database
- **Render Deployment**: Optimized for deployment on Render with PostgreSQL integration

## 🏗️ Architecture

### Frontend (React + TypeScript + Vite)
- Modern React UI with Tailwind CSS
- Real-time file upload and processing
- Interactive evidence visualization
- Candidate directory and detailed profiles

### Backend (Node.js + Express + TypeScript)
- RESTful API with JWT authentication
- PostgreSQL database with production schema
- File upload handling (PDF, DOCX, TXT, images, code files)
- GitHub API integration for repository analysis
- Resume text extraction (PDF, DOCX, TXT)

### Database (PostgreSQL)
- Candidates, claims, skills, projects, evidence
- Practical challenges and submissions
- Verification timeline and audit logs
- Import jobs and reports

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sreevalli20/geeks.git
cd skillproof
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/skillproof"

# Backend
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="your-secret-key"

# Frontend
VITE_API_URL="http://localhost:3001"

# Optional: AI processing
GEMINI_API_KEY=""

# Optional: GitHub private repo access
GITHUB_TOKEN=""
```

5. **Set up PostgreSQL database**
```bash
# Create database
createdb skillproof

# Run migrations
npm run migrate
```

## 🚀 Running the Application

### Development Mode (Frontend + Backend)
```bash
npm run dev
```
This starts both the frontend (port 3000) and backend (port 3001) concurrently.

### Production Build
```bash
npm run build
npm start
```

### Frontend Only
```bash
npm run dev:frontend
```

### Backend Only
```bash
npm run dev:server
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - Authentication and user management
- `candidates` - Candidate profiles and extracted information
- `resumes` - Uploaded resume files and parsing results
- `claims` - Candidate claims extracted from resumes
- `skills` - Normalized skills with verification status
- `projects` - Candidate projects with evidence
- `evidence` - All evidence items (code, docs, certificates, etc.)
- `practical_challenges` - Role-specific coding challenges
- `challenge_submissions` - Candidate challenge submissions
- `verification_events` - Audit trail of all verification activities

## 🔐 Authentication

The application uses JWT-based authentication with three roles:

- **CANDIDATE** - Can view and manage their own profile
- **RECRUITER** - Can view all candidates and manage verification
- **ADMIN** - Full system access

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates` - Get all candidates
- `GET /api/candidates/:id` - Get single candidate
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id` - Update candidate
- `DELETE /api/candidates/:id` - Delete candidate

### Uploads
- `POST /api/uploads/resume` - Upload and process resume
- `POST /api/uploads/evidence` - Upload supporting evidence

### GitHub
- `POST /api/github/analyze` - Analyze GitHub repository
- `POST /api/github/validate` - Validate GitHub URL

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges/submit` - Submit challenge solution

### Evidence
- `GET /api/evidence/candidate/:candidateId` - Get candidate evidence
- `POST /api/evidence` - Create evidence
- `PUT /api/evidence/:id` - Update evidence
- `DELETE /api/evidence/:id` - Delete evidence

### Reports
- `POST /api/reports/candidate/:candidateId` - Generate candidate report

### Health
- `GET /api/health` - Health check endpoint

## 🚢 Deployment

### Render Deployment

The application includes `render.yaml` for easy deployment on Render:

1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` configuration
3. The deployment will create:
   - PostgreSQL database
   - Backend API service
   - Frontend service (optional - can also use Vercel)

### Environment Variables for Render

Set these in your Render dashboard:
- `DATABASE_URL` (auto-generated from database)
- `JWT_SECRET` (generate a secure random string)
- `FRONTEND_URL` (your deployed frontend URL)
- `GITHUB_TOKEN` (optional, for private repos)
- `GEMINI_API_KEY` (optional, for AI processing)

## 🧪 Testing

### Manual Testing Workflow

1. **Start the application**
```bash
npm run dev
```

2. **Register a recruiter account**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@example.com","password":"password123","role":"RECRUITER"}'
```

3. **Login and get token**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"recruiter@example.com","password":"password123"}'
```

4. **Upload a resume**
```bash
curl -X POST http://localhost:3001/api/uploads/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/resume.pdf"
```

5. **Check health endpoint**
```bash
curl http://localhost:3001/api/health
```

## 📝 Development Notes

### File Upload Handling
- Resumes are processed using PDF parsing and text extraction
- Maximum file size: 10MB
- Supported formats: PDF, DOCX, TXT, MD, PNG, JPG, ZIP, code files

### GitHub Integration
- Supports public repository analysis without authentication
- Private repositories require `GITHUB_TOKEN`
- Extracts: languages, topics, stars, forks, description

### Resume Processing
- Automatic extraction of: name, email, phone, skills, projects, education
- Skill normalization and categorization
- Claim generation from detected skills

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection prevention (parameterized queries)
- File type validation
- Environment variable protection

## 📄 License

This project is part of the SkillProof platform.

## 🤝 Contributing

This is a production application for SkillProof. Please follow the existing patterns and conventions when making changes.

## 📞 Support

For issues or questions related to this implementation, please refer to the project documentation or contact the development team.
