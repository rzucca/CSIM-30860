
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Customized, LineChart, Line, YAxis as ReYAxis } from 'recharts';
import { Play, Pause, RotateCcw, Target, Award, BrainCircuit, TrendingUp, Info, ZapOff, BookOpen } from 'lucide-react';
import { TrainingSample, NeuronWeights } from '../types';

type DatasetType = 'linear' | 'moons';

const DecisionBackground = (props: any) => {
  const { xAxis, yAxis, weights } = props;
  if (!xAxis || !yAxis || !weights || !xAxis.scale || !yAxis.scale) return null;
  const { w1, w2, b } = weights;
  const xScale = xAxis.scale;
  const yScale = yAxis.scale;
  const gridSize = 30;
  const minX = 0, maxX = 10;
  const minY = 0, maxY = 10;
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
        fill: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)'
      });
    }
  }
  return <g>{rects.map((r, idx) => <rect key={idx} {...r} />)}</g>;
};

const RealWorldModule: React.FC = () => {
  const [datasetType, setDatasetType] = useState<DatasetType>('linear');
  const [data, setData] = useState<TrainingSample[]>([]);
  const [weights, setWeights] = useState<NeuronWeights>({ w1: 0.1, w2: -0.2, b: 0.05 });
  const [learningRate, setLearningRate] = useState(0.01);
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState<{ epoch: number, accuracy: number }[]>([]);
  const trainingRef = useRef<NodeJS.Timeout | null>(null);

  const generateDataset = (type: DatasetType) => {
    const samples: TrainingSample[] = [];
    if (type === 'linear') {
      const slope = 0.8;
      const intercept = 1.0;
      const margin = 0.8;
      while (samples.length < 100) {
        const x1 = Math.random() * 10;
        const x2 = Math.random() * 10;
        const threshold = slope * x1 + intercept;
        if (x2 > threshold + margin) samples.push({ x1, x2, y: 1 });
        else if (x2 < threshold - margin) samples.push({ x1, x2, y: 0 });
      }
    } else {
      // Extremely Entangled Moon Dataset
      const nSamples = 60;
      const noise = 0.45;

      // Moon 1 (Top Crescent - "Fail")
      for (let i = 0; i < nSamples; i++) {
        const angle = (i / nSamples) * Math.PI;
        const radius = 3.8;
        samples.push({
          x1: 4.5 + Math.cos(angle) * radius + (Math.random() - 0.5) * noise * 4.5,
          x2: 5.5 + Math.sin(angle) * radius + (Math.random() - 0.5) * noise * 4.5,
          y: 0
        });
      }

      // Moon 2 (Bottom Crescent shifted - "Pass")
      // SHIFTED: -3 on X1 (moved more left), +2 on X2
      for (let i = 0; i < nSamples; i++) {
        const angle = (i / nSamples) * Math.PI;
        const radius = 3.8;
        samples.push({
          x1: (5.5 - 3.0) - Math.cos(angle) * radius + (Math.random() - 0.5) * noise * 4.5,
          x2: (4.5 + 2.0) - Math.sin(angle) * radius + (Math.random() - 0.5) * noise * 4.5,
          y: 1
        });
      }
    }
    setData(samples);
    setHistory([{ epoch: 0, accuracy: calculateAccuracy(weights, samples) }]);
  };

  const calculateAccuracy = (w: NeuronWeights, dataset: TrainingSample[]) => {
    if (dataset.length === 0) return 0;
    let correct = 0;
    dataset.forEach(s => {
      const z = s.x1 * w.w1 + s.x2 * w.w2 + w.b;
      const prediction = z >= 0 ? 1 : 0;
      if (prediction === s.y) correct++;
    });
    return (correct / dataset.length) * 100;
  };

  useEffect(() => {
    generateDataset(datasetType);
  }, [datasetType]);

  const reset = () => {
    const initialWeights = { w1: Math.random() * 0.4 - 0.2, w2: Math.random() * 0.4 - 0.2, b: Math.random() * 0.4 - 0.2 };
    setWeights(initialWeights);
    setEpoch(0);
    setIsTraining(false);
    setHistory([{ epoch: 0, accuracy: calculateAccuracy(initialWeights, data) }]);
  };

  const trainIteration = () => {
    setWeights(prevWeights => {
      let currentWeights = { ...prevWeights };
      const shuffledData = [...data].sort(() => Math.random() - 0.5);
      shuffledData.forEach(sample => {
        const z = sample.x1 * currentWeights.w1 + sample.x2 * currentWeights.w2 + currentWeights.b;
        const yHat = z >= 0 ? 1 : 0;
        const error = sample.y - yHat;
        
        if (error !== 0) {
          currentWeights.w1 += learningRate * error * sample.x1;
          currentWeights.w2 += learningRate * error * sample.x2;
          currentWeights.b += learningRate * error;
        }
      });

      const newAccuracy = calculateAccuracy(currentWeights, data);
      setHistory(h => [...h, { epoch: epoch + 1, accuracy: newAccuracy }].slice(-100));
      return currentWeights;
    });
    setEpoch(e => e + 1);
  };

  useEffect(() => {
    if (isTraining) {
      trainingRef.current = setInterval(() => {
        trainIteration();
      }, 50);
    } else {
      if (trainingRef.current) clearInterval(trainingRef.current);
    }
    return () => { if (trainingRef.current) clearInterval(trainingRef.current); };
  }, [isTraining, data, epoch]);

  const getBoundaryPoints = () => {
    const { w1, w2, b } = weights;
    const min = 0;
    const max = 10;
    const points: { x: number, y: number }[] = [];
    
    if (Math.abs(w2) > 1e-6) {
      const y1 = (-w1 * min - b) / w2;
      if (y1 >= min && y1 <= max) points.push({ x: min, y: y1 });
      const y2 = (-w1 * max - b) / w2;
      if (y2 >= min && y2 <= max) points.push({ x: max, y: y2 });
    }
    if (Math.abs(w1) > 1e-6) {
      const x1 = (-w2 * min - b) / w1;
      if (x1 >= min && x1 <= max) points.push({ x: x1, y: min });
      const x2 = (-w2 * max - b) / w1;
      if (x2 >= min && x2 <= max) points.push({ x: x2, y: max });
    }

    const uniquePoints = points.filter((p, index) => 
      points.findIndex(o => Math.abs(o.x - p.x) < 0.01 && Math.abs(o.y - p.y) < 0.01) === index
    );

    return uniquePoints.slice(0, 2);
  };

  const boundary = getBoundaryPoints();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Award size={24} /> A real problem
          </h2>
          
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
            <button 
              onClick={() => { setDatasetType('linear'); reset(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${datasetType === 'linear' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Linear
            </button>
            <button 
              onClick={() => { setDatasetType('moons'); reset(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${datasetType === 'moons' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Complex (Shifted)
            </button>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            {datasetType === 'linear' 
              ? 'The Exam Problem (Linear): A predictable scenario where "Pass" and "Fail" results are separated by a simple threshold of effort and rest. A single layer perceptron can easily draw a line between success and failure.' 
              : 'The Exam Problem (Complex): In this interlocking distribution, students might pass with low sleep but extreme prep, or fail despite moderate prep due to total exhaustion. No straight line can separate these intertwined outcomes.'}
          </p>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-bold">Accuracy</span>
              <span className={`font-black text-lg ${calculateAccuracy(weights, data) > 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calculateAccuracy(weights, data).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 uppercase font-bold">Epochs</span>
              <span className="text-blue-400 font-mono">{epoch}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
            <TrendingUp size={16} /> Training Controls
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-2">
                <label>Learning Rate (η)</label>
                <span className="text-blue-400 font-mono">{learningRate.toFixed(3)}</span>
              </div>
              <input 
                type="range" min="0.001" max="0.1" step="0.001" 
                value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsTraining(!isTraining)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-lg ${isTraining ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}
              >
                {isTraining ? <Pause size={18} /> : <Play size={18} />}
                {isTraining ? 'Pause' : 'Train'}
              </button>
              <button onClick={reset} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border flex gap-3 ${datasetType === 'linear' ? 'bg-blue-900/10 border-blue-800/30' : 'bg-rose-900/10 border-rose-800/30'}`}>
          {datasetType === 'linear' ? <Info className="text-blue-400 shrink-0" size={18} /> : <ZapOff className="text-rose-400 shrink-0" size={18} />}
          <p className={`text-[10px] leading-relaxed italic ${datasetType === 'linear' ? 'text-blue-200' : 'text-rose-200'}`}>
            {datasetType === 'linear' 
              ? 'A linear boundary perfectly captures the "Study + Sleep" logic here.' 
              : 'The geometry of this exam problem is non-linear. The neuron will perpetually fail to find a stable "all-pass" boundary, leading to the seen oscillation.'}
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex-grow flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="text-emerald-400" />
              Entangled Exam Decision Space
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pass</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fail</div>
            </div>
          </div>

          <div className="flex-grow bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis 
                  type="number" dataKey="x1" domain={[0, 10]} stroke="#475569" fontSize={11} tick={false}
                  label={{ value: 'Hours Slept (x1)', position: 'insideBottom', offset: -25, fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                />
                <YAxis 
                  type="number" dataKey="x2" domain={[0, 10]} stroke="#475569" fontSize={11} tick={false}
                  label={{ value: 'Prep Questions (x2)', angle: -90, position: 'insideLeft', offset: 0, fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                />
                <Customized component={DecisionBackground} weights={weights} />
                
                {data.map((s, idx) => (
                  <Scatter key={idx} data={[s]} fill={s.y === 1 ? '#10b981' : '#f43f5e'} shape="circle" />
                ))}

                {boundary.length === 2 && (
                  <ReferenceLine 
                    segment={[
                      { x: boundary[0].x, y: boundary[0].y },
                      { x: boundary[1].x, y: boundary[1].y }
                    ]} 
                    stroke="#3b82f6" 
                    strokeWidth={5} 
                    strokeDasharray="12 6"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 h-32 shrink-0">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy Stagnation Graph</span>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                   <XAxis dataKey="epoch" hide />
                   <ReYAxis domain={[0, 105]} hide />
                   <Line type="monotone" dataKey="accuracy" stroke={datasetType === 'linear' ? "#10b981" : "#f43f5e"} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealWorldModule;
