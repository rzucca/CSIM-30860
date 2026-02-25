
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrainingEvent, LabMode } from '../types';

interface DataPanelProps {
  history: TrainingEvent[];
  strength: number;
  mode: LabMode;
}

const DataPanel: React.FC<DataPanelProps> = ({ history, strength, mode }) => {
  // Use strength directly for all modes as requested for Salivary mode
  const chartData = history.map((h, i) => {
    return {
      trial: i + 1,
      val: h.strength
    };
  });

  const latestVal = chartData.length > 0 ? chartData[chartData.length - 1].val : 0;
  const isSalivary = mode === 'SALIVARY';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {isSalivary ? 'CR Probability' : 'Strength'}
          </h3>
          <p className={`text-2xl font-black leading-none ${isSalivary ? 'text-orange-500' : 'text-indigo-600'}`}>
            {Math.round(strength)}%
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trials</h3>
          <p className="text-xl font-bold text-slate-800 leading-none">{history.length}</p>
        </div>
      </div>

      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isSalivary ? "#f97316" : "#4f46e5"} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isSalivary ? "#f97316" : "#4f46e5"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="trial" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
              itemStyle={{ color: isSalivary ? '#f97316' : '#4f46e5', fontWeight: 'bold', padding: 0 }}
              labelStyle={{ display: 'none' }}
              formatter={(val: number) => [`${Math.round(val)}%`, isSalivary ? 'CR Probability' : 'Strength']}
            />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={isSalivary ? "#f97316" : "#4f46e5"} 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorVal)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {isSalivary && (
        <p className="text-[9px] text-slate-400 mt-2 italic text-center">
          Plotting Learning Curve: Associative strength (V) over trials.
        </p>
      )}
    </div>
  );
};

export default DataPanel;
