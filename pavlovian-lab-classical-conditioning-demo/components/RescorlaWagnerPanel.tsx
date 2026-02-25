
import React from 'react';
import { Sigma, Zap, Target, HelpCircle } from 'lucide-react';
import { TrainingEvent } from '../types';

interface RescorlaWagnerPanelProps {
  history: TrainingEvent[];
  currentStrength: number;
  alpha: number;
  beta: number;
  lambda: number;
  setLambda: (v: number) => void;
}

const RescorlaWagnerPanel: React.FC<RescorlaWagnerPanelProps> = ({ history, currentStrength, alpha, beta, lambda, setLambda }) => {
  const lastTrial = history[history.length - 1];
  const predictionError = lastTrial?.predictionError ?? 0;
  
  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <Sigma size={14} /> Rescorla-Wagner Engine
        </h3>
        <div className="group relative">
          <HelpCircle size={14} className="text-slate-600 cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-800 rounded-xl text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700 shadow-2xl">
            The model states that learning occurs only when there is "surprise" — a discrepancy between what is expected and what actually occurs.
          </div>
        </div>
      </div>

      <div className="mb-8 font-mono text-center">
        <div className="text-xl font-bold tracking-tighter text-slate-300">
          ΔV = αβ(λ - ΣV)
        </div>
        <div className="text-[9px] text-slate-500 mt-2 flex justify-center gap-4">
          <span>α: {alpha.toFixed(2)}</span>
          <span>β: {beta.toFixed(2)}</span>
          <span>λ: {lambda}%</span>
        </div>
        <div className="mt-4 px-2 space-y-3">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Learning is driven by <span className="text-indigo-400 font-bold">prediction error</span>. 
            The change in association (<span className="text-slate-200">ΔV</span>) depends on the "surprise" 
            factor—the gap between what is expected (<span className="text-slate-200">ΣV</span>) and 
            what actually occurs (<span className="text-slate-200">λ</span>).
          </p>
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800/50">
            <p className="text-[9px] text-slate-500 leading-tight">
              <span className="text-indigo-400 font-bold">α (CS Salience):</span> How noticeable the bell/tone is to the subject.
            </p>
            <p className="text-[9px] text-slate-500 leading-tight">
              <span className="text-indigo-400 font-bold">β (US Salience):</span> How significant the food/airpuff is to the subject.
            </p>
            <p className="text-[9px] text-slate-500 leading-tight">
              <span className="text-indigo-400 font-bold">λ (Asymptote):</span> The maximum possible associative strength.
            </p>
          </div>
          
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
              <span>Asymptote (λ)</span>
              <span className="text-indigo-400">{lambda}%</span>
            </div>
            <input 
              type="range" min="0" max="100" step="5" 
              value={lambda} onChange={(e) => setLambda(Number(e.target.value))} 
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Prediction Error (λ - ΣV)</span>
            <span className={`text-xs font-mono font-bold ${predictionError > 0 ? 'text-orange-400' : predictionError < 0 ? 'text-blue-400' : 'text-slate-500'}`}>
              {predictionError > 0 ? '+' : ''}{predictionError.toFixed(1)}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
             <div className="w-1/2 flex justify-end">
               {predictionError < 0 && (
                 <div 
                   className="h-full bg-blue-500 rounded-l-full" 
                   style={{ width: `${Math.min(100, Math.abs(predictionError))}%` }}
                 ></div>
               )}
             </div>
             <div className="w-1/2">
               {predictionError > 0 && (
                 <div 
                   className="h-full bg-orange-500 rounded-r-full" 
                   style={{ width: `${Math.min(100, predictionError)}%` }}
                 ></div>
               )}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Target size={12} />
              <span className="text-[9px] font-bold uppercase">Expected (ΣV)</span>
            </div>
            <p className="text-lg font-mono font-bold text-slate-300">{Math.round(currentStrength)}%</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Zap size={12} />
              <span className="text-[9px] font-bold uppercase">Update (ΔV)</span>
            </div>
            <p className="text-lg font-mono font-bold text-indigo-400">
              {lastTrial ? (alpha * beta * predictionError).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
           <p className="text-[10px] text-slate-500 leading-tight italic">
            {predictionError > 10 
              ? "High Surprise: Rapid association forming as reality exceeds expectation." 
              : predictionError < -10 
              ? "Over-expectation: Extinction occurs as the expected US does not arrive."
              : "Stability: Prediction matches reality. Minimal learning taking place."}
           </p>
        </div>
      </div>
    </div>
  );
};

export default RescorlaWagnerPanel;
