
export interface NeuronParams {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface SimulationState {
  v: number; // membrane potential
  u: number; // recovery variable
  t: number; // current time step
}

export interface DataPoint {
  time: number;
  v: number;
  u: number;
  current1: number;
  current2: number;
  totalCurrent: number;
}

export enum NeuronType {
  REGULAR_SPIKING = 'Regular Spiking',
  FAST_SPIKING = 'Fast Spiking',
  CHATTERING = 'Chattering',
  INTRINSICALLY_BURSTING = 'Intrinsically Bursting',
}

export const PRESET_PARAMS: Record<NeuronType, NeuronParams> = {
  [NeuronType.REGULAR_SPIKING]: { a: 0.02, b: 0.2, c: -65.0, d: 6.0 },
  [NeuronType.FAST_SPIKING]: { a: 0.1, b: 0.2, c: -65.0, d: 2.0 },
  [NeuronType.CHATTERING]: { a: 0.02, b: 0.2, c: -50.0, d: 2.0 },
  [NeuronType.INTRINSICALLY_BURSTING]: { a: 0.02, b: 0.2, c: -55.0, d: 4.0 },
};
