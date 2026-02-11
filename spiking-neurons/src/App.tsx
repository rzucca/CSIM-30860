
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, ReferenceArea, Legend } from 'recharts';
import { Play, Pause, RotateCcw, Zap, Settings2, BrainCircuit, Activity, Sliders, Layers, Info, UnfoldVertical, ZapOff, StepForward } from 'lucide-react';
import { NeuronType, NeuronParams, SimulationState, DataPoint, PRESET_PARAMS } from './types';

const DT = 0.5;
const MAX_DATA_POINTS = 300;
const INITIAL_V = -70.0;
const INITIAL_U = -14.0;

interface Pulse {
  startTime: number;
  endTime: number;
  intensity: number;
}

// Simple Tooltip Component for parameters
const ParameterTooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <Info className="w-3 h-3 text-slate-500 cursor-help hover:text-blue-400 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-200 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-slate-700 leading-tight">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
    </div>
  </div>
);

const IonChannelVisualizer: React.FC<{ v: number }> = ({ v }) => {
  const [naState, setNaState] = useState<'closed' | 'open' | 'inactivated'>('closed');
  const [kState, setKState] = useState<'closed' | 'open'>('closed');

  useEffect(() => {
    // Logic for Na+ Channel
    if (v >= 30) {
      setNaState('inactivated');
    } else if (v >= -55 && (naState === 'closed' || v > -55)) {
      if (naState !== 'inactivated' || v < -60) {
         setNaState('open');
      }
    } else if (v <= -65) {
      setNaState('closed');
    }

    // Logic for K+ Channel - Now opens at exactly +15mV for clear repolarization onset
    if (v >= 15) {
      setKState('open');
    } else if (v <= -75) {
      setKState('closed');
    }
  }, [v, naState, kState]);

  const getPhaseExplanation = () => {
    if (v < -55 && kState === 'closed' && naState === 'closed') 
      return { title: "Resting Potential", desc: "The membrane is at rest (~-70mV). Most voltage-gated channels are closed. Leaky channels maintain equilibrium." };
    if (v >= -55 && v < 15 && naState === 'open') 
      return { title: "Depolarization", desc: "Threshold reached! Na+ channels snap open, allowing a rapid influx of positive ions, driving the potential upward." };
    if (v >= 15 || (v < 30 && kState === 'open')) 
      return { title: "Repolarization", desc: "Na+ channels inactivate. K+ channels open at +15mV, allowing K+ to exit the cell (outbound flux), bringing the potential back down." };
    if (v < -70 && kState === 'open') 
      return { title: "Hyperpolarization", desc: "K+ channels close slowly. The potential drops below resting level (undershoot) before stabilizing." };
    return { title: "Stabilizing", desc: "Ionic pumps work to restore the original concentration gradients." };
  };

  const explanation = getPhaseExplanation();

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
      <div className="absolute top-6 left-8 flex items-center gap-2 text-slate-500">
        <UnfoldVertical className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Membrane Micro-Environment</span>
      </div>

      <div className="flex-1 w-full flex justify-around items-center h-48 relative border-x border-slate-800/50 px-4">
        {/* Na+ Channel (Inbound Flux) */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-black text-amber-500 tracking-tighter uppercase mb-2">Na+ Channel</div>
          <div className={`relative w-16 h-24 rounded-2xl border-4 transition-all duration-300 flex items-center justify-center ${
            naState === 'open' ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_30px_rgba(251,191,36,0.2)] scale-105' : 
            naState === 'inactivated' ? 'border-amber-900 bg-slate-950 opacity-60' : 'border-slate-800 bg-slate-950'
          }`}>
            <div className={`absolute w-full h-1 bg-amber-500/40 transition-all ${naState === 'open' ? 'opacity-0' : 'opacity-100'}`} />
            {naState === 'inactivated' && <ZapOff className="w-4 h-4 text-amber-900" />}
            {naState === 'open' && [0,1,2].map(i => (
              <div key={i} className="absolute w-2 h-2 rounded-full bg-amber-400 animate-ion-in" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <div className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{naState.toUpperCase()}</div>
        </div>

        <div className="hidden lg:flex flex-col gap-2 opacity-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-4 h-1 bg-slate-600 rounded-full" />
          ))}
        </div>

        {/* K+ Channel (Outbound Flux) */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-[10px] font-black text-purple-500 tracking-tighter uppercase mb-2">K+ Channel</div>
          <div className={`relative w-16 h-24 rounded-2xl border-4 transition-all duration-300 flex items-center justify-center ${
            kState === 'open' ? 'border-purple-400 bg-purple-400/10 shadow-[0_0_30px_rgba(168,85,247,0.2)] scale-105' : 'border-slate-800 bg-slate-950'
          }`}>
            <div className={`absolute w-full h-1 bg-purple-500/40 transition-all ${kState === 'open' ? 'opacity-0' : 'opacity-100'}`} />
            {kState === 'open' && [0,1,2].map(i => (
              <div key={i} className="absolute w-2 h-2 rounded-full bg-purple-400 animate-ion-out" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <div className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{kState.toUpperCase()}</div>
        </div>
      </div>

      <div className="w-full md:w-72 space-y-3">
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${v > -55 ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'}`} />
           <h4 className="text-sm font-black text-white uppercase tracking-tight">{explanation.title}</h4>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed min-h-[4rem]">
          {explanation.desc}
        </p>
        <div className="pt-2 border-t border-slate-800 flex justify-between text-[10px] font-bold text-slate-500">
           <span>Na+ Influx: <span className={naState === 'open' ? 'text-amber-400' : ''}>{naState === 'open' ? 'HIGH' : 'NONE'}</span></span>
           <span>K+ Efflux: <span className={kState === 'open' ? 'text-purple-400' : ''}>{kState === 'open' ? 'HIGH' : 'NONE'}</span></span>
        </div>
      </div>

      <style>{`
        @keyframes ion-in {
          0% { transform: translateY(-40px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        @keyframes ion-out {
          0% { transform: translateY(40px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        .animate-ion-in { animation: ion-in 1s infinite linear; }
        .animate-ion-out { animation: ion-out 1s infinite linear; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [params, setParams] = useState<NeuronParams>(PRESET_PARAMS[NeuronType.REGULAR_SPIKING]);
  const [neuronType, setNeuronType] = useState<NeuronType>(NeuronType.REGULAR_SPIKING);
  const [state, setState] = useState<SimulationState>({ v: INITIAL_V, u: INITIAL_U, t: 0 });
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [baseCurrent, setBaseCurrent] = useState(0); 
  
  const [pulseIntensity1, setPulseIntensity1] = useState(15);
  const [pulseDuration1, setPulseDuration1] = useState(10);
  const [pulseCount1, setPulseCount1] = useState(1);
  const [pulseInterval1, setPulseInterval1] = useState(20);
  const [activePulses1, setActivePulses1] = useState<Pulse[]>([]);
  
  const [pulseIntensity2, setPulseIntensity2] = useState(10);
  const [pulseDuration2, setPulseDuration2] = useState(10);
  const [pulseCount2, setPulseCount2] = useState(1);
  const [pulseInterval2, setPulseInterval2] = useState(20);
  const [activePulses2, setActivePulses2] = useState<Pulse[]>([]);

  const [combinedDelay, setCombinedDelay] = useState(20);

  const stateRef = useRef<SimulationState>({ v: INITIAL_V, u: INITIAL_U, t: 0 });
  const paramsRef = useRef<NeuronParams>(params);
  const current1Ref = useRef<number>(0);
  const current2Ref = useRef<number>(0);
  const historyRef = useRef<DataPoint[]>([]);
  const activePulses1Ref = useRef<Pulse[]>(activePulses1);
  const activePulses2Ref = useRef<Pulse[]>(activePulses2);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { activePulses1Ref.current = activePulses1; }, [activePulses1]);
  useEffect(() => { activePulses2Ref.current = activePulses2; }, [activePulses2]);
  
  const advanceSimulation = useCallback(() => {
    const { v, u, t } = stateRef.current;
    const { a, b, c, d } = paramsRef.current;
    const currentTime = t;
    
    let stimulusI1 = 0;
    activePulses1Ref.current.forEach(p => { 
      if (currentTime >= p.startTime && currentTime <= p.endTime) stimulusI1 += p.intensity; 
    });

    let stimulusI2 = 0;
    activePulses2Ref.current.forEach(p => { 
      if (currentTime >= p.startTime && currentTime <= p.endTime) stimulusI2 += p.intensity; 
    });

    const totalI = baseCurrent + stimulusI1 + stimulusI2;
    current1Ref.current = stimulusI1;
    current2Ref.current = stimulusI2;

    const dv = 0.04 * v * v + 5 * v + 140 - u + totalI;
    const du = a * (b * v - u);

    let nextV = v + DT * dv;
    let nextU = u + DT * du;
    let plotV = nextV;

    if (nextV >= 30) {
      plotV = 30;
      nextV = c;
      nextU = nextU + d;
    }

    const nextState = { v: nextV, u: nextU, t: t + DT };
    const newPoint = { 
      time: Number(nextState.t.toFixed(1)), 
      v: plotV, 
      u: nextU, 
      current1: stimulusI1, 
      current2: stimulusI2, 
      totalCurrent: totalI 
    };

    historyRef.current = [...historyRef.current, newPoint].slice(-MAX_DATA_POINTS);
    stateRef.current = nextState;

    if (Math.round(nextState.t / DT) % 50 === 0) {
      setActivePulses1(prev => prev.filter(p => p.endTime > currentTime));
      setActivePulses2(prev => prev.filter(p => p.endTime > currentTime));
    }

    // Always update visual state for every call to advanceSimulation
    setState(nextState);
    setHistory([...historyRef.current]);
  }, [baseCurrent]);

  const resetSimulation = () => {
    stateRef.current = { v: INITIAL_V, u: INITIAL_U, t: 0 };
    historyRef.current = [];
    setActivePulses1([]);
    setActivePulses2([]);
    setHistory([]);
    setState(stateRef.current);
  };

  const changeNeuronType = (type: NeuronType) => {
    setNeuronType(type);
    setParams(PRESET_PARAMS[type]);
    resetSimulation();
  };

  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      if (isPlaying) {
        advanceSimulation();
      }
      animationFrame = requestAnimationFrame(loop);
    };
    animationFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, advanceSimulation]);

  const handleStep = () => {
    setIsPlaying(false);
    advanceSimulation();
  };

  const triggerPulse1 = () => {
    const startTime = stateRef.current.t + 1;
    const newPulses: Pulse[] = [];
    for (let i = 0; i < pulseCount1; i++) {
      const pStart = startTime + (i * pulseInterval1);
      newPulses.push({ startTime: pStart, endTime: pStart + pulseDuration1, intensity: pulseIntensity1 });
    }
    setActivePulses1(prev => [...prev, ...newPulses]);
  };

  const triggerPulse2 = () => {
    const startTime = stateRef.current.t + 1;
    const newPulses: Pulse[] = [];
    for (let i = 0; i < pulseCount2; i++) {
      const pStart = startTime + (i * pulseInterval2);
      newPulses.push({ startTime: pStart, endTime: pStart + pulseDuration2, intensity: pulseIntensity2 });
    }
    setActivePulses2(prev => [...prev, ...newPulses]);
  };

  const triggerBoth = () => {
    const baseStartTime = stateRef.current.t + 1;
    
    const newPulses1: Pulse[] = [];
    for (let i = 0; i < pulseCount1; i++) {
      const pStart = baseStartTime + (i * pulseInterval1);
      newPulses1.push({ startTime: pStart, endTime: pStart + pulseDuration1, intensity: pulseIntensity1 });
    }
    setActivePulses1(prev => [...prev, ...newPulses1]);

    const newPulses2: Pulse[] = [];
    for (let i = 0; i < pulseCount2; i++) {
      const pStart = baseStartTime + combinedDelay + (i * pulseInterval2);
      newPulses2.push({ startTime: pStart, endTime: pStart + pulseDuration2, intensity: pulseIntensity2 });
    }
    setActivePulses2(prev => [...prev, ...newPulses2]);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-200">
      <aside className="w-full lg:w-96 p-6 border-r border-slate-800 space-y-6 flex-shrink-0 bg-slate-900/50 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="text-blue-400 w-8 h-8" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Neuron Lab</h1>
        </div>

        <section className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Simulation</h2>
            <div className="flex gap-2">
              <button onClick={() => setIsPlaying(!isPlaying)} className={`p-2 rounded-lg transition-all ${isPlaying ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`} title={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={handleStep} className="p-2 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 transition-all" title="Step Forward">
                <StepForward className="w-5 h-5" />
              </button>
              <button onClick={resetSimulation} className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors" title="Reset">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Model Dynamics
            <ParameterTooltip text="Select a specific Izhikevich model behavior. Each type defines a different neuronal firing pattern found in the brain." />
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(NeuronType).map((type) => (
              <button key={type} onClick={() => changeNeuronType(type)} className={`text-[11px] font-medium px-2 py-2.5 rounded-xl border transition-all ${neuronType === type ? 'bg-blue-600/20 border-blue-500 text-blue-100' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-emerald-900/10 border border-emerald-800/30 p-5 rounded-2xl space-y-4 shadow-lg shadow-emerald-900/10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 flex items-center gap-2"><Zap className="w-3 h-3" /> Input 1 (Burst)</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500 uppercase">
                  Intensity
                  <ParameterTooltip text="Amplitude of current injected (pA). Positive values depolarize (excite), negative hyperpolarize (inhibit)." />
                </label>
                <span className="text-[10px] font-mono text-emerald-400">{pulseIntensity1}</span>
              </div>
              <input type="range" min="-30" max="30" step="1" value={pulseIntensity1} onChange={(e) => setPulseIntensity1(parseInt(e.target.value))} className="w-full h-1.5 accent-emerald-500" />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Count
                  <ParameterTooltip text="Total number of discrete pulses delivered in this burst sequence." />
                </label>
                <input type="number" min="1" max="20" value={pulseCount1} onChange={e => setPulseCount1(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-emerald-300" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Dur (ms)
                  <ParameterTooltip text="Length of time (ms) for which each individual pulse remains active." />
                </label>
                <input type="number" min="1" max="100" value={pulseDuration1} onChange={e => setPulseDuration1(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-emerald-300" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Gap (ms)
                  <ParameterTooltip text="Time interval (ms) between the end of one pulse and the start of the next within the burst." />
                </label>
                <input type="number" min="1" max="100" value={pulseInterval1} onChange={e => setPulseInterval1(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-emerald-300" />
              </div>
            </div>
            
            <button onClick={triggerPulse1} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-transform active:scale-95">Trigger Burst 1</button>
          </div>
        </section>

        <section className="bg-rose-900/10 border border-rose-800/30 p-5 rounded-2xl space-y-4 shadow-lg shadow-rose-900/10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-400 flex items-center gap-2"><Zap className="w-3 h-3" /> Input 2 (Burst)</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500 uppercase">
                  Intensity
                  <ParameterTooltip text="Amplitude of current for Input 2. Useful for testing interactions between two different sources." />
                </label>
                <span className="text-[10px] font-mono text-rose-400">{pulseIntensity2}</span>
              </div>
              <input type="range" min="-30" max="30" step="1" value={pulseIntensity2} onChange={(e) => setPulseIntensity2(parseInt(e.target.value))} className="w-full h-1.5 accent-rose-500" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">Count</label>
                <input type="number" min="1" max="20" value={pulseCount2} onChange={e => setPulseCount2(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-rose-300" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">Dur (ms)</label>
                <input type="number" min="1" max="100" value={pulseDuration2} onChange={e => setPulseDuration2(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-rose-300" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">Gap (ms)</label>
                <input type="number" min="1" max="100" value={pulseInterval2} onChange={e => setPulseInterval2(parseInt(e.target.value) || 1)} className="bg-slate-950 border border-slate-800 rounded-lg p-1.5 w-full text-[11px] font-mono text-rose-300" />
              </div>
            </div>

            <button onClick={triggerPulse2} className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-transform active:scale-95">Trigger Burst 2</button>
          </div>
        </section>

        <section className="bg-indigo-900/20 border border-indigo-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 flex items-center gap-2"><Layers className="w-3 h-3" /> Summation Control</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-slate-500 uppercase">
                  Input 2 Delay (ms)
                  <ParameterTooltip text="Temporal offset (ms) of Input 2 relative to Input 1. Short delays facilitate temporal summation." />
                </label>
                <span className="text-[10px] font-mono text-indigo-300">{combinedDelay} ms</span>
              </div>
              <input type="range" min="0" max="200" step="1" value={combinedDelay} onChange={(e) => setCombinedDelay(parseInt(e.target.value))} className="w-full h-1.5 accent-indigo-500" />
            </div>
            <button onClick={triggerBoth} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-900/30 active:scale-95 transition-all">
              Trigger Combined Trains
            </button>
            <p className="text-[9px] text-slate-500 text-center italic">Tests spatial and temporal summation of bursts.</p>
          </div>
        </section>

        <section className="space-y-4 pt-4 border-t border-slate-800">
           <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Decay (a)
                  <ParameterTooltip text="Timescale of the recovery variable 'u'. Smaller values imply slower recovery." />
                </label>
                <input type="number" step="0.01" value={params.a} onChange={e => setParams({...params, a: parseFloat(e.target.value)})} className="bg-slate-800/50 border border-slate-700 rounded-md p-1.5 w-full text-[11px] font-mono" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Reset (c)
                  <ParameterTooltip text="The membrane potential (mV) to which the neuron resets immediately after an action potential." />
                </label>
                <input type="number" step="1" value={params.c} onChange={e => setParams({...params, c: parseFloat(e.target.value)})} className="bg-slate-800/50 border border-slate-700 rounded-md p-1.5 w-full text-[11px] font-mono" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Recov (d)
                  <ParameterTooltip text="Refractory factor. The amount the recovery variable 'u' increases by after a spike." />
                </label>
                <input type="number" step="0.5" value={params.d} onChange={e => setParams({...params, d: parseFloat(e.target.value)})} className="bg-slate-800/50 border border-slate-700 rounded-md p-1.5 w-full text-[11px] font-mono" />
              </div>
              <div>
                <label className="text-[9px] uppercase text-slate-500 block mb-1">
                  Base I
                  <ParameterTooltip text="Continuous background current (pA) injected into the neuron." />
                </label>
                <input type="number" step="0.5" value={baseCurrent} onChange={e => setBaseCurrent(parseFloat(e.target.value))} className="bg-slate-800/50 border border-slate-700 rounded-md p-1.5 w-full text-[11px] font-mono" />
              </div>
           </div>
        </section>
      </aside>

      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6 h-screen overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 flex-shrink-0">
           <div>
             <div className="flex items-center gap-2 text-blue-400 mb-1">
               <Activity className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-widest">Physics Core</span>
             </div>
             <h2 className="text-4xl font-black text-white tracking-tight">Membrane Dynamics</h2>
             <p className="text-slate-400 text-sm mt-1">Real-time simulation of the integrative property of neurons.</p>
           </div>
           
           <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
              <div className="bg-slate-950 px-6 py-4 rounded-xl text-center border border-slate-800/50">
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Potential</div>
                <div className={`text-2xl font-mono font-black ${state.v > -45 ? 'text-amber-400' : 'text-blue-400'}`}>
                   {state.v.toFixed(1)}<span className="text-xs ml-0.5">mV</span>
                </div>
              </div>
              <div className="bg-slate-950 px-6 py-4 rounded-xl text-center border border-slate-800/50">
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Input I</div>
                <div className="text-2xl font-mono font-black text-white">
                   {(current1Ref.current + current2Ref.current + baseCurrent).toFixed(1)}<span className="text-xs ml-0.5">pA</span>
                </div>
              </div>
           </div>
        </div>

        <section className="flex-shrink-0">
          <IonChannelVisualizer v={state.v} />
        </section>

        <div className="h-96 bg-slate-900/30 rounded-[2.5rem] border border-slate-800/60 p-6 relative overflow-hidden flex-shrink-0 shadow-inner">
           <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={history}>
               <CartesianGrid strokeDasharray="1 4" stroke="#334155" vertical={false} />
               <XAxis dataKey="time" hide />
               <YAxis domain={[-90, 50]} stroke="#475569" tickFormatter={(val) => `${val}mV`} fontSize={10} fontWeight="bold" />
               <ChartTooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
               <Legend wrapperStyle={{ paddingTop: '10px' }} fontSize={10} />
               <ReferenceArea y1={-55} y2={-54.5} fill="#f59e0b" fillOpacity={0.15} />
               <ReferenceArea y1={-70} y2={-70.2} fill="#3b82f6" fillOpacity={0.1} />
               
               <Line type="monotone" name="Potential (v)" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
               {/* Reduced visibility: thinner (strokeWidth=1) and lower opacity (strokeOpacity=0.3) */}
               <Line type="monotone" name="Recovery (u)" dataKey="u" stroke="#f472b6" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
               <Line type="stepAfter" name="Input 1" dataKey="current1" stroke="#10b981" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false} />
               <Line type="stepAfter" name="Input 2" dataKey="current2" stroke="#f43f5e" strokeWidth={1} strokeOpacity={0.5} dot={false} isAnimationActive={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 flex-shrink-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Temporal Summation
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              When multiple pulses arrive in rapid succession, the membrane potential doesn't have time to return to rest. Each subsequent pulse builds upon the previous one's residual potential.
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Spatial Summation
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              By using "Trigger Combined Trains", you simulate two different synaptic inputs (Input 1 and 2) arriving at the cell body. If the delay is short, their combined current can push the neuron over the firing threshold.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
