
import React from 'react';
import { Wind, Volume2 } from 'lucide-react';

interface EyeblinkSubjectProps {
  blinkValue: number; // 0 (open) to 1 (closed)
  isToneActive: boolean;
  isPuffActive: boolean;
  toneFreq: number;
}

const EyeblinkSubject: React.FC<EyeblinkSubjectProps> = ({ blinkValue, isToneActive, isPuffActive, toneFreq }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 h-80 overflow-hidden">
      {/* Background Visualizers */}
      <div className={`absolute inset-0 transition-opacity duration-150 ${isToneActive ? 'bg-cyan-500/10' : 'opacity-0'}`}></div>
      <div className={`absolute inset-0 transition-opacity duration-75 ${isPuffActive ? 'bg-white/10' : 'opacity-0'}`}></div>

      {/* The Eye */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-48 h-24 bg-white rounded-[100%] border-4 border-slate-700 flex items-center justify-center overflow-hidden">
          {/* Pupil and Iris */}
          <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-black rounded-full"></div>
          </div>
          
          {/* Eyelid - Smoothed with direct transform mapping */}
          <div 
            className="absolute inset-0 bg-slate-200 origin-top transition-transform duration-30"
            style={{ transform: `translateY(${(blinkValue * 100) - 100}%)` }}
          ></div>
        </div>
        
        {/* Indicators */}
        <div className="mt-8 flex gap-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${isToneActive ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
            <Volume2 size={12} /> {toneFreq}Hz Tone
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${isPuffActive ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
            <Wind size={12} /> Airpuff
          </div>
        </div>
      </div>

      {/* Pulse rings for Tone */}
      {isToneActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-32 border-2 border-cyan-500/30 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

export default EyeblinkSubject;
