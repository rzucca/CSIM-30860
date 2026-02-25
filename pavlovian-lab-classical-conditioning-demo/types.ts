
export enum StimulusType {
  NEUTRAL = 'NEUTRAL',
  UNCONDITIONED = 'UNCONDITIONED',
}

export type LabMode = 'SALIVARY' | 'EYEBLINK' | 'CEREBELLAR' | 'BLOCKING';

export interface TrainingEvent {
  timestamp: number;
  type: string;
  strength: number; // For single CS modes
  strengthA?: number; // For blocking mode
  strengthB?: number; // For blocking mode
  response: string;
  predictionError?: number;
  trace?: any[];
  params?: {
    isi?: number;
    frequency?: number;
    intensity?: number;
    alphaA?: number;
    alphaB?: number;
  };
}
