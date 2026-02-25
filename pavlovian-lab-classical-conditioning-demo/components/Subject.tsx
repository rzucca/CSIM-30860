
import React from 'react';

interface SubjectProps {
  isExcited: boolean;
  isSalivating: boolean;
  isBelling: boolean;
}

const PavlovFigure = () => (
  <div className="relative flex flex-col items-center">
    <svg width="80" height="120" viewBox="0 0 80 120" className="drop-shadow-md">
      {/* Body / Lab Coat */}
      <rect x="25" y="55" width="30" height="55" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M40 55V110" stroke="#CBD5E1" strokeWidth="1" />
      
      {/* Face */}
      <circle cx="40" cy="35" r="15" fill="#FFD6A5" />
      
      {/* White Beard */}
      <path d="M28 42C28 52 34 60 40 60C46 60 52 52 52 42" fill="white" stroke="#E2E8F0" strokeWidth="1" />
      
      {/* Hair (White) */}
      <path d="M25 35C25 22 30 18 40 18C50 18 55 22 55 35" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" />
      
      {/* Eyes */}
      <circle cx="35" cy="35" r="1.5" fill="#1E293B" />
      <circle cx="45" cy="35" r="1.5" fill="#1E293B" />
      
      {/* Small details on lab coat */}
      <rect x="45" y="65" width="6" height="4" rx="1" fill="#E2E8F0" />
    </svg>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 opacity-60">
      Ivan Pavlov
    </div>
  </div>
);

const Subject: React.FC<SubjectProps> = ({ isExcited, isSalivating, isBelling }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border-4 border-slate-100 h-80 transition-all duration-300">
      {/* Visual background effect for stimulations */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isBelling ? 'bg-yellow-100 opacity-30' : 'opacity-0'}`}></div>
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isExcited ? 'bg-orange-100 opacity-30' : 'opacity-0'}`}></div>

      <div className="flex items-end gap-12 relative z-10">
        {/* Pavlov Scientist Figure */}
        <div className="flex flex-col items-center group relative">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <PavlovFigure />
          </div>
          {/* Scientific Tool (Clipboard) */}
          <div className="absolute -left-6 top-10 text-3xl rotate-[-15deg] group-hover:rotate-0 transition-transform">📋</div>
        </div>

        {/* The Dog Sprite */}
        <div className="flex flex-col items-center">
          <div className="text-8xl transition-transform duration-200 origin-bottom" style={{ transform: isExcited ? 'scale(1.1) rotate(5deg)' : 'scale(1)' }}>
            🐕
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1 opacity-60">
            Subject 001
          </div>
        </div>
      </div>

      {/* Salivation Visual */}
      {isSalivating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 flex space-x-2">
          <div className="text-4xl animate-salivate">💧</div>
          <div className="text-4xl animate-salivate delay-150">💧</div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="mt-8 flex gap-4">
        <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${isBelling ? 'bg-yellow-400 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          Bell (NS/CS)
        </div>
        <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-colors ${isExcited ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          Excited (UCR/CR)
        </div>
      </div>
    </div>
  );
};

export default Subject;
