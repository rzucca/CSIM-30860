
import React, { useState } from 'react';
import TLUModule from './components/TLUModule';
import ReLUModule from './components/ReLUModule';
import SigmoidModule from './components/SigmoidModule';
import PerceptronSandbox from './components/PerceptronSandbox';
import RealWorldModule from './components/RealWorldModule';
import { Brain, Zap, Activity, Grid, LineChart } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TLU' | 'ReLU' | 'Sigmoid' | 'Perceptron' | 'RealWorld'>('TLU');

  const tabs = [
    { id: 'TLU', name: 'McCulloch-Pitts TLU', icon: <Grid size={20} /> },
    { id: 'ReLU', name: 'ReLU Unit', icon: <Zap size={20} /> },
    { id: 'Sigmoid', name: 'Sigmoid Neuron', icon: <Activity size={20} /> },
    { id: 'Perceptron', name: 'Sandbox', icon: <Brain size={20} /> },
    { id: 'RealWorld', name: 'Real Example', icon: <LineChart size={20} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              From Bits to Bio-Logic
            </h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">
              The Evolution of the Artificial Neuron
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="animate-in fade-in duration-500">
          {activeTab === 'TLU' && <TLUModule />}
          {activeTab === 'ReLU' && <ReLUModule />}
          {activeTab === 'Sigmoid' && <SigmoidModule />}
          {activeTab === 'Perceptron' && <PerceptronSandbox />}
          {activeTab === 'RealWorld' && <RealWorldModule />}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 bg-slate-900 border-t border-slate-800 text-center text-slate-500 text-sm">
        CSIM - Cognitive Systems: Theory and Methods (2026)
      </footer>
    </div>
  );
};

export default App;
