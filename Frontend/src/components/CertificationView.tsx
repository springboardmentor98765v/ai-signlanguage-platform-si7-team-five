import React, { useState } from 'react';
import { Award, Play, AlertCircle, CheckCircle, BrainCircuit, XCircle, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiBaseUrl } from '../utils/api';
import { CinematicSection } from './CinematicMotion';

type ExamLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

const LEVELS: { name: ExamLevel, title: string, desc: string, length: number }[] = [
  { name: 'Beginner', title: 'Beginner Basics', desc: 'Core alphabet and basic greetings.', length: 5 },
  { name: 'Intermediate', title: 'Intermediate Phrases', desc: 'Full words, days of week, and common questions.', length: 10 },
  { name: 'Advanced', title: 'Advanced Fluency', desc: 'Complex sentences and specialized vocabulary.', length: 15 },
  { name: 'Professional', title: 'Professional Interpreter', desc: 'High-speed professional fluency exam.', length: 20 },
];

export default function CertificationView() {
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel | null>(null);
  const [examState, setExamState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [examResultInfo, setExamResultInfo] = useState('');
  
  const handleStartExam = (level: ExamLevel) => {
    setSelectedLevel(level);
    setExamState('running');
    setCurrentQuestion(0);
    setScore(0);
  };

  const submitSignAttempt = async (attemptCorrect: boolean) => {
    setIsEvaluating(true);
    // Simulate AI inference delay for camera
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (attemptCorrect) {
      setScore(s => s + 1);
    }
    
    const config = LEVELS.find(l => l.name === selectedLevel)!;
    if (currentQuestion + 1 >= config.length) {
      // Exam finished
      const finalScore = attemptCorrect ? score + 1 : score;
      const passRatio = finalScore / config.length;
      const didPass = passRatio >= 0.8; // 80% passing threshold
      
      setPassed(didPass);
      setExamResultInfo(`You scored ${Math.round(passRatio * 100)}% on the ${selectedLevel} exam.`);
      setExamState('completed');
      
      // Attempt to save result to backend
      const token = localStorage.getItem('asl_access_token');
      if (token) {
        fetch(`${apiBaseUrl}/business/certifications/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            level: selectedLevel,
            score: Math.round(passRatio * 100),
            passed: didPass
          })
        }).catch(err => console.warn('Silent failure tracking certification', err));
      }
    } else {
      setCurrentQuestion(q => q + 1);
    }
    setIsEvaluating(false);
  };

  return (
    <CinematicSection delay={0.1} className="w-full max-w-5xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Formal Certification</h1>
          <p className="text-sm text-gray-500">Test your ASL fluency and earn verifiable professional certificates.</p>
        </div>
      </div>

      {examState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {LEVELS.map((level) => (
            <motion.div 
              key={level.name}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 cursor-pointer flex flex-col justify-between"
              onClick={() => handleStartExam(level.name)}
            >
              <div>
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{level.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{level.desc}</p>
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {level.length} Questions
                </div>
              </div>
              <button className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition flex justify-center items-center gap-1.5">
                <Play className="h-3.5 w-3.5" /> Start Exam
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {examState === 'running' && selectedLevel && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-white/90 backdrop-blur-3xl border border-white/60 shadow-premium rounded-[2rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedLevel} Exam</h2>
              <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {LEVELS.find(l => l.name === selectedLevel)?.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full border-[3px] border-emerald-500 flex items-center justify-center font-bold text-emerald-600 text-sm">
              {currentQuestion + 1}/{LEVELS.find(l => l.name === selectedLevel)?.length}
            </div>
          </div>
          
          <div className="aspect-video bg-gray-900 rounded-2xl w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-white relative overflow-hidden backdrop-blur-md shadow-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
             {isEvaluating ? (
               <div className="flex flex-col items-center">
                 <BrainCircuit className="h-12 w-12 text-emerald-400 animate-pulse mb-3" />
                 <p className="text-sm font-semibold tracking-widest text-emerald-300">ANALYZING GESTURE...</p>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <Camera className="h-10 w-10 text-gray-600 mb-3" />
                 <p className="text-gray-400 text-sm font-medium">Camera Feed Active</p>
                 <p className="text-2xl font-bold mt-4">Sign: {['A', 'B', 'C', 'Hello', 'Thank You'][currentQuestion % 5]}</p>
               </div>
             )}
          </div>
          
          <div className="flex justify-center gap-4 mt-8 max-w-2xl mx-auto">
            <button 
              disabled={isEvaluating}
              onClick={() => submitSignAttempt(false)} 
              className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl disabled:opacity-50 transition"
            >
              Simulate Incorrect
            </button>
            <button 
              disabled={isEvaluating}
              onClick={() => submitSignAttempt(true)}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 transition drop-shadow-md"
            >
              Simulate Correct
            </button>
          </div>
        </motion.div>
      )}

      {examState === 'completed' && selectedLevel && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 bg-white border border-gray-100 shadow-premium rounded-[2.5rem] p-10 max-w-2xl mx-auto text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${passed ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20' : 'bg-red-100 text-red-600 shadow-red-500/20'}`}>
            {passed ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {passed ? 'Certification Passed!' : 'Exam Failed'}
          </h2>
          <p className="text-gray-500 mb-8">{examResultInfo}</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => setExamState('idle')}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Return to Menu
            </button>
            {passed && (
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `${apiBaseUrl}/business/reports/me?report_type=certification&format=pdf`;
                  window.open(link.href, '_blank');
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition flex justify-center items-center gap-2"
              >
                <Award className="h-4 w-4" /> Download Certificate
              </button>
            )}
          </div>
        </motion.div>
      )}
    </CinematicSection>
  );
}
