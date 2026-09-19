import { VerificationEvent } from '../types';

export const verificationService = {
  createEvent: (
    candidateId: string,
    eventType: VerificationEvent['eventType'],
    actor: string,
    details: string,
    sourceRef?: string
  ): VerificationEvent => {
    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      candidateId,
      timestamp: new Date().toISOString(),
      eventType,
      actor,
      details,
      sourceRef,
    };
  },
};
