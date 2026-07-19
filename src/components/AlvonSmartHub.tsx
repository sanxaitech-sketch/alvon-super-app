import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, Clock, Calendar, ArrowLeft, Play, Pause, RotateCcw, 
  Trash2, Cpu, Info, Check, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';

export const AlvonSmartHub: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in" id="alvon-smarthub-container">
      {/* Top Welcome Title Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 font-display flex items-center gap-2">
            <Cpu className="w-6 h-6 text-rose-600 animate-spin-slow" />
            <span>Alvon Smart Tools</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Secure, premium, and lightweight offline-first utility suite.
          </p>
        </div>
        
        {/* Offline Cache Status */}
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-3 py-1.5 rounded-full self-start md:self-auto shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold font-mono uppercase tracking-wider">
            Service Worker Active
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTool === null ? (
          <motion.div
            key="tools-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Age Calculator Card */}
            <ToolCard
              title="Age Calculator"
              desc="Calculate your exact age in years, months, days, find birth days and next birthday countdown."
              icon={<Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              emoji="🎂"
              onClick={() => setActiveTool('age-calc')}
            />

            {/* Basic Calculator Card */}
            <ToolCard
              title="Basic Calculator"
              desc="Fast, interactive, and responsive calculator for clean daily financial arithmetic."
              icon={<Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              emoji="🧮"
              onClick={() => setActiveTool('basic-calc')}
            />

            {/* Stop Watch Card */}
            <ToolCard
              title="Stop Watch"
              desc="Highly responsive milisecond stopwatch with lap split records for productivity tracking."
              icon={<Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              emoji="⏱️"
              onClick={() => setActiveTool('stopwatch')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="active-tool-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activeTool === 'age-calc' && <AgeCalculatorTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'basic-calc' && <BasicCalculatorTool onBack={() => setActiveTool(null)} />}
            {activeTool === 'stopwatch' && <StopwatchTool onBack={() => setActiveTool(null)} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Generic Tool Card Component
interface ToolCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  emoji: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, desc, icon, emoji, onClick }) => {
  return (
    <GlassCard 
      onClick={onClick}
      className="p-6 bg-white/85 dark:bg-slate-900/95 border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:border-rose-500/50 dark:hover:border-rose-500/50 transition-all duration-300 shadow-sm cursor-pointer group"
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-rose-500/10 transition-colors duration-300">
            {icon}
          </div>
          <span className="text-2xl">{emoji}</span>
        </div>
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-display group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
          {desc}
        </p>
      </div>
      <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mt-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <span>Launch Tool</span>
        <span>→</span>
      </div>
    </GlassCard>
  );
};

// Tool Header Component
interface ToolHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onBack: () => void;
}

const ToolHeader: React.FC<ToolHeaderProps> = ({ title, subtitle, icon, onBack }) => {
  return (
    <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-100 font-display leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 uppercase tracking-wider">{subtitle}</p>
        </div>
      </div>
      <button 
        onClick={onBack}
        className="flex items-center space-x-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Exit Tool</span>
      </button>
    </div>
  );
};

/* 1. PRECISE AGE CALCULATOR TOOL */
const AgeCalculatorTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [dob, setDob] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [ageResult, setAgeResult] = useState<any>(null);

  useEffect(() => {
    calculateAge();
  }, [dob, targetDate]);

  const calculateAge = () => {
    if (!dob || !targetDate) return;
    const birth = new Date(dob);
    const curr = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(curr.getTime())) {
      setAgeResult({ error: "Invalid calendar inputs." });
      return;
    }

    if (curr < birth) {
      setAgeResult({ error: "Target date is earlier than birth date." });
      return;
    }

    let years = curr.getFullYear() - birth.getFullYear();
    let months = curr.getMonth() - birth.getMonth();
    let days = curr.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(curr.getFullYear(), curr.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Extended Statistics
    const diffMs = curr.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = (years * 12) + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Constellation / Zodiac
    const birthMonth = birth.getMonth() + 1;
    const birthDay = birth.getDate();
    let zodiac = "";
    let zodiacDesc = "";

    if ((birthMonth === 3 && birthDay >= 21) || (birthMonth === 4 && birthDay <= 19)) {
      zodiac = "Aries ♈";
      zodiacDesc = "Adventurous, energetic, and courageous.";
    } else if ((birthMonth === 4 && birthDay >= 20) || (birthMonth === 5 && birthDay <= 20)) {
      zodiac = "Taurus ♉";
      zodiacDesc = "Patient, reliable, warmhearted, and loving.";
    } else if ((birthMonth === 5 && birthDay >= 21) || (birthMonth === 6 && birthDay <= 20)) {
      zodiac = "Gemini ♊";
      zodiacDesc = "Adaptable, versatile, communicative, and witty.";
    } else if ((birthMonth === 6 && birthDay >= 21) || (birthMonth === 7 && birthDay <= 22)) {
      zodiac = "Cancer ♋";
      zodiacDesc = "Emotional, loving, intuitive, and protective.";
    } else if ((birthMonth === 7 && birthDay >= 23) || (birthMonth === 8 && birthDay <= 22)) {
      zodiac = "Leo ♌";
      zodiacDesc = "Generous, warmhearted, creative, and enthusiastic.";
    } else if ((birthMonth === 8 && birthDay >= 23) || (birthMonth === 9 && birthDay <= 22)) {
      zodiac = "Virgo ♍";
      zodiacDesc = "Modest, shy, meticulous, reliable, and analytical.";
    } else if ((birthMonth === 9 && birthDay >= 23) || (birthMonth === 10 && birthDay <= 22)) {
      zodiac = "Libra ♎";
      zodiacDesc = "Diplomatic, urbane, romantic, easygoing, and sociable.";
    } else if ((birthMonth === 10 && birthDay >= 23) || (birthMonth === 11 && birthDay <= 21)) {
      zodiac = "Scorpio ♏";
      zodiacDesc = "Determined, forceful, emotional, intuitive, and powerful.";
    } else if ((birthMonth === 11 && birthDay >= 22) || (birthMonth === 12 && birthDay <= 21)) {
      zodiac = "Sagittarius ♐";
      zodiacDesc = "Optimistic, freedom-loving, jovial, and good-humored.";
    } else if ((birthMonth === 12 && birthDay >= 22) || (birthMonth === 1 && birthDay <= 19)) {
      zodiac = "Capricorn ♑";
      zodiacDesc = "Practical, prudent, ambitious, disciplined, and patient.";
    } else if ((birthMonth === 1 && birthDay >= 20) || (birthMonth === 2 && birthDay <= 18)) {
      zodiac = "Aquarius ♒";
      zodiacDesc = "Friendly, humanitarian, honest, loyal, and original.";
    } else {
      zodiac = "Pisces ♓";
      zodiacDesc = "Imaginative, sensitive, compassionate, and kind.";
    }

    // Next birthday calculation
    const nextBday = new Date(curr.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < curr) {
      nextBday.setFullYear(curr.getFullYear() + 1);
    }
    const nextBdayDiff = nextBday.getTime() - curr.getTime();
    const nextBirthdayDays = Math.ceil(nextBdayDiff / (1000 * 60 * 60 * 24));

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const birthDayOfWeek = weekdays[birth.getDay()];

    setAgeResult({
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      zodiac,
      zodiacDesc,
      nextBirthdayDays,
      birthDayOfWeek
    });
  };

  return (
    <GlassCard className="bg-white/90 dark:bg-slate-900/95 p-6 border border-slate-100 dark:border-slate-800 shadow-lg">
      <ToolHeader 
        title="Exact Age Calculator" 
        subtitle="Chronology alignment & astro star constellations"
        icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        onBack={onBack}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Date of Birth</label>
            <input 
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-bold text-slate-800 dark:text-slate-100 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Target Evaluation Date</label>
            <input 
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs font-bold text-slate-800 dark:text-slate-100 font-mono"
            />
          </div>

          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/40 dark:border-blue-900/20 text-[11px] text-slate-600 dark:text-slate-400 rounded-xl leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span>This utility calculates precise biological age details, Astro Constellations, and birthday countdown parameters.</span>
          </div>
        </div>

        {/* Chronology Display */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col justify-between">
          {ageResult && !ageResult.error ? (
            <div className="space-y-5">
              <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider font-mono">Current Calculated Age</span>
                <div className="flex justify-center items-baseline space-x-1.5 mt-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-slate-100 font-mono">{ageResult.years}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">yrs</span>
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono pl-3">{ageResult.months}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">mos</span>
                  <span className="text-xl font-medium text-slate-700 dark:text-slate-300 font-mono pl-2">{ageResult.days}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">days</span>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase font-mono">Born Weekday</p>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1">{ageResult.birthDayOfWeek}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase font-mono">Next Birthday</p>
                  <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">{ageResult.nextBirthdayDays} Days</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center col-span-2">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase font-mono">Zodiac Constellation</p>
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-1">{ageResult.zodiac}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{ageResult.zodiacDesc}</p>
                </div>
              </div>

              {/* Extended Metrics */}
              <div className="bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-xl text-[11px] space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Total Months:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{ageResult.totalMonths.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Total Weeks:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{ageResult.totalWeeks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500">Total Days:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{ageResult.totalDays.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
              <span className="text-rose-500 font-bold text-xs">{ageResult?.error || "Error analyzing dates."}</span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

/* 2. BASIC CALCULATOR TOOL */
const BasicCalculatorTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === '⌫') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    } else if (val === '=') {
      try {
        // Safe evaluation of basic math expressions using a Function constructor or simple solver
        const fullExpr = equation + display;
        // Basic expression validation (allow only digits, arithmetic, dot, spaces)
        if (!/^[0-9+\-*/. ]+$/.test(fullExpr)) {
          throw new Error("Invalid characters");
        }
        // Safe computation using simple javascript Function constructor
        const computed = new Function(`return (${fullExpr})`)();
        const formattedResult = Number(Number(computed).toFixed(8)).toString(); // avoid long decimals
        setHistory(prev => [`${fullExpr} = ${formattedResult}`, ...prev.slice(0, 4)]);
        setDisplay(formattedResult);
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(display + ' ' + val + ' ');
      setDisplay('0');
    } else if (val === '%') {
      const num = parseFloat(display);
      if (!isNaN(num)) {
        setDisplay((num / 100).toString());
      }
    } else {
      // Append number
      if (display === '0' || display === 'Error') {
        setDisplay(val);
      } else {
        setDisplay(display + val);
      }
    }
  };

  const keys = [
    ['C', '⌫', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <GlassCard className="bg-white/90 dark:bg-slate-900/95 p-6 border border-slate-100 dark:border-slate-800 shadow-lg max-w-md mx-auto">
      <ToolHeader 
        title="Basic Math Calculator" 
        subtitle="Responsive arithmetic utility"
        icon={<Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
        onBack={onBack}
      />

      <div className="space-y-4">
        {/* Ledger display screen */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850 text-right font-mono relative overflow-hidden">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 h-4 uppercase tracking-widest font-bold">
            {equation}
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100 truncate mt-1">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {keys.flatMap((row, rIdx) => 
            row.map((k) => {
              const isOperator = ['/', '*', '-', '+', '='].includes(k);
              const isClear = ['C', '⌫'].includes(k);
              const isColSpan2 = k === '0' && rIdx === 4; // layout alignment
              
              return (
                <button
                  key={k}
                  onClick={() => handlePress(k)}
                  className={`py-3.5 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer ${
                    isColSpan2 ? 'col-span-2' : ''
                  } ${
                    isClear 
                      ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400' 
                      : isOperator
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {k}
                </button>
              );
            })
          )}
        </div>

        {/* Audit History Log */}
        {history.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest block mb-1.5">Equation History</span>
            <div className="space-y-1.5 max-h-24 overflow-y-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">
              {history.map((h, idx) => (
                <div key={idx} className="flex justify-between hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <span>{h.split(' = ')[0]} =</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{h.split(' = ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

/* 3. MILLISECOND STOPWATCH TOOL */
interface LapSplit {
  lap: number;
  time: string;
  split: string;
}

const StopwatchTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [time, setTime] = useState<number>(0); // Time in milliseconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapSplit[]>([]);
  
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    startTimeRef.current = Date.now() - accumulatedTimeRef.current;
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setTime(elapsed);
      accumulatedTimeRef.current = elapsed;
    }, 10); // Update every 10ms for centisecond resolution
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTime(0);
    accumulatedTimeRef.current = 0;
    setLaps([]);
  };

  const recordLap = () => {
    if (!isRunning) return;
    const currentSplitStr = formatTime(time);
    
    // Calculate last lap duration
    const previousLapAccumulated = laps.length > 0 
      ? laps[0].rawTime 
      : 0;
    const lapTimeRaw = time - previousLapAccumulated;
    const lapTimeStr = formatTime(lapTimeRaw);

    const newLap: LapSplit & { rawTime: number } = {
      lap: laps.length + 1,
      time: lapTimeStr,
      split: currentSplitStr,
      rawTime: time
    };

    setLaps(prev => [newLap, ...prev]);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    const cStr = centiseconds.toString().padStart(2, '0');

    return `${mStr}:${sStr}.${cStr}`;
  };

  return (
    <GlassCard className="bg-white/90 dark:bg-slate-900/95 p-6 border border-slate-100 dark:border-slate-800 shadow-lg max-w-md mx-auto">
      <ToolHeader 
        title="Millisecond Stop Watch" 
        subtitle="Precise mechanical time chronometer"
        icon={<Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        onBack={onBack}
      />

      <div className="space-y-6 text-center">
        {/* Large Chrono Screen */}
        <div className="bg-slate-50 dark:bg-slate-950/75 py-8 rounded-2xl border border-slate-200/50 dark:border-slate-850 font-mono shadow-inner">
          <div className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-wider">
            {formatTime(time)}
          </div>
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 block">
            Minutes : Seconds . Centiseconds
          </span>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex justify-center items-center space-x-3">
          <button
            onClick={resetTimer}
            className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border border-slate-200/50 dark:border-slate-700 cursor-pointer transition-all active:scale-95"
            title="Reset stopwatch"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-full shadow-md flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-md flex items-center space-x-2 cursor-pointer transition-all active:scale-95 animate-pulse-slow"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START TIMER</span>
            </button>
          )}

          <button
            onClick={recordLap}
            disabled={!isRunning}
            className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 rounded-full border border-slate-200/50 dark:border-slate-700 cursor-pointer transition-all active:scale-95"
            title="Split/Lap time"
          >
            <Zap className="w-5 h-5" />
          </button>
        </div>

        {/* Lap Split Ledger */}
        {laps.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider block mb-2.5">
              Lap Split Ledger
            </span>
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {laps.map((l) => (
                <div 
                  key={l.lap} 
                  className="flex items-center justify-between text-xs font-mono py-2 px-3 bg-slate-50/50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <span className="font-bold text-slate-500">Lap {l.lap.toString().padStart(2, '0')}</span>
                  <div className="flex space-x-4">
                    <span className="text-slate-400 dark:text-slate-500">Time: <b className="text-slate-700 dark:text-slate-300 font-bold">{l.time}</b></span>
                    <span className="text-slate-400 dark:text-slate-500">Split: <b className="text-slate-700 dark:text-slate-300 font-bold">{l.split}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
