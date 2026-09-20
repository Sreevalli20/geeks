import { Candidate } from '../types';
import { apiClient } from './api';

export const candidatesService = {
  getAll: async (): Promise<Candidate[]> => {
    const response = await apiClient.get<any>('/api/candidates');
    return response.data.candidates || [];
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get<any>(`/api/candidates/${id}`);
    const backendCandidate = response.data.candidate;
    
    // Transform backend data to frontend format
    return {
      id: backendCandidate.id,
      name: backendCandidate.name,
      email: backendCandidate.email,
      phone: backendCandidate.phone,
      location: backendCandidate.location,
      detectedRole: backendCandidate.detected_role,
      targetRole: backendCandidate.target_role,
      summary: backendCandidate.summary,
      education: backendCandidate.education_degree ? {
        degree: backendCandidate.education_degree,
        institution: backendCandidate.education_institution,
        graduationYear: backendCandidate.education_graduation_year,
      } : undefined,
      keySkills: [], // Will be populated from skills endpoint
      links: {
        github: backendCandidate.github_url,
        linkedin: backendCandidate.linkedin_url,
        portfolio: backendCandidate.portfolio_url,
      },
      isDevelopmentData: backendCandidate.is_development_data,
      createdAt: backendCandidate.created_at,
      updatedAt: backendCandidate.updated_at,
    };
  },

  create: async (data: Partial<Candidate>): Promise<Candidate> => {
    const response = await apiClient.post<any>('/api/candidates', data);
    return response.data.candidate;
  },

  update: async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    const response = await apiClient.put<any>(`/api/candidates/${id}`, data);
    return response.data.candidate;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/candidates/${id}`);
  },

  // Legacy method for compatibility with existing frontend code
  createFromExtracted: (data: any, isDev = false): Candidate => {
    return {
      id: `cand-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: data.name || 'Candidate Requiring Review',
      email: data.email || '',
      phone: data.phone !== 'NOT FOUND' ? data.phone : undefined,
      location: data.location !== 'NOT FOUND' ? data.location : undefined,
      detectedRole: data.detectedRole || 'Software Engineer',
      targetRole: data.detectedRole || 'Software Engineer',
      summary: data.summary || 'Extracted from submitted resume.',
      education: data.degree !== 'NOT FOUND' ? {
        degree: data.degree,
        institution: data.institution !== 'NOT FOUND' ? data.institution : 'Not Specified',
        graduationYear: data.graduationYear !== 'NOT FOUND' ? data.graduationYear : 'Not Specified',
      } : undefined,
      keySkills: data.skills ? data.skills.map((s: any) => s.name) : [],
      links: data.links || {},
      isDevelopmentData: isDev,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};
