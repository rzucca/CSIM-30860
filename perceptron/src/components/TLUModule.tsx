
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info, Activity, ArrowRight, Binary, Settings } from 'lucide-react';

const TLUModule: React.FC = () => {
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0);
  const [theta, setTheta] = useState(1.5);
  const [w1, setW1] = useState(1.0);
  const [w2, setW2] = useState(1.0);

  const z = (x1 * w1) + (x2 * w2);
  const output = z >= theta ? 1 : 0;
  const biasValue = -theta;

  const chartData = useMemo(() => {
    const data = [];
    for (let i = -0.5; i <= 3.5; i += 0.1) {
      data.push({
        input: i,
        output: i >= theta ? 1 : 0,
      });
    }
    return data;
  }, [theta]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls & Explanation */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="text-blue-400" />
              Biological Foundations
            </h2>
            <p className="text-slate-300 leading-relaxed">
              In 1943, Warren McCulloch and Walter Pitts proposed the first model of an artificial neuron. 
              They were inspired by the <span className="text-blue-400 font-semibold italic">"All-or-Nothing"</span> principle 
              of biological neurons: a cell only fires if the cumulative stimulus exceeds a critical electrical threshold.
            </p>
            <div className="mt-4 p-4 bg-slate-800 rounded-xl border-l-4 border-blue-500 text-sm font-mono">
              <span className="text-slate-500">// Threshold Logic Unit (TLU)</span><br/>
              <code className="text-blue-300">y = (Σ wᵢxᵢ ≥ θ) ? 1 : 0</code>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Binary className="text-blue-400" />
              Interactive TLU
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-around items-center gap-4 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setX1(x1 === 0 ? 1 : 0)}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${x1 ? 'bg-blue-600 scale-110 shadow-lg ring-4 ring-blue-500/20' : 'bg-slate-800 opacity-50 hover:opacity-100'}`}
                >
                  <span className="text-[10px] font-bold uppercase">X1</span>
                  <span className="text-xl font-black">{x1}</span>
                </button>
                <div className="text-slate-700 font-black text-2xl">+</div>
                <button 
                  onClick={() => setX2(x2 === 0 ? 1 : 0)}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${x2 ? 'bg-blue-600 scale-110 shadow-lg ring-4 ring-blue-500/20' : 'bg-slate-800 opacity-50 hover:opacity-100'}`}
                >
                  <span className="text-[10px] font-bold uppercase">X2</span>
                  <span className="text-xl font-black">{x2}</span>
                </button>
                <div className="text-slate-700 font-black text-2xl">=</div>
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${output ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700 text-slate-600'}`}>
                  <span className="text-[10px] font-bold uppercase">FIRE</span>
                  <span className="text-xl font-black">{output}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Biological Threshold (θ)</label>
                    <span className="text-rose-400 font-mono font-bold">{theta.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="3" step="0.1" 
                    value={theta} onChange={(e) => setTheta(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Weight w1</label>
                    <input 
                      type="number" step="0.1" value={w1} onChange={(e) => setW1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 rounded px-2 py-1 text-sm border border-slate-700 text-blue-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Weight w2</label>
                    <input 
                      type="number" step="0.1" value={w2} onChange={(e) => setW2(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 rounded px-2 py-1 text-sm border border-slate-700 text-blue-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Function Plot */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-emerald-400" />
            Step Function (Activation)
          </h3>
          <div className="flex-grow min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="input" label={{ value: 'Weighted Sum (z)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} stroke="#475569" />
                <YAxis domain={[0, 1.2]} label={{ value: 'Output (y)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} stroke="#475569" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <ReferenceLine x={theta} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'θ', position: 'top', fill: '#f43f5e', fontSize: 14, fontWeight: 'bold' }} />
                <ReferenceLine x={z} stroke="#10b981" strokeWidth={3} label={{ value: `z=${z.toFixed(1)}`, position: 'insideTopLeft', fill: '#10b981', fontSize: 12 }} />
                <Area type="stepAfter" dataKey="output" stroke="#3b82f6" fillOpacity={0.2} fill="#3b82f6" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-blue-900/10 rounded-xl border border-blue-800/30">
            <p className="text-xs text-blue-200">
              <span className="font-bold">Mechanism:</span> The output remains 0 until the summed input <span className="font-mono">z</span> crosses the threshold <span className="font-mono text-rose-400">θ</span>. This discrete jump allows simple "AND" and "OR" logic implementation.
            </p>
          </div>
        </div>
      </div>

      {/* The Bias Evolution Panel */}
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Settings size={120} className="text-blue-400 rotate-12" />
        </div>
        
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
          <Settings className="text-blue-400" />
          The Bias Transformation: From Bio to Math
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-center">
          {/* Logic 1: The Bio View */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Biological Concept</div>
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 w-full text-center">
              <div className="text-lg font-bold text-blue-400 mb-2">Σ wᵢxᵢ ≥ θ</div>
              <p className="text-xs text-slate-400">The neuron must "reach" an external threshold to fire.</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <ArrowRight className="text-blue-400" size={32} />
            </div>
          </div>

          {/* Logic 2: The Math View */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Engineering Reality</div>
            <div className="bg-slate-950 rounded-2xl p-6 border border-emerald-900/30 w-full text-center">
              <div className="text-lg font-bold text-emerald-400 mb-2">Σ wᵢxᵢ + b ≥ 0</div>
              <p className="text-xs text-slate-400">The threshold is moved inside as a <span className="font-bold underline italic text-emerald-500">Bias Unit</span>.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Architecture Visualization</h4>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 h-64 flex items-center justify-center">
                 <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Lines */}
                    <line x1="80" y1="40" x2="200" y2="100" stroke="#3b82f6" strokeWidth="2" opacity="0.4" />
                    <line x1="80" y1="160" x2="200" y2="100" stroke="#3b82f6" strokeWidth="2" opacity="0.4" />
                    <line x1="80" y1="100" x2="200" y2="100" stroke="#f43f5e" strokeWidth="4" strokeDasharray="4 2" />
                    
                    {/* Input Nodes */}
                    <circle cx="80" cy="40" r="15" fill="#1e293b" stroke="#334155" />
                    <text x="80" y="44" textAnchor="middle" fill="white" fontSize="10">x₁</text>
                    
                    <circle cx="80" cy="160" r="15" fill="#1e293b" stroke="#334155" />
                    <text x="80" y="164" textAnchor="middle" fill="white" fontSize="10">x₂</text>

                    {/* BIAS NODE */}
                    <circle cx="80" cy="100" r="18" fill="#f43f5e" fillOpacity="0.2" stroke="#f43f5e" strokeWidth="2" />
                    <text x="80" y="104" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">1</text>
                    <text x="135" y="90" textAnchor="middle" fill="#f43f5e" fontSize="12" className="font-mono font-bold">b = {biasValue.toFixed(1)}</text>

                    {/* Summation Node */}
                    <circle cx="200" cy="100" r="25" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                    <text x="200" y="105" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Σ</text>

                    {/* Output */}
                    <line x1="225" y1="100" x2="320" y2="100" stroke="#10b981" strokeWidth="3" />
                    <text x="350" y="105" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold">Output</text>
                 </svg>
              </div>
           </div>

           <div className="flex flex-col justify-center space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Why the change?</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                In biological terms, the threshold <span className="text-rose-400 font-bold">θ</span> is a property of the cell membrane. 
                In mathematical learning, it's easier to treat the threshold as just another weight.
              </p>
              <div className="p-4 bg-slate-800/50 rounded-xl space-y-2">
                 <p className="text-xs text-slate-300">
                    By defining <span className="text-emerald-400 font-bold font-mono">b = -θ</span> and adding an input that is always <span className="text-blue-400 font-bold">1</span>, 
                    we can use standard matrix math:
                 </p>
                 <div className="text-center font-mono text-emerald-400 text-sm py-2">
                    z = (w₁x₁ + w₂x₂ + ... + wₙxₙ) + <span className="bg-emerald-500/10 px-1 rounded">b</span>
                 </div>
                 <p className="text-xs text-slate-500 italic">
                    This "bias" allows the model to learn the threshold shift using the same rules it uses for weights.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TLUModule;
