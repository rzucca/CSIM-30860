
import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ReferenceArea, ReferenceLine } from 'recharts';

interface TracePoint {
  time: number;
  blink: number;
  tone: number;
  puff: number;
}

interface EyelidTraceProps {
  data: TracePoint[];
  toneStart: number;
  toneEnd: number;
  puffStart: number;
  puffEnd: number;
}

const EyelidTrace: React.FC<EyelidTraceProps> = ({ data, toneStart, toneEnd, puffStart, puffEnd }) => {
  if (data.length === 0) return (
    <div className="h-48 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-600 italic text-xs uppercase tracking-widest">
      Awaiting Trial Data...
    </div>
  );

  const maxTime = Math.max(1000, ...data.map(d => d.time));

  return (
    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-inner">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div> Eyelid Position (EMG)
          </h4>
        </div>
        <div className="flex gap-3 text-[8px] font-bold uppercase tracking-tighter">
          <span className="flex items-center gap-1 text-yellow-500/50"><div className="w-2 h-1 bg-yellow-500/30"></div> Tone (CS)</span>
          <span className="flex items-center gap-1 text-red-500/50"><div className="w-2 h-1 bg-red-500/30"></div> Puff (US)</span>
        </div>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              hide 
              type="number" 
              domain={[0, maxTime]} 
            />
            <YAxis 
              domain={[0, 1.2]} 
              hide
            />
            
            {/* Shaded Duration Areas */}
            <ReferenceArea {...({ x1: toneStart, x2: toneEnd, fill: "#eab308", fillOpacity: 0.05 } as any)} />
            {puffStart !== -1 && (
              <ReferenceArea {...({ x1: puffStart, x2: puffEnd, fill: "#ef4444", fillOpacity: 0.05 } as any)} />
            )}

            {/* Vertical Onset Markers */}
            <ReferenceLine 
              {...({
                x: toneStart, 
                stroke: "#eab308", 
                strokeWidth: 1, 
                strokeDasharray: "4 4", 
                label: { 
                  value: 'CS ONSET', 
                  position: 'top', 
                  fill: '#eab308', 
                  fontSize: 8, 
                  fontWeight: '900',
                  letterSpacing: '0.1em'
                }
              } as any)} 
            />
            
            {puffStart !== -1 && (
              <ReferenceLine 
                {...({
                  x: puffStart, 
                  stroke: "#ef4444", 
                  strokeWidth: 1, 
                  strokeDasharray: "4 4", 
                  label: { 
                    value: 'US ONSET', 
                    position: 'top', 
                    fill: '#ef4444', 
                    fontSize: 8, 
                    fontWeight: '900',
                    letterSpacing: '0.1em'
                  }
                } as any)} 
              />
            )}

            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px' }}
              itemStyle={{ color: '#22d3ee' }}
              labelStyle={{ display: 'none' }}
              formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Closure']}
            />
            
            <Area 
              type="monotone" 
              dataKey="blink" 
              stroke="none" 
              fill="url(#colorBlink)" 
              fillOpacity={0.2}
              isAnimationActive={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="blink" 
              stroke="#22d3ee" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />

            <defs>
              <linearGradient id="colorBlink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 flex justify-between text-[8px] font-mono text-slate-500 uppercase">
        <span className="text-yellow-500/80 font-bold">CS: {toneStart}ms</span>
        <span>Sweep Recording</span>
        <span className={puffStart !== -1 ? "text-red-500/80 font-bold" : "text-slate-600 italic"}>
          {puffStart !== -1 ? `US: ${puffStart}ms` : 'Catch Trial'}
        </span>
      </div>
    </div>
  );
};

export default EyelidTrace;
