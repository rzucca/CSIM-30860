
import React from 'react';
import { Network, Info, ArrowRight, Zap, RefreshCw } from 'lucide-react';

const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Network size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cerebellar Circuit Architecture</h3>
            <p className="text-[10px] text-slate-500 font-medium">Dual-Pathway Adaptive Filter Model</p>
          </div>
        </div>
      </div>

      <div className="relative h-80 bg-slate-50/50 rounded-2xl border border-slate-200 p-4 flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
          {/* Definitions for arrow markers */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
            <marker id="arrowhead-indigo" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
            </marker>
          </defs>

          {/* Path 1: Direct Pathway (Reflex) */}
          <g>
            <rect x="50" y="210" width="40" height="30" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
            <text x="70" y="230" textAnchor="middle" fontSize="12" fontWeight="900" fill="#b91c1c">US</text>
            <text x="70" y="255" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8">Unconditioned Stim.</text>

            <line x1="90" y1="225" x2="330" y2="225" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowhead-red)" />
            <text x="210" y="220" textAnchor="middle" fontSize="8" fontWeight="black" fill="#ef4444" className="uppercase tracking-tighter">Direct Pathway (g_us_b)</text>
          </g>

          {/* Path 2: Indirect Pathway (Cerebellar) */}
          <g>
            {/* CS Input */}
            <rect x="50" y="40" width="40" height="30" rx="4" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="1.5" />
            <text x="70" y="60" textAnchor="middle" fontSize="12" fontWeight="900" fill="#0369a1">CS</text>
            <text x="70" y="85" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8">Conditioned Stim.</text>

            {/* CS -> Cortex (C) */}
            <line x1="90" y1="55" x2="180" y2="55" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <rect x="180" y="30" width="80" height="50" rx="8" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
            <text x="220" y="55" textAnchor="middle" fontSize="14" fontWeight="900" fill="#4338ca">C</text>
            <text x="220" y="70" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6366f1">Cortex</text>

            {/* Cortex (C) -> Nucleus (N) */}
            <line x1="220" y1="80" x2="220" y2="120" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <rect x="180" y="120" width="80" height="50" rx="8" fill="#fff" stroke="#4f46e5" strokeWidth="2" />
            <text x="220" y="145" textAnchor="middle" fontSize="14" fontWeight="900" fill="#4338ca">N</text>
            <text x="220" y="160" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6366f1">Nucleus</text>

            {/* Nucleus (N) -> Brainstem (B) */}
            <path d="M 260,145 Q 370,145 370,200" fill="none" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowhead-indigo)" />
            <text x="315" y="140" textAnchor="middle" fontSize="8" fontWeight="black" fill="#4f46e5" className="uppercase tracking-tighter">Indirect Pathway (g_cs_b)</text>
          </g>

          {/* Common Pathway Output */}
          <g>
            {/* Brainstem (B) */}
            <rect x="330" y="200" width="80" height="50" rx="8" fill="#fff" stroke="#1e293b" strokeWidth="2" />
            <text x="370" y="225" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1e293b">B</text>
            <text x="370" y="240" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">Brainstem</text>

            {/* Brainstem (B) -> Plant (P) */}
            <line x1="410" y1="225" x2="480" y2="225" stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <rect x="480" y="200" width="80" height="50" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
            <text x="520" y="225" textAnchor="middle" fontSize="14" fontWeight="900" fill="#475569">P</text>
            <text x="520" y="240" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b">Motor Plant</text>
            
            <line x1="560" y1="225" x2="590" y2="225" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="575" y="215" textAnchor="middle" fontSize="9" fontWeight="black" fill="#1e293b">BLINK</text>
          </g>

          {/* Learning Signal: Inferior Olive (O) */}
          <g>
            {/* Olive (O) Box */}
            <rect x="330" y="30" width="80" height="50" rx="8" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
            <text x="370" y="55" textAnchor="middle" fontSize="14" fontWeight="900" fill="#b91c1c">O</text>
            <text x="370" y="70" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444">Inferior Olive</text>

            {/* US Drive to Olive */}
            <path d="M 70,210 Q 70,15 330,55" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrowhead-red)" />
            <text x="120" y="20" textAnchor="middle" fontSize="8" fontWeight="black" fill="#ef4444" className="uppercase tracking-tighter">Error Drive (g_us_o)</text>

            {/* Nucleus Feedback to Olive */}
            <path d="M 220,120 Q 220,55 330,55" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrowhead-indigo)" />
            <text x="275" y="110" textAnchor="middle" fontSize="8" fontWeight="black" fill="#4f46e5" className="uppercase tracking-tighter">Feedback (g_cs_o)</text>

            {/* Error signal (O) to Cortex (C) */}
            <line x1="330" y1="55" x2="260" y2="55" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" markerEnd="url(#arrowhead-red)" />
            <text x="300" y="50" textAnchor="middle" fontSize="8" fontWeight="black" fill="#ef4444">LEARNING SIGNAL</text>
          </g>
        </svg>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-red-500" /> Path 1: Direct Reflex
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The <strong>Unconditioned Stimulus (US)</strong> triggers a rapid reflex by directly driving premotor sites in the <strong>Brainstem (B)</strong>, which in turn drive the <strong>Motor Plant (P)</strong> to produce an eyeblink.
          </p>
        </div>
        <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100 space-y-3">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={12} className="text-indigo-600" /> Path 2: Indirect Learning
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The <strong>Conditioned Stimulus (CS)</strong> is expanded into temporal components in the <strong>Cortex (C)</strong>. Its output is routed through the <strong>Nucleus (N)</strong> to converge with the direct pathway in the Brainstem.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 flex gap-4 items-center">
        <Info size={18} className="text-red-500 shrink-0" />
        <p className="text-[10px] text-red-800 font-medium leading-tight">
          <strong>Inferior Olive (O) Comparison:</strong> Learning occurs in the Cortex when the Olive detects a mismatch between the US drive and the inhibitory feedback from the Nucleus (Cerebellar Output).
        </p>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
