
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, Bell, Utensils, RefreshCw, Eye, Dog, Volume2, Wind, ShieldAlert, Activity as ActivityIcon, AlertCircle, Target, Network, Zap, Play, Pause, SkipForward, Eraser, Info, Sigma, Layers, History as HistoryIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Subject from './components/Subject';
import EyeblinkSubject from './components/EyeblinkSubject';
import EyelidTrace from './components/EyelidTrace';
import DataPanel from './components/DataPanel';
import RescorlaWagnerPanel from './components/RescorlaWagnerPanel';
import CerebellarPanel from './components/CerebellarPanel';
import BlockingPanel from './components/BlockingPanel';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import { TrainingEvent, LabMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<LabMode>('SALIVARY');
  const [strength, setStrength] = useState<number>(0);
  const [strengthA, setStrengthA] = useState<number>(0);
  const [strengthB, setStrengthB] = useState<number>(0);
  const [history, setHistory] = useState<TrainingEvent[]>([]);

  // Cerebellar Simulation State
  const NUM_BASIS = 20; 
  const weightsRef = useRef<number[]>(new Array(NUM_BASIS).fill(0));
  const [synapticWeights, setSynapticWeights] = useState<number[]>(new Array(NUM_BASIS).fill(0)); 
  const [basisActivity, setBasisActivity] = useState<number[]>(new Array(NUM_BASIS).fill(0));
  const [purkinjeInhibition, setPurkinjeInhibition] = useState<number>(1.0); 

  // Biophysical Constants & Gains
  const [g_us_o, setG_US_O] = useState(1.0);
  const [g_cs_o, setG_CS_O] = useState(1.0);
  const [g_us_b, setG_US_B] = useState(1.0);
  const [g_cs_b, setG_CS_B] = useState(1.0);
  const [g_c, setG_C] = useState(1.0);
  const [beta_cerebellar, setBeta_Cerebellar] = useState(1e-4);

  // Model parameters
  const [p0, setP0] = useState(0.05);
  const [c0, setC0] = useState(1.0);
  const [e0, setE0] = useState(1.0);
  const [n0, setN0] = useState(1.0);
  const [m0, setM0] = useState(0.0);
  const [tP, setTP] = useState(100.0);

  // Simulation Flow
  const [isTrialRunning, setIsTrialRunning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [cerebellarTrainingMode, setCerebellarTrainingMode] = useState<'ACQUISITION' | 'EXTINCTION'>('ACQUISITION');
  const [cerebellarTrialType, setCerebellarTrialType] = useState<'ACQUISITION' | 'PROBE' | null>(null);

  // UI State
  const [isBelling, setIsBelling] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  const [isSalivating, setIsSalivating] = useState(false);
  const [isPuffing, setIsPuffing] = useState(false);
  const [blinkValue, setBlinkValue] = useState(0); 
  const [currentTrace, setCurrentTrace] = useState<any[]>([]);
  const [traceMarkers, setTraceMarkers] = useState({ toneS: 0, toneE: 0, puffS: 0, puffE: 0 });

  // Parameters
  const [toneDur, setToneDur] = useState(500); 
  const [puffInt, setPuffInt] = useState(100);
  const [isiEyeblink, setIsiEyeblink] = useState(500);
  const [isiCerebellar, setIsiCerebellar] = useState(500);
  const [alpha, setAlpha] = useState(0.4); 
  const [beta_rw, setBeta_RW] = useState(0.4);
  const [lambda, setLambda] = useState(100);
  const [toneFreq, setToneFreq] = useState(1000);

  const TRIAL_DURATION = 1000;
  const DELTA_T = 1; 

  const resetExperiment = () => {
    setIsAutoPlaying(false);
    setStrength(0);
    setStrengthA(0);
    setStrengthB(0);
    setHistory([]);
    setCurrentTrace([]);
    setBlinkValue(0);
    weightsRef.current = new Array(NUM_BASIS).fill(0);
    setSynapticWeights([...weightsRef.current]);
    setBasisActivity(new Array(NUM_BASIS).fill(0));
    setPurkinjeInhibition(c0);
    setCerebellarTrialType(null);
  };

  const triggerSalivaryResponse = async (type: 'BOTH' | 'BELL' | 'FOOD' | 'CATCH_SALIVARY') => {
    return new Promise<void>((resolve) => {
      const now = Date.now();
      const isPaired = type === 'BOTH';
      const isBellOnly = type === 'BELL' || type === 'CATCH_SALIVARY';
      
      if (isBellOnly || isPaired) setIsBelling(true);
      if (type === 'FOOD' || isPaired) { setIsExcited(true); setIsSalivating(true); }
      
      // Trigger CR (salivation) if Bell Only and strength > 30
      if (isBellOnly && strength > 30) {
        setIsExcited(true);
        setIsSalivating(true);
      }

      let predictionError = 0;
      let newStr = strength;
      if (isBellOnly) {
        predictionError = 0 - strength;
        newStr = Math.max(0, strength + alpha * beta_rw * predictionError);
      } else if (isPaired) {
        predictionError = lambda - strength;
        newStr = Math.min(100, strength + alpha * beta_rw * predictionError);
      }
      
      setStrength(newStr);

      // Determine response type for logging
      let response = 'NONE';
      if (isPaired || type === 'FOOD') {
        response = 'UNCONDITIONED';
      } else if (isBellOnly && strength > 30) {
        response = 'CONDITIONED';
      }

      setHistory(prev => [...prev, { 
        timestamp: now, 
        type: type as any, 
        strength: newStr, 
        response: response, 
        predictionError: predictionError 
      }]);

      setTimeout(() => { 
        setIsBelling(false); 
        setIsExcited(false); 
        setIsSalivating(false); 
        resolve();
      }, 1000);
    });
  };

  // Missing runBlockingTrial function fixed.
  const runBlockingTrial = useCallback(async (type: 'A' | 'B' | 'AB', isPaired: boolean) => {
    const now = Date.now();
    const lambda = isPaired ? 100 : 0;
    
    let totalV = 0;
    if (type === 'A') totalV = strengthA;
    else if (type === 'B') totalV = strengthB;
    else if (type === 'AB') totalV = strengthA + strengthB;

    const predictionError = lambda - totalV;
    let nextVA = strengthA;
    let nextVB = strengthB;

    if (type === 'A' || type === 'AB') {
      nextVA = Math.max(0, Math.min(100, strengthA + alpha * beta_rw * predictionError));
    }
    if (type === 'B' || type === 'AB') {
      nextVB = Math.max(0, Math.min(100, strengthB + alpha * beta_rw * predictionError));
    }

    setStrengthA(nextVA);
    setStrengthB(nextVB);
    setStrength(type === 'A' ? nextVA : type === 'B' ? nextVB : nextVA + nextVB);

    setHistory(prev => [...prev, {
      timestamp: now,
      type: `BLOCKING_${type}`,
      strength: type === 'A' ? nextVA : type === 'B' ? nextVB : nextVA + nextVB,
      strengthA: nextVA,
      strengthB: nextVB,
      response: (type === 'A' && nextVA > 20) || (type === 'B' && nextVB > 20) || (type === 'AB' && (nextVA + nextVB) > 20) ? 'CONDITIONED' : 'NONE',
      predictionError: predictionError
    }]);
  }, [strengthA, strengthB, alpha, beta_rw]);

  const runCerebellarTrial = useCallback(async (isCatchTrial: boolean = false, shouldLearn: boolean = true) => {
    if (isTrialRunning) return;
    setIsTrialRunning(true);
    try {
      setCerebellarTrialType(isCatchTrial ? (shouldLearn ? 'EXTINCTION' : 'PROBE') : 'ACQUISITION');
      const startTime = Date.now();
      const tStart = 0; 
      const pStart = isiCerebellar; 
      const pEnd = pStart + 10;
      const tEnd = pEnd;
      setTraceMarkers({ toneS: tStart, toneE: tEnd, puffS: isCatchTrial ? -1 : pStart, puffE: isCatchTrial ? -1 : pEnd });

      let r_t_prev = 0;
      const activeWeights = [...weightsRef.current];
      const trialData: any[] = [];
      const aP = Math.exp(-DELTA_T / tP);

      for (let t = 0; t < TRIAL_DURATION; t += DELTA_T) {
        const I_CS = (t >= tStart && t <= tEnd) ? 1.0 : 0.0;
        const I_US = (!isCatchTrial && t >= pStart && t <= pEnd) ? 1.0 : 0.0;
        const basisStep = new Array(NUM_BASIS).fill(0).map((_, i) => {
          const k = i + 1;
          const mu_k = 0.05 * k * 1000; 
          const sigma_k = mu_k / 5;
          const h_k = 1.0;
          const diff = (t - tStart) - mu_k;
          const gamma_k = h_k * Math.exp(-(diff * diff) / (2 * Math.PI * sigma_k));
          return p0 + (I_CS > 0 ? gamma_k : 0);
        });
        let sumWkPk = 0;
        basisStep.forEach((pk, i) => { sumWkPk += activeWeights[i] * (pk - p0); });
        const c_t = c0 + (g_c * sumWkPk); 
        const n_t = Math.max(0, n0 - c_t); 
        const e_t = e0 + (g_us_o * I_US) - (g_cs_o * n_t); 
        if (shouldLearn) {
          basisStep.forEach((pk, i) => {
            activeWeights[i] += -beta_cerebellar * (pk - p0) * (e_t - e0);
          });
        }
        const m_t = m0 + (g_us_b * I_US) + (g_cs_b * n_t);
        const r_t = (1 - aP) * (m_t - m0) + (aP * r_t_prev); 
        r_t_prev = r_t;
        if (t % 10 === 0) {
          trialData.push({ time: t, blink: r_t, tone: I_CS, puff: I_US, error: e_t });
          if (t % 100 === 0) {
            setBlinkValue(r_t); setCurrentTrace([...trialData]); setBasisActivity(basisStep);
            setPurkinjeInhibition(c_t); setSynapticWeights([...activeWeights]);
          }
          if (t === tStart) setIsBelling(true);
          if (t === tEnd) setIsBelling(false);
          if (t === pStart && !isCatchTrial) setIsPuffing(true);
          if (t === pEnd && !isCatchTrial) setIsPuffing(false);
          if (t % 80 === 0) await new Promise(r => setTimeout(r, 0));
        }
      }
      weightsRef.current = activeWeights;
      setSynapticWeights([...activeWeights]);
      // Use a consistent window (up to US onset) for all trials to avoid the "jump" artifact
      const crOnlyWindow = trialData.filter(d => d.time < pStart);
      const peakCR = Math.max(0, ...crOnlyWindow.map(d => d.blink));
      const newStrength = Math.min(100, peakCR * 200); 
      setStrength(newStrength);
      setHistory(prev => {
        const pairedCount = prev.filter(h => h.type === 'PAIRED_CEREBELLAR' || h.type === 'EXTINCTION_CEREBELLAR').length;
        // Save trace for trial 1, 10, 20, 30...
        const shouldSaveTrace = (pairedCount + 1) % 10 === 0 || pairedCount === 0;
        return [...prev, {
          timestamp: startTime,
          type: isCatchTrial ? (shouldLearn ? 'EXTINCTION_CEREBELLAR' : 'PROBE_CEREBELLAR') : 'PAIRED_CEREBELLAR',
          strength: newStrength,
          response: newStrength > 10 ? 'CONDITIONED' : (isCatchTrial ? 'NONE' : 'UNCONDITIONED'),
          params: { isi: isiCerebellar, isProbe: isCatchTrial },
          trace: shouldSaveTrace ? [...trialData] : undefined
        }];
      });
      setIsBelling(false); setIsPuffing(false);
    } finally {
      setIsTrialRunning(false);
      setCerebellarTrialType(null);
    }
  }, [isiCerebellar, g_us_o, g_cs_o, g_us_b, g_cs_b, g_c, beta_cerebellar, p0, c0, e0, n0, m0, tP, isTrialRunning]);

  const runCerebellarSequence = useCallback(async () => {
    if (isTrialRunning) return;
    setIsTrialRunning(true);
    try {
      await runCerebellarTrial(false, true);
      await new Promise(r => setTimeout(r, 400));
      await runCerebellarTrial(true, false);
    } finally {
      setIsTrialRunning(false);
      setCerebellarTrialType(null);
    }
  }, [runCerebellarTrial, isTrialRunning]);

  const runEyeblinkTrial = useCallback(async (isCatchTrial: boolean = false) => {
    if (isTrialRunning) return;
    setIsTrialRunning(true);
    try {
      const startTime = Date.now();
      setCurrentTrace([]); setBlinkValue(0);
      const willBlink = (Math.random() * 100 < strength) && (strength > 5);
      const tStart = 100, tEnd = 600, pStart = tStart + isiEyeblink, pEnd = pStart + 10;
      const hasUS = !isCatchTrial && lambda > 0;
      setTraceMarkers({ toneS: tStart, toneE: tEnd, puffS: hasUS ? pStart : -1, puffE: hasUS ? pEnd : -1 });
      const accTrace: any[] = [];
      for (let t = 0; t <= 1000; t += 20) {
        let blink = 0;
        // CR Logic
        if (willBlink && t > tStart + 150 && t <= pStart) {
          blink = (strength / 100) * Math.sin(Math.PI * (t - (tStart + 150)) / (pStart - (tStart + 150)));
        }
        // UR Logic (Transient)
        if (hasUS && t >= pStart) {
          if (t <= pEnd + 60) {
            blink = 1.0; // Stay fully closed during and slightly after the puff
          } else if (t <= pEnd + 500) {
            const decayTime = t - (pEnd + 60);
            blink = Math.max(blink, Math.exp(-decayTime / 150));
          }
        }
        accTrace.push({ time: t, blink, tone: (t >= tStart && t <= tEnd ? 1 : 0), puff: (t >= pStart && t <= pEnd && hasUS ? 1 : 0) });
        if (t % 20 === 0) {
            setCurrentTrace([...accTrace]);
            setBlinkValue(blink);
            if (t === tStart) setIsBelling(true);
            if (t === tEnd) setIsBelling(false);
            if (t === pStart && hasUS) setIsPuffing(true);
            if (t === pEnd && hasUS) setIsPuffing(false);
        }
        await new Promise(r => setTimeout(r, 20));
      }
      const predictionError = isCatchTrial ? (0 - strength) : (lambda - strength);
      const newStrength = Math.min(100, Math.max(0, strength + alpha * beta_rw * predictionError));
      setStrength(newStrength);
      setHistory(prev => [...prev, {
        timestamp: startTime,
        type: isCatchTrial ? 'CATCH_EYE' : 'PAIRED_EYE',
        strength: newStrength,
        response: willBlink ? 'CONDITIONED' : 'UNCONDITIONED',
        predictionError
      }]);
    } finally {
      setIsTrialRunning(false); setIsBelling(false); setIsPuffing(false);
    }
  }, [strength, isiEyeblink, alpha, beta_rw, lambda, isTrialRunning]);

  useEffect(() => {
    let timer: any;
    if (isAutoPlaying && !isTrialRunning) {
      timer = setTimeout(async () => {
        if (mode === 'CEREBELLAR') {
          if (cerebellarTrainingMode === 'ACQUISITION') {
            await runCerebellarTrial(false, true);
          } else {
            await runCerebellarTrial(true, true);
          }
        }
        else if (mode === 'EYEBLINK') await runEyeblinkTrial(false);
      }, 1000); 
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, isTrialRunning, mode, runCerebellarTrial, runEyeblinkTrial, cerebellarTrainingMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Brain size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Conditioning<span className="text-indigo-600">Lab</span></h1>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => { setMode('SALIVARY'); resetExperiment(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'SALIVARY' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Dog size={16} /> Salivary</button>
            <button onClick={() => { setMode('EYEBLINK'); resetExperiment(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'EYEBLINK' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Eye size={16} /> Eyeblink</button>
            <button onClick={() => { setMode('BLOCKING'); resetExperiment(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'BLOCKING' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Layers size={16} /> Blocking</button>
            <button onClick={() => { setMode('CEREBELLAR'); resetExperiment(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'CEREBELLAR' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}><Network size={16} /> Cerebellar</button>
          </div>
          <button onClick={resetExperiment} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
            <RefreshCw size={14} /> Clear Session
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className={`${mode === 'CEREBELLAR' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-8`}>
            {mode === 'BLOCKING' ? (
              <BlockingPanel vA={strengthA} vB={strengthB} history={history} onTrainA={() => runBlockingTrial('A', true)} onTrainAB={() => runBlockingTrial('AB', true)} onTestA={() => runBlockingTrial('A', false)} onTestB={() => runBlockingTrial('B', false)} onReset={resetExperiment} />
            ) : mode === 'CEREBELLAR' ? (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Biophysical Cerebellar Model</h2>
                    <p className="text-slate-500 text-sm">Interactive lab demonstrating associative learning mechanisms.</p>
                    <p className="text-[9px] text-slate-400 mt-2 max-w-2xl leading-tight italic">
                      Lepora, N. F., Porrill, J., Yeo, C. H., & Dean, P. (2010). Sensory prediction or motor control? Application of Marr–Albus type models of cerebellar function to classical conditioning. Frontiers in computational neuroscience, 4, 140.
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-600`}><ActivityIcon size={14} /> Live Experiment</div>
                </div>
                <CerebellarPanel 
                  history={history} weights={synapticWeights} basisFunctions={basisActivity} purkinjeOutput={purkinjeInhibition} 
                  isTraining={isTrialRunning} isCSActive={isBelling} isUSActive={isPuffing} trialType={cerebellarTrialType}
                  trace={currentTrace} beta={beta_cerebellar} isi={isiCerebellar} setBeta={setBeta_Cerebellar} setIsi={setIsiCerebellar}
                  isAutoPlaying={isAutoPlaying} setIsAutoPlaying={setIsAutoPlaying}
                  trainingMode={cerebellarTrainingMode} setTrainingMode={setCerebellarTrainingMode}
                  onRunTrial={() => runCerebellarTrial(cerebellarTrainingMode === 'EXTINCTION', true)}
                  onRunProbe={() => runCerebellarTrial(true, false)}
                  gains={{ us_o: g_us_o, cs_o: g_cs_o, us_b: g_us_b, cs_b: g_cs_b, c_out: g_c }}
                  setGains={{ us_o: setG_US_O, cs_o: setG_CS_O, us_b: setG_US_B, cs_b: setG_CS_B, c_out: setG_C }}
                  params={{ p0, c0, e0, n0, m0, tP }}
                  setParams={{ p0: setP0, c0: setC0, e0: setE0, n0: setN0, m0: setM0, tP: setTP }}
                />
                <ArchitectureDiagram />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{mode === 'SALIVARY' ? 'Testing Chamber' : mode === 'EYEBLINK' ? 'Rescorla Wagner Simulation' : 'RW Simulation'}</h2>
                    <p className="text-slate-500 text-sm">Interactive lab demonstrating associative learning mechanisms.</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${mode === 'SALIVARY' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}><ActivityIcon size={14} /> Live Experiment</div>
                </div>

                {mode === 'SALIVARY' ? (
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="relative">
                      <Subject isExcited={isExcited} isSalivating={isSalivating} isBelling={isBelling} />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-orange-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CR Probability</span>
                        <span className="text-xl font-black text-orange-500">{Math.round(strength)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={() => triggerSalivaryResponse('BOTH')} className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition-all font-bold">Pair CS+US</button>
                      <button onClick={() => triggerSalivaryResponse('BELL')} className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-100 font-bold">Bell Only</button>
                      <button onClick={() => triggerSalivaryResponse('FOOD')} className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-100 font-bold">Food Only</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="sticky top-24 z-30 bg-white pt-2 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EyeblinkSubject blinkValue={blinkValue} isToneActive={isBelling} isPuffActive={isPuffing} toneFreq={toneFreq} />
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-[220px] flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Learning Curve</h3>
                              <p className="text-lg font-black text-indigo-600 leading-none">Strength (V)</p>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-slate-800">{Math.round(strength)}%</span>
                            </div>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={history.map((h, i) => ({ trial: i + 1, val: h.strength }))}>
                                <defs>
                                  <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="trial" hide />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                  itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                  labelStyle={{ display: 'none' }}
                                  formatter={(val: number) => [`${Math.round(val)}%`, 'Strength']}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="val" 
                                  stroke="#4f46e5" 
                                  strokeWidth={4} 
                                  fillOpacity={1} 
                                  fill="url(#colorStrength)"
                                  animationDuration={1000}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-[9px] text-slate-400 mt-2 italic text-center">
                            Associative strength (V) increases with surprise.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-6">
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Sigma size={14} /> Parameters</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2"><span>ISI (ms)</span><span className="font-mono text-indigo-600">{isiEyeblink} ms</span></div>
                          <input type="range" min="0" max="950" step="10" value={isiEyeblink} onChange={(e) => setIsiEyeblink(Number(e.target.value))} className="w-full accent-indigo-600" />
                        </div>
                        <div className="flex items-center gap-4 pt-4">
                          <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isAutoPlaying ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'}`}>{isAutoPlaying ? 'Stop' : 'Auto-Train'}</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-indigo-100">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>CS Salience (α)</span>
                            <span className="font-mono text-indigo-600">{alpha.toFixed(2)}</span>
                          </div>
                          <input 
                            type="range" min="0.05" max="1.0" step="0.05" 
                            value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} 
                            className="w-full accent-indigo-600" 
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>US Salience (β)</span>
                            <span className="font-mono text-indigo-600">{beta_rw.toFixed(2)}</span>
                          </div>
                          <input 
                            type="range" min="0.05" max="1.0" step="0.05" 
                            value={beta_rw} onChange={(e) => setBeta_RW(Number(e.target.value))} 
                            className="w-full accent-indigo-600" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => runEyeblinkTrial(false)} disabled={isTrialRunning} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest">Run Trial</button>
                      <button onClick={() => runEyeblinkTrial(true)} disabled={isTrialRunning} className="px-8 py-4 border-2 border-indigo-100 rounded-2xl font-black uppercase tracking-widest">Probe CS</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {mode !== 'CEREBELLAR' && (
            <div className="lg:col-span-4 space-y-6">
              <DataPanel history={history} strength={strength} mode={mode} />
              {mode === 'EYEBLINK' && <RescorlaWagnerPanel history={history} currentStrength={strength} alpha={alpha} beta={beta_rw} lambda={lambda} setLambda={setLambda} />}
              {mode === 'SALIVARY' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><HistoryIcon size={14} /> Trial Log</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {history.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No trials recorded yet.</p>
                    ) : (
                      history.slice().reverse().map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black text-slate-600 uppercase">{h.type}</span>
                          <span className={`text-[9px] font-bold ${h.response === 'CONDITIONED' ? 'text-orange-500' : 'text-slate-400'}`}>{h.response}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-8 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-slate-400">Associative Value (V)</span>
            <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className={`h-full transition-all duration-700 bg-indigo-500`} style={{ width: `${strength}%` }}></div>
            </div>
            <span className="text-xs font-black text-slate-800">{Math.round(strength)}%</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
