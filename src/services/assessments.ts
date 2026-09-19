import { Assessment } from '../types';

export const assessmentsService = {
  createAssessmentRecord: (
    candidateId: string,
    title: string,
    category: string,
    scoreExplainable: string,
    verifiedSkills: string[]
  ): Assessment => {
    return {
      id: `ass-${Date.now()}`,
      candidateId,
      title,
      category,
      date: new Date().toISOString().split('T')[0],
      scoreExplainable,
      verifiedSkills,
      status: 'Completed',
    };
  },
};
