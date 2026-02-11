
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Zap, ShieldAlert } from 'lucide-react';

const ReLUModule: React.FC = () => {
  const [weight, setWeight] = useState(1.0);
  const [currentInput, setCurrentInput] = useState(1.0);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = -5; i <= 5; i += 0.2) {
      const z = i * weight;
      data.push({
        input: parseFloat(i.toFixed(2)),
        z: parseFloat(z.toFixed(2)),
        output: Math.max(0, z),
      });
    }
    return data;
  }, [weight]);

  const z = currentInput * weight;
  const output = Math.max(0, z);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            ReLU & Sparse Activation
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Rectified Linear Unit (ReLU) is the powerhouse of modern Deep Learning. 
            Unlike earlier neurons that "squash" inputs, ReLU is linear for positive values and zero for negative ones.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-xl">
              <h4 className="text-yellow-400 font-bold text-sm uppercase mb-2">Vanishing Gradients</h4>
              <p className="text-xs text-slate-400">By remaining linear for positive inputs, ReLU avoids the "saturation" problem of Sigmoid, where deep networks stop learning because gradients become zero.</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <h4 className="text-yellow-400 font-bold text-sm uppercase mb-2">Bio-Plausibility</h4>
              <p className="text-xs text-slate-400">Biological neurons are often silent (0 firing rate). ReLU's hard zero for negative inputs mimics this sparse coding, leading to efficient energy use.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-6">Interactive Tuning</h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-slate-400">Input Value (x)</label>
                <span className="text-yellow-400 font-mono font-bold">{currentInput.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="-5" max="5" step="0.1" 
                value={currentInput} onChange={(e) => setCurrentInput(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-slate-400">Synaptic Weight (w)</label>
                <span className="text-yellow-400 font-mono font-bold">{weight.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="-2" max="2" step="0.1" 
                value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div className="flex items-center justify-center gap-8 bg-slate-800/50 p-4 rounded-xl">
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase">Pre-Activation (z)</div>
                <div className={`text-2xl font-black ${z < 0 ? 'text-rose-500' : 'text-slate-300'}`}>{z.toFixed(2)}</div>
              </div>
              <div className="text-slate-600">→</div>
              <div className="text-center">
                <div className="text-xs text-slate-500 uppercase">ReLU Output (y)</div>
                <div className="text-2xl font-black text-emerald-400">{output.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <ShieldAlert className="text-yellow-400" />
          The ReLU Plot
        </h3>
        <div className="flex-grow min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="input" label={{ value: 'Input (x)', position: 'insideBottom', offset: -5, fill: '#64748b' }} stroke="#475569" />
              <YAxis label={{ value: 'Output (y)', angle: -90, position: 'insideLeft', fill: '#64748b' }} stroke="#475569" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fbbf24' }}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <ReferenceLine x={0} stroke="#475569" />
              <ReferenceLine x={currentInput} stroke="#f59e0b" strokeWidth={2} label={{ value: 'x', position: 'top', fill: '#f59e0b' }} />
              <Area type="monotone" dataKey="output" stroke="#f59e0b" fillOpacity={0.2} fill="#f59e0b" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-yellow-900/10 rounded-xl border border-yellow-800/30">
          <p className="text-sm text-yellow-200">
            <span className="font-bold">Crucial Note:</span> When the input is negative, the gradient (slope) is exactly 0. This can lead to "Dying ReLUs" where neurons stop updating entirely. But for positive inputs, the slope is 1, which keeps learning signals strong in deep architectures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReLUModule;
