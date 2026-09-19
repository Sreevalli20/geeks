# SkillProof Setup Guide

## Quick Start

1. **Install frontend dependencies**
```bash
npm install
```

2. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

3. **Create environment file**
```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Database - Use your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillproof"

# Backend
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="skillproof-dev-secret-key-change-in-production"

# Frontend
VITE_API_URL="/api"

# Optional: AI processing
GEMINI_API_KEY=""

# Optional: GitHub private repo access
GITHUB_TOKEN=""
```

4. **Set up PostgreSQL database**
```bash
# Create database
createdb skillproof

# Run migrations
npm run migrate
```

5. **Start the application**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Database Setup (PostgreSQL)

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL if not already installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start
# Windows: Start PostgreSQL service from Services

# Create database
createdb skillproof

# Run migrations
npm run migrate
```

### Option 2: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name skillproof-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=skillproof \
  -p 5432:5432 \
  -d postgres:14

# Update DATABASE_URL in .env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillproof"

# Run migrations
npm run migrate
```

### Option 3: Render PostgreSQL (Development)
```bash
# If you have a Render PostgreSQL instance, use its connection string
# Update DATABASE_URL in .env with your Render connection string
```

## Testing the Installation

1. **Check backend health**
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "SkillProof API",
  "version": "1.0.0"
}
```

2. **Register a user**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"RECRUITER"}'
```

3. **Access the frontend**
Open http://localhost:3000 in your browser

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL is running
- Check connection string in .env
- Verify database exists: `psql -l`

### Port Already in Use
- Change PORT in .env if 3001 is in use
- Change frontend port in vite.config.ts if 3000 is in use

### Dependency Issues
- Delete node_modules and package-lock.json
- Run `npm install` again

### Migration Issues
- Ensure DATABASE_URL is correct
- Check PostgreSQL is accessible
- Try running migrations manually: `cd server && npm run migrate`

## Production Deployment

See README.md for Render deployment instructions.
