
import React, { useState, useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, YAxis as ReYAxis, Customized } from 'recharts';
import { Play, RotateCcw, Target, Brain, Table, TrendingUp, StepForward, Calculator, ArrowUp, ArrowDown, Minus, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { LogicGate, TrainingSample, NeuronWeights } from '../types';

const LOGIC_GATES: Record<LogicGate, TrainingSample[]> = {
  AND: [
    { x1: 0, x2: 0, y: 0 },
    { x1: 1, x2: 0, y: 0 },
    { x1: 0, x2: 1, y: 0 },
    { x1: 1, x2: 1, y: 1 },
  ],
  OR: [
    { x1: 0, x2: 0, y: 0 },
    { x1: 1, x2: 0, y: 1 },
    { x1: 0, x2: 1, y: 1 },
    { x1: 1, x2: 1, y: 1 },
  ],
  NAND: [
    { x1: 0, x2: 0, y: 1 },
    { x1: 1, x2: 0, y: 1 },
    { x1: 0, x2: 1, y: 1 },
    { x1: 1, x2: 1, y: 0 },
  ],
  XOR: [
    { x1: 0, x2: 0, y: 0 },
    { x1: 1, x2: 0, y: 1 },
    { x1: 0, x2: 1, y: 1 },
    { x1: 1, x2: 1, y: 0 },
  ],
};

const GATE_DESCRIPTIONS: Record<LogicGate, string> = {
  AND: "Output is 1 only if BOTH are 1. Linearly separable.",
  OR: "Output is 1 if EITHER is 1. Linearly separable.",
  NAND: "Output is 0 only if BOTH are 1. Linearly separable.",
  XOR: "Output is 1 only if DIFFERENT. NOT linearly separable!",
};

const TrainingTable: React.FC<{ gate: LogicGate, activeIdx: number | null }> = ({ gate, activeIdx }) => {
  return (
    <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
      <table className="w-full text-left text-[10px]">
        <thead className="bg-slate-900 text-slate-500 uppercase font-bold">
          <tr>
            <th className="px-2 py-1">x₁</th>
            <th className="px-2 py-1">x₂</th>
            <th className="px-2 py-1 text-right">y</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {LOGIC_GATES[gate].map((sample, idx) => (
            <tr 
              key={idx} 
              className={`transition-colors ${activeIdx === idx ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}
            >
              <td className="px-2 py-1 font-mono">{sample.x1}</td>
              <td className="px-2 py-1 font-mono">{sample.x2}</td>
              <td className="px-2 py-1 text-right font-mono font-bold">{sample.y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DecisionBackground = (props: any) => {
  const { xAxis, yAxis, weights } = props;
  if (!xAxis || !yAxis || !weights || !xAxis.scale || !yAxis.scale) return null;
  const { w1, w2, b } = weights;
  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  const gridSize = 30;
  const minX = -0.5, maxX = 1.5;
  const minY = -0.5, maxY = 1.5;
  const stepX = (maxX - minX) / gridSize;
  const stepY = (maxY - minY) / gridSize;
  const rects = [];
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = minX + i * stepX;
      const y = minY + j * stepY;
      const z = x * w1 + y * w2 + b;
      const isPositive = z >= 0;
      const px = xScale(x);
      const py = yScale(y + stepY);
      const pNextX = xScale(x + stepX);
      const pNextY = yScale(y);
      rects.push({
        x: px,
        y: py,
        width: Math.abs(pNextX - px),
        height: Math.abs(pNextY - py),
        fill: isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'
      });
    }
  }
  return <g>{rects.map((r, idx) => <rect key={idx} {...r} />)}</g>;
};

const NeuronVisualizer: React.FC<{ weights: NeuronWeights; lastSample?: TrainingSample; lastUpdate?: { sampleIdx: number, delta: number } | null }> = ({ weights, lastSample, lastUpdate }) => {
  const getStrokeWidth = (w: number) => Math.min(Math.abs(w) * 5 + 1, 8);
  const getStrokeColor = (w: number) => w >= 0 ? '#60a5fa' : '#f87171';
  return (
    <div className="relative w-full h-32 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 180" className="w-full h-full">
        <line x1="80" y1="40" x2="200" y2="90" stroke={getStrokeColor(weights.w1)} strokeWidth={getStrokeWidth(weights.w1)} opacity="0.6" />
        <line x1="80" y1="140" x2="200" y2="90" stroke={getStrokeColor(weights.w2)} strokeWidth={getStrokeWidth(weights.w2)} opacity="0.6" />
        <line x1="80" y1="90" x2="200" y2="90" stroke={getStrokeColor(weights.b)} strokeWidth={getStrokeWidth(weights.b)} opacity="0.6" />
        <line x1="200" y1="90" x2="320" y2="90" stroke="#10b981" strokeWidth="3" />
        <g><circle cx="80" cy="40" r="15" fill={lastSample?.x1 === 1 ? "#3b82f6" : "#1e293b"} stroke="#334155" strokeWidth="2" /><text x="80" y="44" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">x₁</text></g>
        <g><circle cx="80" cy="140" r="15" fill={lastSample?.x2 === 1 ? "#3b82f6" : "#1e293b"} stroke="#334155" strokeWidth="2" /><text x="80" y="144" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">x₂</text></g>
        <g><circle cx="80" cy="90" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2" /><text x="80" y="94" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">bias</text></g>
        <g><circle cx="200" cy="90" r="22" fill="#0f172a" stroke="#334155" strokeWidth="3" /><text x="200" y="95" textAnchor="middle" fill="white" fontSize="12" fontWeight="black">Σ</text></g>
        <g><circle cx="320" cy="90" r="15" fill="#1e293b" stroke={lastUpdate?.delta === 0 ? "#10b981" : "#334155"} strokeWidth="2" /><text x="320" y="94" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">y</text></g>
      </svg>
    </div>
  );
};

const PerceptronSandbox: React.FC = () => {
  const [gate, setGate] = useState<LogicGate>('AND');
  const [weights, setWeights] = useState<NeuronWeights>({ w1: Math.random() - 0.5, w2: Math.random() - 0.5, b: Math.random() - 0.5 });
  const [learningRate] = useState(0.1);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [targetEpochs, setTargetEpochs] = useState(200);
  const [lastUpdate, setLastUpdate] = useState<{ sampleIdx: number, delta: number, z: number, yHat: number, dw1: number, dw2: number, db: number } | null>(null);
  const [history, setHistory] = useState<{ epoch: number, accuracy: number }[]>([]);
  const [currentTrialIdx, setCurrentTrialIdx] = useState(0);
  const trainingInterval = useRef<NodeJS.Timeout | null>(null);

  const calculateAccuracy = (currentWeights: NeuronWeights) => {
    let correct = 0;
    LOGIC_GATES[gate].forEach(s => {
      const z = s.x1 * currentWeights.w1 + s.x2 * currentWeights.w2 + currentWeights.b;
      if ((z >= 0 ? 1 : 0) === s.y) correct++;
    });
    return (correct / 4) * 100;
  };

  const resetWeights = () => {
    const initial = { w1: Math.random() - 0.5, w2: Math.random() - 0.5, b: Math.random() - 0.5 };
    setWeights(initial);
    setEpoch(0);
    setLastUpdate(null);
    setIsTraining(false);
    setCurrentTrialIdx(0);
    setHistory([{ epoch: 0, accuracy: calculateAccuracy(initial) }]);
  };

  const trainStep = (forcedIdx?: number) => {
    if (epoch >= targetEpochs && !forcedIdx !== undefined) { setIsTraining(false); return; }
    
    const sampleIdx = forcedIdx !== undefined ? forcedIdx : Math.floor(Math.random() * 4);
    const sample = LOGIC_GATES[gate][sampleIdx];
    const z = sample.x1 * weights.w1 + sample.x2 * weights.w2 + weights.b;
    const yHat = z >= 0 ? 1 : 0;
    const error = sample.y - yHat;
    let newWeights = { ...weights };
    let dw1 = 0, dw2 = 0, db = 0;
    
    if (error !== 0) {
      dw1 = learningRate * error * sample.x1;
      dw2 = learningRate * error * sample.x2;
      db = learningRate * error;
      newWeights = { w1: weights.w1 + dw1, w2: weights.w2 + dw2, b: weights.b + db };
      setWeights(newWeights);
    }
    
    setLastUpdate({ sampleIdx, delta: error, z, yHat, dw1, dw2, db });
    
    if (forcedIdx === undefined) {
      setEpoch(e => e + 1);
      if (epoch % 2 === 0) setHistory(prev => [...prev, { epoch: epoch + 1, accuracy: calculateAccuracy(newWeights) }].slice(-100));
    }
  };

  const advanceManualTrial = () => {
    trainStep(currentTrialIdx);
    const nextTrial = (currentTrialIdx + 1) % 4;
    setCurrentTrialIdx(nextTrial);
    // If we completed an entire epoch manually
    if (nextTrial === 0) {
      setEpoch(e => e + 1);
      setHistory(prev => [...prev, { epoch: epoch + 1, accuracy: calculateAccuracy(weights) }].slice(-100));
    }
  };

  useEffect(() => {
    if (isTraining) trainingInterval.current = setInterval(() => trainStep(), 100);
    else if (trainingInterval.current) clearInterval(trainingInterval.current);
    return () => { if (trainingInterval.current) clearInterval(trainingInterval.current); };
  }, [isTraining, weights, epoch]);

  const getBoundaryPoints = () => {
    const min = -0.5, max = 1.5;
    const points: { x: number, y: number }[] = [];
    const { w1, w2, b } = weights;
    if (Math.abs(w2) > 0.0001) {
      const y1 = (-w1 * min - b) / w2; if (y1 >= min && y1 <= max) points.push({ x: min, y: y1 });
      const y2 = (-w1 * max - b) / w2; if (y2 >= min && y2 <= max) points.push({ x: max, y: y2 });
    }
    if (Math.abs(w1) > 0.0001) {
      const x1 = (-w2 * min - b) / w1; if (x1 >= min && x1 <= max) points.push({ x: x1, y: min });
      const x2 = (-w2 * max - b) / w1; if (x2 >= min && x2 <= max) points.push({ x: x2, y: max });
    }
    return points.slice(0, 2);
  };

  const WeightChangeRow: React.FC<{ label: string, delta: number }> = ({ label, delta }) => {
    const isZero = delta === 0;
    const isPos = delta > 0;
    const percentage = (Math.abs(delta) / 0.1) * 100;
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between text-[8px] font-bold uppercase text-slate-500">
          <span>{label}</span>
          <span className={isZero ? "text-slate-600" : isPos ? "text-emerald-400" : "text-rose-400"}>
            {isZero ? <Minus size={8} /> : isPos ? <ArrowUp size={8} /> : <ArrowDown size={8} />} {delta.toFixed(3)}
          </span>
        </div>
        <div className="w-full h-1 bg-slate-900 rounded-full flex overflow-hidden">
          <div className="w-1/2 flex justify-end">
            {!isPos && !isZero && <div className="bg-rose-500 h-full" style={{ width: `${percentage}%` }} />}
          </div>
          <div className="w-1/2">
            {isPos && <div className="bg-emerald-500 h-full" style={{ width: `${percentage}%` }} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full max-h-[85vh]">
      {/* Column 1: Config & Data */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shrink-0">
          <h2 className="text-md font-bold mb-3 flex items-center gap-2 text-emerald-400">
            <Target size={18} /> Configuration
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(Object.keys(LOGIC_GATES) as LogicGate[]).map((g) => (
              <button key={g} onClick={() => { setGate(g); resetWeights(); }} className={`py-1.5 rounded-lg text-xs font-bold transition-all ${gate === g ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {g}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight mb-4 min-h-[30px] italic">
            {GATE_DESCRIPTIONS[gate]}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="range" min="50" max="1000" step="50" value={targetEpochs} onChange={(e) => setTargetEpochs(parseInt(e.target.value))} className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <span className="font-mono text-[10px] text-blue-400 w-8">{targetEpochs}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if (epoch >= targetEpochs) { setEpoch(0); setHistory([]); } setIsTraining(!isTraining); }} className={`flex-1 py-2 rounded-xl text-xs font-bold ${isTraining ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                {isTraining ? 'Stop' : 'Start Training'}
              </button>
              <button onClick={resetWeights} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all" title="Reset Weights"><RotateCcw size={16} /></button>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex-grow overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Table size={14} /> Truth Table</h3>
          <TrainingTable gate={gate} activeIdx={lastUpdate?.sampleIdx ?? null} />
          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[9px] text-slate-500 leading-relaxed italic">
            Each row represents one training example. The model picks one at random per step in auto-mode, or sequentially in manual mode.
          </div>
        </div>
      </div>

      {/* Column 2: Decision Visualization */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><Brain size={16} className="text-emerald-400" /> Decision Space</h3>
            <div className="flex gap-2 text-[8px] uppercase font-bold text-slate-500">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div> y=1</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-500/50"></div> y=0</div>
            </div>
          </div>
          <div className="h-[320px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: 0 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" dataKey="x1" domain={[-0.5, 1.5]} stroke="#475569" fontSize={10} />
                <YAxis type="number" dataKey="x2" domain={[-0.5, 1.5]} stroke="#475569" fontSize={10} />
                <Customized component={DecisionBackground} weights={weights} />
                {LOGIC_GATES[gate].map((s, idx) => (
                  <Scatter key={`${gate}-${idx}`} data={[s]} fill={s.y === 1 ? '#10b981' : '#f43f5e'} stroke={lastUpdate?.sampleIdx === idx ? "#3b82f6" : "#fff"} strokeWidth={lastUpdate?.sampleIdx === idx ? 4 : 2}
                    shape={(props: any) => {
                      const { cx, cy, fill, stroke, strokeWidth, index } = props;
                      const active = lastUpdate?.sampleIdx === index;
                      return (
                        <g>
                          {active && <circle cx={cx} cy={cy} r={8} fill="none" stroke="#3b82f6" strokeWidth={2}><animate attributeName="r" from="8" to="20" dur="1s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.6" to="0" dur="1s" repeatCount="indefinite" /></circle>}
                          <circle cx={cx} cy={cy} r={active ? 10 : 8} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                        </g>
                      );
                    }}
                  />
                ))}
                {getBoundaryPoints().length === 2 && <ReferenceLine segment={getBoundaryPoints() as any} stroke="#3b82f6" strokeWidth={4} strokeDasharray="5 5" />}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-between items-center text-[10px] font-mono p-2 bg-slate-950/50 rounded-lg shrink-0">
            <div className="flex gap-3"><span className="text-blue-400">w1:{weights.w1.toFixed(2)}</span><span className="text-blue-400">w2:{weights.w2.toFixed(2)}</span><span className="text-rose-400">b:{weights.b.toFixed(2)}</span></div>
            <span className="text-emerald-400 font-bold">{calculateAccuracy(weights).toFixed(0)}% Accuracy</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex-grow mt-3 shrink-0 flex flex-col max-h-[140px]">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><TrendingUp size={12} /> Training History</h3>
             <div className="flex-grow">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={history}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                   <XAxis dataKey="epoch" hide />
                   <ReYAxis domain={[0, 100]} hide />
                   <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Column 3: Epoch Training Detail */}
      <div className="flex flex-col gap-6 overflow-hidden">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calculator size={14} /> Epoch Training Detail</h3>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-500/20">Epoch: {epoch}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-1 mb-3">
             {[0, 1, 2, 3].map((i) => {
               const isActive = currentTrialIdx === i;
               const isComplete = lastUpdate !== null && ((currentTrialIdx > i) || (currentTrialIdx < i && lastUpdate.sampleIdx === i));
               return (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-500 ring-2 ring-blue-500/20' : isComplete ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
               );
             })}
          </div>

          <div className="space-y-2 h-[220px] overflow-y-auto pr-1">
            {lastUpdate ? (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex justify-between items-center text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 uppercase font-bold">Input Trial {lastUpdate.sampleIdx + 1}/4</span>
                  <div className="flex gap-2 font-mono">
                    <span className="text-blue-400">x1:{LOGIC_GATES[gate][lastUpdate.sampleIdx].x1}</span>
                    <span className="text-blue-400">x2:{LOGIC_GATES[gate][lastUpdate.sampleIdx].x2}</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[10px]">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500 font-bold uppercase">Weighted Sum (z)</span>
                    <span className="text-blue-400 font-bold font-mono">{lastUpdate.z.toFixed(2)}</span>
                  </div>
                  <div className="text-[9px] text-slate-600 font-mono truncate">({LOGIC_GATES[gate][lastUpdate.sampleIdx].x1}×{weights.w1.toFixed(2)}) + ({LOGIC_GATES[gate][lastUpdate.sampleIdx].x2}×{weights.w2.toFixed(2)}) + {weights.b.toFixed(2)}</div>
                </div>

                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[10px] flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-tight">Prediction (ŷ) vs Target (y)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300">ŷ={lastUpdate.yHat}</span>
                    <span className="text-slate-700">|</span>
                    <span className="font-mono text-emerald-400">y={LOGIC_GATES[gate][lastUpdate.sampleIdx].y}</span>
                  </div>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${lastUpdate.delta !== 0 ? 'bg-rose-900/10 border-rose-500/20' : 'bg-emerald-900/10 border-emerald-500/20'}`}>
                  <div className="flex justify-between items-center text-[10px] mb-2">
                    <span className="text-slate-500 font-bold uppercase">Result & Update</span>
                    {lastUpdate.delta === 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={10} /> Correct</span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-bold"><AlertCircle size={10} /> Error: {lastUpdate.delta}</span>
                    )}
                  </div>
                  
                  {lastUpdate.delta !== 0 ? (
                    <div className="space-y-1.5">
                      <WeightChangeRow label="Δw1" delta={lastUpdate.dw1} />
                      <WeightChangeRow label="Δw2" delta={lastUpdate.dw2} />
                      <WeightChangeRow label="Δb" delta={lastUpdate.db} />
                    </div>
                  ) : (
                    <div className="text-center py-1 text-[9px] text-emerald-500 italic">No weight update required for this sample.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-500 italic flex flex-col items-center justify-center gap-3 h-full">
                <Info size={24} className="opacity-20" />
                <p className="text-center">Start an epoch to see step-by-step learning mechanics.</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={advanceManualTrial}
            disabled={isTraining}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 text-xs uppercase tracking-wider"
          >
            <StepForward size={14} /> Next Step (Trial {currentTrialIdx + 1}/4)
          </button>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex-grow flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Brain size={14} /> Live Network</h3>
          <NeuronVisualizer weights={weights} lastSample={lastUpdate ? LOGIC_GATES[gate][lastUpdate.sampleIdx] : undefined} lastUpdate={lastUpdate} />
          <div className="mt-4 text-[9px] text-slate-500 italic leading-relaxed">
            Biological intuition: Watch the synaptic strengths (weights) and bias shift as the network experiences each logic trial.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerceptronSandbox;
