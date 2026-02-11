
export type LogicGate = 'AND' | 'OR' | 'NAND' | 'XOR';

export interface TrainingSample {
  x1: number;
  x2: number;
  y: number;
}

export interface NeuronWeights {
  w1: number;
  w2: number;
  b: number;
}

export interface TrainingLog {
  epoch: number;
  weights: NeuronWeights;
  accuracy: number;
}
