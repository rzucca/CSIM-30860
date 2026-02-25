
import React, { useMemo, useState, useEffect } from 'react';
import { Network, Activity, BarChart3, Zap, Radio, SlidersHorizontal, Microchip, Target, MoveUp, PlayCircle, Pause, Eye, HelpCircle, LineChart as ChartIcon, Info, Hash } from 'lucide-react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, LineChart, ReferenceArea, ReferenceLine } from 'recharts';
import { TrainingEvent } from '../types';

interface CerebellarPanelProps {
  history: TrainingEvent[];
  weights: number[];
  basisFunctions: number[];
  purkinjeOutput: number;
  isTraining: boolean;
  isCSActive: boolean;
  isUSActive: boolean;
  trialType: 'ACQUISITION' | 'PROBE' | 'EXTINCTION' | null;
  trace: any[];
  beta: number;
  isi: number;
  isAutoPlaying: boolean;
  trainingMode: 'ACQUISITION' | 'EXTINCTION';
  setTrainingMode: (v: 'ACQUISITION' | 'EXTINCTION') => void;
  setIsAutoPlaying: (v: boolean) => void;
  onRunTrial: () => void;
  onRunProbe: () => void;
  setBeta: (v: number) => void;
  setIsi: (v: number) => void;
  gains: {
    us_o: number;
    cs_o: number;
    us_b: number;
    cs_b: number;
    c_out: number;
  };
  setGains: {
    us_o: (v: number) => void;
    cs_o: (v: number) => void;
    us_b: (v: number) => void;
    cs_b: (v: number) => void;
    c_out: (v: number) => void;
  };
  params: {
    p0: number;
    c0: number;
    e0: number;
    n0: number;
    m0: number;
    tP: number;
  };
  setParams: {
    p0: (v: number) => void;
    c0: (v: number) => void;
    e0: (v: number) => void;
    n0: (v: number) => void;
    m0: (v: number) => void;
    tP: (v: number) => void;
  };
}

const ParamInput: React.FC<{ 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  className?: string;
  tooltip?: string;
}> = ({ label, value, onChange, className = "", tooltip }) => {
  const [localVal, setLocalVal] = useState(value.toString());

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  return (
    <div className={`space-y-1 ${className}`} title={tooltip}>
      <label className="text-[7px] font-bold text-slate-500 uppercase block tracking-wider flex items-center gap-1">
        {label}
        {tooltip && <Info size={8} className="text-slate-600" />}
      </label>
      <input 
        type="text"
        value={localVal}
        onChange={(e) => {
          setLocalVal(e.target.value);
          const parsed = parseFloat(e.target.value);
          if (!isNaN(parsed)) onChange(parsed);
        }}
        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none focus:border-cyan-500/50"
      />
    </div>
  );
};

const CerebellarPanel: React.FC<CerebellarPanelProps> = ({ 
  history, weights, basisFunctions, purkinjeOutput, isTraining, isCSActive, trialType, trace, beta, isi, 
  isAutoPlaying, trainingMode, setTrainingMode, setIsAutoPlaying, onRunTrial, onRunProbe,
  setBeta, setIsi, gains, setGains, params, setParams 
}) => {
  const [betaInput, setBetaInput] = useState(beta.toExponential(2));
  const [activePlot, setActivePlot] = useState<'ERROR' | 'MOTOR'>('MOTOR');

  // Persistence storage for the three types of traces
  const [acqTrace, setAcqTrace] = useState<any[]>([]);
  const [probeTrace, setProbeTrace] = useState<any[]>([]);
  const [extTrace, setExtTrace] = useState<any[]>([]);

  useEffect(() => {
    if (trace && trace.length > 0) {
      if (trialType === 'ACQUISITION') {
        setAcqTrace([...trace]);
      } else if (trialType === 'PROBE') {
        setProbeTrace([...trace]);
      } else if (trialType === 'EXTINCTION') {
        setExtTrace([...trace]);
      }
    }
  }, [trace, trialType]);

  useEffect(() => {
    setBetaInput(beta.toExponential(2));
  }, [beta]);

  const handleBetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBetaInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setBeta(parsed);
    }
  };

  const representativeGaussians = useMemo(() => {
    const ks = [1, 5, 10, 15, 20];
    const points = 100;
    
    return ks.map(k => {
      const mu_k = 0.05 * k * 1000;
      const sigma_k = mu_k / 5;
      let path = "";
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * 1000;
        const diff = t - mu_k;
        const y = Math.exp(-(diff * diff) / (2 * Math.PI * sigma_k));
        const svgX = (t / 1000) * 100;
        const svgY = 100 - (y * 90);
        path += `${i === 0 ? 'M' : 'L'} ${svgX} ${svgY} `;
      }
      return path;
    });
  }, []);

  const combinedData = useMemo(() => {
    const data: any[] = [];
    for (let t = 0; t <= 1000; t += 10) {
      const aP = acqTrace.find(p => Math.abs(p.time - t) < 5);
      const pP = probeTrace.find(p => Math.abs(p.time - t) < 5);
      const eP = extTrace.find(p => Math.abs(p.time - t) < 5);
      const cP = trace.find(p => Math.abs(p.time - t) < 5);
      
      data.push({
        time: t,
        acqBlink: aP ? aP.blink * 5 : null,
        acqError: aP ? aP.error : null,
        probeBlink: pP ? pP.blink * 5 : null,
        probeError: pP ? pP.error : null,
        extBlink: eP ? eP.blink * 5 : null,
        extError: eP ? eP.error : null,
        currentBlink: cP ? cP.blink * 5 : null,
        currentError: cP ? cP.error : null,
        currentCS: cP ? cP.tone * 5 : 0,
        currentUS: cP ? cP.puff * 5 : 0,
      });
    }
    return data;
  }, [acqTrace, probeTrace, extTrace, trace]);

  // Gaussian Smooth implementation for the plotted lines
  const smoothedData = useMemo(() => {
    const kernel = [0.05, 0.25, 0.4, 0.25, 0.05]; // 5-tap Gaussian-like kernel
    return combinedData.map((d, i, arr) => {
      const smooth = (key: string) => {
        let sum = 0;
        let weightSum = 0;
        for (let j = -2; j <= 2; j++) {
          const idx = i + j;
          if (idx >= 0 && idx < arr.length && arr[idx][key] !== null) {
            sum += arr[idx][key] * kernel[j + 2];
            weightSum += kernel[j + 2];
          }
        }
        return weightSum > 0 ? sum / weightSum : d[key];
      };

      return {
        ...d,
        acqBlink: smooth('acqBlink'),
        probeBlink: smooth('probeBlink'),
        extBlink: smooth('extBlink'),
        currentBlink: smooth('currentBlink'),
        acqError: smooth('acqError'),
        probeError: smooth('probeError'),
        extError: smooth('extError'),
        currentError: smooth('currentError'),
        currentCS: d.currentCS,
        currentUS: d.currentUS,
      };
    });
  }, [combinedData]);

  const cerebellarHistory = useMemo(() => {
    return history.filter(h => h.type.includes('CEREBELLAR'));
  }, [history]);

  // Specific filter for CS-US (Acquisition) and Extinction trials
  const pairedCerebellarHistory = useMemo(() => {
    return history.filter(h => h.type === 'PAIRED_CEREBELLAR' || h.type === 'EXTINCTION_CEREBELLAR');
  }, [history]);

  const waterfallTraces = useMemo(() => {
    return history
      .filter(h => (h.type === 'PAIRED_CEREBELLAR' || h.type === 'EXTINCTION_CEREBELLAR') && h.trace)
      .map(h => ({
        timestamp: h.timestamp,
        trace: h.trace!
      }));
  }, [history]);

  const learningCurveData = useMemo(() => {
    return pairedCerebellarHistory.map((h, i) => ({
      trial: i + 1,
      strength: h.strength
    }));
  }, [pairedCerebellarHistory]);

  const isBlinking = purkinjeOutput < params.n0;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 text-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Configuration */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 group relative">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Network size={14} /> Biophysical Engine
                </h3>
                <HelpCircle size={12} className="text-slate-600 cursor-help" />
                <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
                  A Marr-Albus type model of the cerebellum. It uses basis functions to represent time and synaptic plasticity (LTD/LTP) to learn sensory predictions.
                </div>
              </div>
              {/* Actual Trial Counter Badge - Shows Acquisition / Total */}
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-800/50">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] font-black text-cyan-500 uppercase tracking-tighter">CS-US</span>
                  <span className="text-[10px] font-mono font-black text-cyan-200">{pairedCerebellarHistory.length}</span>
                </div>
                <div className="w-px h-3 bg-cyan-900 mx-1"></div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">TOTAL</span>
                  <span className="text-[10px] font-mono font-black text-slate-400">{cerebellarHistory.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black border transition-all duration-300 ${isCSActive ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                <Radio size={10} /> CS {isCSActive ? 'ON' : 'OFF'}
              </div>
              {trialType && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black border animate-pulse ${trialType === 'ACQUISITION' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : trialType === 'EXTINCTION' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                  {trialType === 'ACQUISITION' ? <PlayCircle size={10} /> : trialType === 'EXTINCTION' ? <Zap size={10} /> : <Eye size={10} />}
                  {trialType === 'ACQUISITION' ? 'ACQ (BLUE)' : trialType === 'EXTINCTION' ? 'EXT (RED)' : 'PROBE (GREEN)'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setTrainingMode('ACQUISITION')}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${trainingMode === 'ACQUISITION' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                Acquisition
              </button>
              <button 
                onClick={() => setTrainingMode('EXTINCTION')}
                className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${trainingMode === 'EXTINCTION' ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-500 hover:bg-slate-800'}`}
              >
                Extinction
              </button>
            </div>
            <div className="flex items-center gap-2 group relative">
              <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isAutoPlaying ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
                title="Automatically run successive training trials to observe learning over time."
              >
                {isAutoPlaying ? <Pause size={10} fill="currentColor" /> : <PlayCircle size={10} />}
                {isAutoPlaying ? 'Stop' : 'Auto-Train'}
              </button>
              <button 
                onClick={onRunTrial}
                disabled={isTraining || isAutoPlaying}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border disabled:opacity-50 disabled:cursor-not-allowed transition-all ${trainingMode === 'ACQUISITION' ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30' : 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'}`}
                title={trainingMode === 'ACQUISITION' ? "Run a single CS-US paired trial to induce learning (LTD)." : "Run a single CS-only trial with learning ON to induce extinction (LTP)."}
              >
                <PlayCircle size={10} /> {trainingMode === 'ACQUISITION' ? 'Run Trial' : 'Run Extinct'}
              </button>
              <button 
                onClick={onRunProbe}
                disabled={isTraining || isAutoPlaying}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Run a CS-only trial to test the current strength of the conditioned response without inducing further learning."
              >
                <Eye size={10} /> Probe CS
              </button>
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3 group relative">
                <SlidersHorizontal size={12} className="text-cyan-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Circuit Gains (g)</span>
                <Info size={10} className="text-slate-600 cursor-help" />
                <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-slate-800 rounded-lg text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-xl">
                  Parameters controlling the strength of connections between neural populations.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ParamInput label="Olive US" value={gains.us_o} onChange={setGains.us_o} tooltip="Strength of the Unconditioned Stimulus (US) drive to the Inferior Olive. Higher values increase the error signal magnitude." />
                <ParamInput label="Olive FB" value={gains.cs_o} onChange={setGains.cs_o} tooltip="Strength of inhibitory feedback from the Nucleus to the Olive. When this feedback matches the US input, learning stabilizes (Surprise is zero)." />
                <ParamInput label="B-Stem US" value={gains.us_b} onChange={setGains.us_b} tooltip="Direct excitatory gain of the US path to the brainstem motor centers. Controls the UR (Unconditioned Response) magnitude." />
                <ParamInput label="B-Stem CS" value={gains.cs_b} onChange={setGains.cs_b} tooltip="Excitatory gain of the CS-driven path (via the Nucleus) to the brainstem. Controls the CR (Conditioned Response) magnitude." />
                <ParamInput label="Purk Out (g_c)" value={gains.c_out} onChange={setGains.c_out} className="col-span-2" tooltip="Output gain of Purkinje cells. Scales how much the reduction in Purkinje inhibition (due to LTD) affects the motor output." />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800" title="The rate at which PF-Purkinje synaptic weights are updated. Controls how fast the subject learns or forgets.">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase mb-2">
                <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> Learning Rate (β) <Info size={8} /></span>
                <span className="text-yellow-400 font-mono text-[9px]">{beta.toExponential(1)}</span>
              </div>
              <input 
                type="text" 
                value={betaInput}
                onChange={handleBetaChange}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-yellow-400 w-full focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3 group relative">
                <Microchip size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Structural Params</span>
                <Info size={10} className="text-slate-600 cursor-help" />
                <div className="absolute left-0 top-full mt-1 w-56 p-2 bg-slate-800 rounded-lg text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-xl">
                  Baseline firing rates and time constants for neurons and motor centers.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ParamInput label="ISI (ms)" value={isi} onChange={setIsi} tooltip="Inter-Stimulus Interval (ms). The time between the start of the CS and the start of the US." />
                <ParamInput label="PF Offset" value={params.p0} onChange={setParams.p0} tooltip="Baseline spontaneous activity of Parallel Fibers (PF). Represents the noise floor of the temporal filter." />
                <ParamInput label="Purk Base" value={params.c0} onChange={setParams.c0} tooltip="Baseline tonic inhibition provided by Purkinje cells to the Nucleus before conditioning." />
                <ParamInput label="Olive Off" value={params.e0} onChange={setParams.e0} tooltip="Spontaneous firing rate of the Inferior Olive. Crucial for establishing the 'Zero Surprise' equilibrium." />
                <ParamInput label="Nuc Thr" value={params.n0} onChange={setParams.n0} tooltip="Threshold of Purkinje firing reduction below which the Nucleus initiates a motor Conditioned Response (CR)." />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Dynamics & Learning Curve */}
        <div className="space-y-6">
           <div className="space-y-2">
            <div className="flex justify-between items-center group relative">
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                <button 
                  onClick={() => setActivePlot('MOTOR')} 
                  className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${activePlot === 'MOTOR' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                >
                  r(t)
                </button>
                <button 
                  onClick={() => setActivePlot('ERROR')} 
                  className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${activePlot === 'ERROR' ? 'bg-red-600 text-white' : 'text-slate-500'}`}
                >
                  e(t)
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Info size={12} className="text-slate-600 cursor-help" />
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[7px] font-black text-blue-400 uppercase tracking-tighter" title="CS+US Acquisition Trace"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ACQ</span>
                  <span className="flex items-center gap-1 text-[7px] font-black text-emerald-400 uppercase tracking-tighter" title="CS-only Probe Trace"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> PROBE</span>
                </div>
              </div>
              <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
                <p className="font-bold text-indigo-400 mb-1">Trial Dynamics</p>
                <p><span className="text-white">r(t):</span> Motor response (blink) over time. Acquisition (Blue) shows the learned response; Probe (Green) shows the response without the US.</p>
                <p className="mt-1"><span className="text-white">e(t):</span> Error signal from the Inferior Olive. Learning reduces this signal as the prediction improves.</p>
              </div>
            </div>

            <div className="h-36 bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden relative" title={activePlot === 'MOTOR' ? "Motor output trace comparing Acquisition (Blue), Extinction (Red) and Probe (Green) trials." : "Error signal trace comparing Acquisition (Blue), Extinction (Red) and Probe (Green) trials."}>
              {acqTrace.length > 0 || probeTrace.length > 0 || extTrace.length > 0 || trace.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={smoothedData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      type="number" 
                      domain={[0, 1000]} 
                      stroke="#475569"
                      fontSize={8}
                      tick={{ fill: '#64748b' }}
                      tickFormatter={(val) => `${val}ms`}
                    />
                    <YAxis 
                      domain={activePlot === 'MOTOR' ? [0, 6.0] : [0.5, 2.5]} 
                      stroke="#475569"
                      fontSize={8}
                      tick={{ fill: '#64748b' }}
                      width={25}
                    />
                    
                    {/* Shaded Background Areas for Stimuli */}
                    {/* CS (Tone) Duration: From 0 to isi+10 */}
                    <ReferenceArea {...({ x1: 0, x2: isi + 10, fill: "#eab308", fillOpacity: 0.03 } as any)} />
                    
                    {/* US (Puff) Duration: From isi to isi+10 */}
                    <ReferenceArea {...({ x1: isi, x2: isi + 10, fill: "#ef4444", fillOpacity: 0.15 } as any)} />

                    {/* Vertical marker for US Onset */}
                    <ReferenceLine 
                      {...({
                        x: isi, 
                        stroke: "#ef4444", 
                        strokeWidth: 1, 
                        strokeDasharray: "3 3", 
                        label: { 
                          value: 'US', 
                          position: 'top', 
                          fill: '#ef4444', 
                          fontSize: 6, 
                          fontWeight: 'bold',
                          letterSpacing: '0.1em'
                        }
                      } as any)} 
                    />

                    {/* Persistent Acquisition Line - Blue - HIDDEN AS REQUESTED but restored for current trial visibility */}
                    <Area 
                      type="monotone" 
                      dataKey={activePlot === 'MOTOR' ? "acqBlink" : "acqError"} 
                      stroke="#3b82f6" 
                      strokeWidth={1} 
                      strokeOpacity={0.4}
                      fill="url(#acqGradient)" 
                      isAnimationActive={false}
                    />
                    
                    {/* Persistent Extinction Line - Red */}
                    <Area 
                      type="monotone" 
                      dataKey={activePlot === 'MOTOR' ? "extBlink" : "extError"} 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      fill="url(#extGradient)" 
                      isAnimationActive={false}
                    />

                    {/* Persistent Probe Line - Green */}
                    <Area 
                      type="monotone" 
                      dataKey={activePlot === 'MOTOR' ? "probeBlink" : "probeError"} 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      fill="url(#probeGradient)" 
                      isAnimationActive={false}
                    />

                    {/* CS Stimulus Trace - Blue */}
                    <Line
                      type="stepAfter"
                      dataKey="currentCS"
                      stroke="#3b82f6"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      isAnimationActive={false}
                    />
                    
                    {/* US Stimulus Trace - Red */}
                    <Line
                      type="stepAfter"
                      dataKey="currentUS"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                      isAnimationActive={false}
                    />

                    {/* CURRENT TRIAL TRACE - Thick White/Yellow Line */}
                    <Line
                      type="monotone"
                      dataKey={activePlot === 'MOTOR' ? "currentBlink" : "currentError"}
                      stroke="#ffffff"
                      strokeWidth={3}
                      dot={false}
                      isAnimationActive={false}
                    />

                    <defs>
                      <linearGradient id="acqGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="extGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="probeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[7px] font-black text-slate-700 uppercase text-center px-4">
                  Awaiting Trial Dynamics...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center group relative">
              <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                <ChartIcon size={12} className="text-emerald-400" /> Training Curve (CS-US)
              </span>
              <Info size={12} className="text-slate-600 cursor-help" />
              <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
                The percentage of Conditioned Response (CR) strength over successive training trials. This follows a sigmoid-like acquisition curve.
              </div>
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">X:0-100 Training Trials | Y:0-100% CR</span>
            </div>
            {/* Fixed Axis Learning Curve Chart - Only CS-US trials plotted */}
            <div className="h-36 bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden relative" title="Learning progress specifically for CS-US training trials.">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learningCurveData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} />
                  <XAxis 
                    dataKey="trial" 
                    type="number" 
                    domain={[0, 100]} 
                    fontSize={7} 
                    stroke="#334155" 
                    tickCount={6}
                    tick={{ fill: '#475569' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    fontSize={7} 
                    stroke="#334155" 
                    tickCount={6}
                    tick={{ fill: '#475569' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="strength" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={learningCurveData.length < 50 ? { r: 1, fill: '#10b981' } : false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              {learningCurveData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-700 uppercase pointer-events-none">
                  Awaiting Training Data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: State & Output */}
        <div className="space-y-6">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 group relative">
            <div className="flex justify-between items-center mb-4">
               <div className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2">
                 <Target size={12} className="text-indigo-400" /> Purkinje c(t)
               </div>
               <div className="flex items-center gap-2">
                 <Info size={10} className="text-slate-600 cursor-help" />
                 <div className={`text-[7px] px-2 py-0.5 rounded font-black uppercase tracking-widest border ${isBlinking ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                   {isBlinking ? 'CR ACTIVE' : 'QUIESCENT'}
                 </div>
               </div>
            </div>
            <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
              The inhibitory output of the cerebellar cortex. Learning (LTD) decreases this firing rate, allowing the Nucleus to disinhibit and trigger a blink.
            </div>
            
            <div className="space-y-4">
               <div className="text-3xl font-mono font-black text-white text-center">{purkinjeOutput.toFixed(4)}</div>
               <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-yellow-500/50 z-20" 
                    style={{ left: `${Math.min(100, params.c0 * 50)}%` }}
                  ></div>
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-green-500/50 z-20" 
                    style={{ left: `${Math.min(100, params.n0 * 50)}%` }}
                  ></div>
                  <div 
                    className={`h-full transition-all duration-75 ${isBlinking ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-600'}`} 
                    style={{ width: `${Math.min(100, purkinjeOutput * 50)}%` }}
                  ></div>
               </div>
            </div>
          </div>

          <div className="space-y-2 group relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                <Activity size={12} className="text-blue-400" /> CR Evolution (Waterfall)
              </span>
              <Info size={12} className="text-slate-600 cursor-help" />
            </div>
            <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
              A waterfall plot showing the motor response (blink) every 10 trials. This visualizes how the CR shifts earlier in time and increases in magnitude as learning progresses.
            </div>
            <div className="h-32 bg-slate-950 p-2 rounded-xl border border-slate-800 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
                {waterfallTraces.map((wt, idx) => {
                  const xOffset = idx * 2; 
                  const yOffset = idx * 3;
                  const points = wt.trace.map(p => {
                    const x = (p.time / 1000) * 800 + 50 + xOffset;
                    const y = 90 - (p.blink * 50) - yOffset;
                    return `${x},${y}`;
                  }).join(' ');
                  return (
                    <polyline 
                      key={wt.timestamp}
                      points={points}
                      fill="none"
                      stroke={`rgba(59, 130, 246, ${0.2 + (idx / waterfallTraces.length) * 0.8})`}
                      strokeWidth="1.5"
                      className="transition-all duration-500"
                    />
                  );
                })}
                {/* Baseline markers */}
                <line x1="50" y1="90" x2="950" y2="90" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
              {waterfallTraces.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-slate-700 uppercase pointer-events-none">
                  Awaiting Milestone Traces (Every 10 Trials)...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 group relative">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                <Activity size={12} className="text-cyan-400" /> Granule Filter Activity
              </span>
              <Info size={12} className="text-slate-600 cursor-help" />
            </div>
            <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
              Granule cell activity patterns that represent time relative to CS onset. They provide the temporal "basis" for learning precisely timed responses.
            </div>
            <div className="h-20 bg-slate-950 p-2 rounded-xl border border-slate-800 relative overflow-hidden" title="Activity of Granule cells acting as a temporal basis filter for the CS.">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {representativeGaussians.map((path, idx) => (
                  <path key={idx} d={path} fill="none" stroke={isCSActive ? "rgba(34,211,238,0.2)" : "rgba(71,85,105,0.1)"} strokeWidth="1" />
                ))}
                <path
                  d={basisFunctions.reduce((acc, bf, i) => {
                    const x = (i / (basisFunctions.length - 1)) * 100;
                    const val = Math.max(0, (bf - params.p0) * 1.5); 
                    const y = 100 - (val * 90);
                    return acc + `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
                  }, "") + "L 100 100 L 0 100 Z"}
                  fill={isCSActive ? "url(#activeGradient)" : "rgba(30,41,59,0.5)"}
                  className="transition-all duration-75"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2 group relative">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                <BarChart3 size={12} className="text-orange-400" /> PF Weights wₖ
              </span>
              <div className="flex items-center gap-2">
                <Info size={12} className="text-slate-600 cursor-help" />
                <span className="text-[8px] font-black text-slate-600 uppercase">k=1 → 20</span>
              </div>
            </div>
            <div className="absolute right-0 top-full mt-1 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
              The adaptive synaptic weights at the Parallel Fiber (PF) to Purkinje cell synapse. Learning (LTD) reduces these weights when CS and US coincide.
            </div>
            
            <div className="h-28 bg-slate-950 p-3 rounded-xl border border-slate-800 relative flex flex-col justify-center" title="The adaptive synaptic weights at the Parallel Fiber (PF) to Purkinje cell synapse.">
              <div className="absolute left-3 right-3 h-px bg-slate-800 top-1/2 z-0"></div>
              <div className="flex items-center gap-[2px] h-full relative z-10">
                {weights.map((w, i) => {
                  const magnitude = Math.min(48, Math.abs(w) * 2500);
                  const isPositive = w >= 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full">
                      <div 
                        className={`w-full rounded-sm transition-all duration-500 absolute ${isPositive ? 'bottom-1/2' : 'top-1/2'} ${isPositive ? 'bg-cyan-400/80' : 'bg-red-500/80'} shadow-sm`}
                        style={{ height: `${magnitude}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[6px] font-black text-slate-600 uppercase tracking-widest px-1">
                <span className="flex items-center gap-1"><MoveUp size={8} /> LTP (+)</span>
                <span className="flex items-center gap-1">LTD (-) <MoveUp size={8} className="rotate-180" /></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex gap-4 items-center justify-between group relative">
        <div className="flex items-center gap-4">
          <Network size={14} className="text-cyan-500 shrink-0" />
          <p className="text-[8px] text-slate-500 leading-tight italic max-w-lg">
            <strong>Training Focus:</strong> The learning curve above specifically isolates CS-US training trials. Probe trials test the model's state without altering the long-term training plot.
          </p>
          <Info size={10} className="text-slate-600 cursor-help" />
        </div>
        <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
          The model distinguishes between <span className="text-blue-400">Acquisition</span> (learning from error) and <span className="text-emerald-400">Probe</span> (testing current state). The learning curve only plots acquisition trials to show long-term progress.
        </div>
        <span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono tracking-widest uppercase">Precision: 1.0ms</span>
      </div>
    </div>
  );
};

export default CerebellarPanel;
