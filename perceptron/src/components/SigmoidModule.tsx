
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, BrainCircuit } from 'lucide-react';

const SigmoidModule: React.FC = () => {
  const [gain, setGain] = useState(1.0);
  const [inputVal, setInputVal] = useState(0);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = -10; i <= 10; i += 0.2) {
      const z = i * gain;
      const s = 1 / (1 + Math.exp(-z));
      data.push({
        input: parseFloat(i.toFixed(1)),
        output: parseFloat(s.toFixed(3)),
      });
    }
    return data;
  }, [gain]);

  const currentZ = inputVal * gain;
  const currentS = 1 / (1 + Math.exp(-currentZ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BrainCircuit className="text-purple-400" />
            From Logic to Probability
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Sigmoid neuron replaced the hard threshold of the TLU with a <span className="text-purple-400 italic font-semibold">differentiable</span> function. 
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
              <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Probabilistic Output:</span> The result is always between 0 and 1, allowing the output to be interpreted as a confidence score.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
              <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Gain Control:</span> Increasing the "steepness" (gain) makes the Sigmoid behave more like the original McCulloch-Pitts binary switch.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-6 text-purple-100">Dynamics Controls</h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-slate-400">Gain (Steepness)</label>
                <span className="text-purple-400 font-mono font-bold">{gain.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.1" max="5" step="0.1" 
                value={gain} onChange={(e) => setGain(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <label className="text-slate-400">Input Position</label>
                <span className="text-purple-400 font-mono font-bold">z = {currentZ.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="-10" max="10" step="0.1" 
                value={inputVal} onChange={(e) => setInputVal(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl text-center">
              <div className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-1">Probability P(y=1|z)</div>
              <div className="text-4xl font-black text-white">{(currentS * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Activity className="text-purple-400" />
          The Logistic S-Curve
        </h3>
        <div className="flex-grow min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="input" domain={[-10, 10]} stroke="#475569" />
              <YAxis domain={[0, 1]} stroke="#475569" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#c084fc' }}
              />
              <ReferenceLine y={0.5} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine x={inputVal} stroke="#a855f7" strokeWidth={2} />
              <Area type="monotone" dataKey="output" stroke="#a855f7" fillOpacity={0.2} fill="#a855f7" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 italic text-center">
            Function: σ(z) = 1 / (1 + e<sup>-kz</sup>)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SigmoidModule;
