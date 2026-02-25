
import React, { useMemo, useEffect, useState } from 'react';
import { Layers, Info, ArrowRight, LineChart as ChartIcon, Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TrainingEvent } from '../types';

interface BlockingPanelProps {
  vA: number;
  vB: number;
  history: TrainingEvent[];
  onTrainA: () => void;
  onTrainAB: () => void;
  onTestA: () => void;
  onTestB: () => void;
  onReset: () => void;
}

const BlockingPanel: React.FC<BlockingPanelProps> = ({ vA, vB, history, onTrainA, onTrainAB, onTestA, onTestB, onReset }) => {
  const totalV = vA + vB;
  const surprise = Math.max(0, 100 - totalV);
  const [pulse, setPulse] = useState(false);

  // Trigger visual pulse when history changes
  useEffect(() => {
    if (history.length > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [history.length]);

  // Determine what the "Response Magnitude" should be based on the last trial
  const lastTrialResponse = useMemo(() => {
    if (history.length === 0) return 0;
    const last = history[history.length - 1];
    // In a test trial or paired trial, the CR magnitude is driven by the V of the active stimuli
    return last.strength || 0;
  }, [history]);

  // Process history for the chart
  const chartData = useMemo(() => {
    const blockingTrials = history.filter(h => h.type.startsWith('BLOCKING'));
    return blockingTrials.map((h, i) => ({
      trial: i + 1,
      vA: h.strengthA || 0,
      vB: h.strengthB || 0,
      type: h.type
    }));
  }, [history]);

  const phase1End = useMemo(() => {
    let lastIdx = -1;
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (chartData[i].type === 'BLOCKING_A') {
        lastIdx = i;
        break;
      }
    }
    return lastIdx !== -1 ? chartData[lastIdx].trial : 0;
  }, [chartData]);

  const phase2End = useMemo(() => {
    let lastIdx = -1;
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (chartData[i].type === 'BLOCKING_AB') {
        lastIdx = i;
        break;
      }
    }
    return lastIdx !== -1 ? chartData[lastIdx].trial : 0;
  }, [chartData]);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kamin Blocking Simulator</h2>
          <p className="text-slate-500 text-sm">Visualizing the sharing of associative strength.</p>
        </div>
        <button onClick={onReset} className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-2">
          Reset Experiment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ChartIcon size={14} /> Learning Curve: V_A vs V_B
            </h3>
            <div className="flex gap-4 text-[9px] font-bold uppercase">
              <span className="flex items-center gap-1 text-orange-500"><div className="w-2 h-2 rounded-full bg-orange-500"></div> CS_A (Light)</span>
              <span className="flex items-center gap-1 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> CS_B (Tone)</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="trial" fontSize={10} stroke="#94a3b8" />
                <YAxis domain={[0, 110]} fontSize={10} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                
                {phase1End > 0 && (
                  <ReferenceArea {...({ x1: 1, x2: phase1End, fill: "#fff7ed", fillOpacity: 0.6, label: { value: 'PHASE I', position: 'top', fill: '#c2410c', fontSize: 9, fontWeight: 'bold' } } as any)} />
                )}
                {phase2End > phase1End && (
                  <ReferenceArea {...({ x1: phase1End, x2: phase2End, fill: "#eef2ff", fillOpacity: 0.6, label: { value: 'PHASE II', position: 'top', fill: '#4338ca', fontSize: 9, fontWeight: 'bold' } } as any)} />
                )}
                {chartData.length > phase2End && phase2End > 0 && (
                  <ReferenceArea {...({ x1: phase2End, x2: chartData.length, fill: "#f8fafc", fillOpacity: 0.6, label: { value: 'PHASE III', position: 'top', fill: '#64748b', fontSize: 9, fontWeight: 'bold' } } as any)} />
                )}

                <Line type="monotone" dataKey="vA" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vB" stroke="#6366f1" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Observed Response Graphical Object */}
        <div className="flex flex-col gap-4">
          <div className={`flex-1 bg-slate-900 rounded-3xl p-6 border-4 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${pulse ? 'border-indigo-500 scale-[1.02] shadow-2xl shadow-indigo-500/20' : 'border-slate-800'}`}>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Activity size={16} className={pulse ? 'text-indigo-400 animate-pulse' : 'text-slate-600'} />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CR Analyzer</span>
            </div>

            {/* Visual Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Circular Background Track */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle 
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * lastTrialResponse) / 100}
                  className={`transition-all duration-1000 ease-out ${lastTrialResponse > 50 ? 'text-indigo-500' : 'text-slate-600'}`}
                />
              </svg>
              {/* Central Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black font-mono tracking-tighter transition-colors ${pulse ? 'text-white' : 'text-slate-400'}`}>
                  {Math.round(lastTrialResponse)}
                </span>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Magnitude</span>
              </div>
            </div>

            {/* Indicator Light */}
            <div className="mt-6 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${lastTrialResponse > 15 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-slate-800'}`}></div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${lastTrialResponse > 15 ? 'text-indigo-400' : 'text-slate-600'}`}>
                {lastTrialResponse > 15 ? 'CR DETECTED' : 'NO RESPONSE'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2 mb-2">
               <Zap size={14} className="text-orange-500" />
               <h4 className="text-[10px] font-black text-slate-400 uppercase">Rescorla Analysis</h4>
             </div>
             <p className="text-[10px] text-slate-600 leading-tight">
               The gauge represents the subject's conditioned response. During Phase III, notice how testing <strong>B</strong> produces almost no response because <strong>A</strong> "blocked" the associative surprise.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-orange-500">
              <span>Stimulus A Value</span>
              <span>{Math.round(vA)}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${vA}%` }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-indigo-500">
              <span>Stimulus B Value</span>
              <span>{Math.round(vB)}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${vB}%` }}></div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">ΣV (Total Expectation)</span>
              <span className="text-lg font-mono font-bold text-slate-700">{Math.round(totalV)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Surprise (λ - ΣV)</span>
              <span className={`text-lg font-mono font-bold ${surprise > 10 ? 'text-orange-600' : 'text-slate-400'}`}>
                {Math.round(surprise)}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-600">1</span>
              Phase I: Acquisition
            </div>
            <button onClick={onTrainA} className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-50 border-2 border-orange-100 hover:border-orange-500 text-orange-700 font-bold transition-all group">
              <span>Train A + Reward</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] text-slate-600">2</span>
              Phase II: Blocking
            </div>
            <button onClick={onTrainAB} className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-500 text-indigo-700 font-bold transition-all group">
              <span>Train (A+B) + Reward</span>
              <Layers size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phase III: Probe Behavior</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onTestA} className="py-2 px-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase hover:bg-slate-50 transition-colors">Test A</button>
              <button onClick={onTestB} className="py-2 px-3 rounded-xl border border-slate-200 text-[10px] font-black uppercase hover:bg-slate-50 transition-colors">Test B</button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-indigo-900 text-white rounded-2xl flex gap-4 items-center">
        <Info size={20} className="shrink-0 text-indigo-300" />
        <p className="text-[11px] font-medium leading-relaxed">
          <strong>Blocking Demonstration:</strong> If Phase I is complete (V_A ~ 100), Phase II results in zero learning for B because the reward is no longer surprising. The CR gauge will show a high peak for A, but a negligible one for B.
        </p>
      </div>
    </div>
  );
};

export default BlockingPanel;
