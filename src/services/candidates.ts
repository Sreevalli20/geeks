import { Candidate } from '../types';
import { apiClient } from './api';

export const candidatesService = {
  getAll: async (): Promise<Candidate[]> => {
    const response = await apiClient.get<any>('/api/candidates');
    return response.data.candidates || [];
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get<any>(`/api/candidates/${id}`);
    return response.data.candidate;
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
