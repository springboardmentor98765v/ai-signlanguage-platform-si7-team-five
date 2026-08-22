import React, { useState, useEffect, useRef } from 'react';
import { Award, Play, CheckCircle, BrainCircuit, XCircle, Camera, CameraOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { apiBaseUrl, aiApiBaseUrl } from '../utils/api';
import { CinematicSection } from './CinematicMotion';

interface ExamConfig {
  level: string;
  required_signs: string[];
  pass_score: number;
}

interface ExamAnswer {
  expected_label: string;
  predicted_label: string;
  confidence: number;
}

export default function CertificationView() {
  const [levelsData, setLevelsData] = useState<ExamConfig[]>([]);
  const [levelsError, setLevelsError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ExamConfig | null>(null);
  const [examState, setExamState] = useState<'idle' | 'running' | 'completed'>('idle');
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [examAnswers, setExamAnswers] = useState<ExamAnswer[]>([]);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  
  const [finalScore, setFinalScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [examResultInfo, setExamResultInfo] = useState('');
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState('Starting Camera...');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [aiError, setAiError] = useState('');
  const predictionInFlightRef = useRef(false);
  const [predictedSign, setPredictedSign] = useState<string>('—');
  const [confidence, setConfidence] = useState<number>(0);
  const [isSignCorrect, setIsSignCorrect] = useState<boolean | null>(null);
  const stableFramesRef = useRef<{sign: string, count: number}>({sign: '', count: 0});
  
  const currentQuestionRef = useRef(currentQuestion);
  const hasSubmittedCurrentRef = useRef(hasSubmittedCurrent);

  useEffect(() => {
    // Fetch levels from backend on mount
    fetch(`${apiBaseUrl}/business/certification/levels`)
      .then(res => {
        if (!res.ok) throw new Error('API Response not ok');
        return res.json();
      })
      .then(data => setLevelsData(data))
      .catch(err => {
        console.warn('Could not load certification levels', err);
        setLevelsError('Could not load formal exam parameters. Verify that your backend platform API is active.');
      });
  }, []);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
    hasSubmittedCurrentRef.current = hasSubmittedCurrent;
  }, [currentQuestion, hasSubmittedCurrent]);

  const startCamera = async () => {
    try {
      setCameraError(false);
      setCameraErrorMessage('Starting Camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setCameraError(true);
      setCameraErrorMessage('Camera access is required to take the Certification Exam.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (examState === 'running' && stream && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(e => console.warn('Could not auto-play video:', e));
    }
  }, [examState, stream]);

  useEffect(() => {
    return () => stopCamera();
  }, [stream]);
  
  const handleStartExam = (config: ExamConfig) => {
    setSelectedLevel(config);
    setExamState('running');
    setCurrentQuestion(0);
    setExamAnswers([]);
    setHasSubmittedCurrent(false);
    resetAIState();
    startCamera();
  };

  const resetAIState = () => {
    setPredictedSign('—');
    setConfidence(0);
    setIsSignCorrect(null);
    setAiError('');
    stableFramesRef.current = {sign: '', count: 0};
  };

  const handleSubmitAnswer = () => {
    if (!selectedLevel) return;
    const targetSign = selectedLevel.required_signs[currentQuestion].toUpperCase();
    
    // Save locally
    const newAnswers = [...examAnswers];
    newAnswers[currentQuestion] = {
      expected_label: targetSign,
      predicted_label: predictedSign === '—' ? 'UNKNOWN' : predictedSign,
      confidence: confidence / 100, // API expects 0-1 range based on contract
    };
    setExamAnswers(newAnswers);

    // Auto Advance
    if (currentQuestion < selectedLevel.required_signs.length - 1) {
       const nextQ = currentQuestion + 1;
       setCurrentQuestion(nextQ);
       
       if (newAnswers[nextQ]) {
          const recorded = newAnswers[nextQ];
          setPredictedSign(recorded.predicted_label);
          setConfidence(Math.round(recorded.confidence * 100));
          setIsSignCorrect(recorded.predicted_label === recorded.expected_label);
          setHasSubmittedCurrent(true);
       } else {
          setHasSubmittedCurrent(false);
          setPredictedSign('—');
          setConfidence(0);
          setIsSignCorrect(null);
          setAiError('');
          stableFramesRef.current = {sign: '', count: 0};
       }
    } else {
       setHasSubmittedCurrent(true);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(c => c + 1);
    setHasSubmittedCurrent(false);
    resetAIState();
    
    // Auto-restore previous prediction if it was already recorded
    if (examAnswers[currentQuestion + 1]) {
      const recorded = examAnswers[currentQuestion + 1];
      setPredictedSign(recorded.predicted_label);
      setConfidence(Math.round(recorded.confidence * 100));
      setIsSignCorrect(recorded.predicted_label === recorded.expected_label);
      setHasSubmittedCurrent(true);
    }
  };

  const handlePrevQuestion = () => {
    setCurrentQuestion(c => c - 1);
    // Restore the recorded answer
    const recorded = examAnswers[currentQuestion - 1];
    if (recorded) {
      setPredictedSign(recorded.predicted_label);
      setConfidence(Math.round(recorded.confidence * 100));
      setIsSignCorrect(recorded.predicted_label === recorded.expected_label);
      setHasSubmittedCurrent(true);
    } else {
      setHasSubmittedCurrent(false);
      resetAIState();
    }
  };

  const handleFinishExam = async () => {
    if (!selectedLevel) return;
    setIsEvaluating(true);
    
    const payload = {
      level: selectedLevel.level,
      answers: examAnswers
    };

    const token = localStorage.getItem('asl_access_token');
    if (!token) {
      setExamResultInfo("Unable to save exam result. Please check your connection.");
      setExamState('completed');
      stopCamera();
      setIsEvaluating(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/business/certification/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || 'Submission failed');

      setPassed(data.passed);
      setFinalScore(data.score);
      setExamResultInfo("");
      setExamState('completed');
      stopCamera();
    } catch (err) {
      console.warn('Failed tracking certification', err);
      setExamResultInfo("Unable to save exam result. Please check your connection.");
      setExamState('completed');
      stopCamera();
    }
    setIsEvaluating(false);
  };

  const captureAndPredict = async () => {
    // Return early if not running, no video, or we've already locked the answer for this question
    if (!videoRef.current || examState !== 'running' || predictionInFlightRef.current || hasSubmittedCurrentRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
    if (!blob) return;

    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');
    
    const specificTargetSign = selectedLevel?.required_signs[currentQuestionRef.current] || '';
    formData.append('expected_label', specificTargetSign);

    try {
      predictionInFlightRef.current = true;
      const response = await fetch(`${aiApiBaseUrl}/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Prediction failed');
      
      setAiError('');

      if (!data.hand_detected && !data.predicted_sign) {
        // Do not erase correct state if we just temporarily lost hand tracking
        return;
      }

      const predicted = String(data.predicted_sign || 'unknown').toUpperCase();
      const confidenceValue = Math.round(Number(data.confidence || 0) * 100);
      
      // Stability Logic: require 2 frames of the same prediction
      if (predicted !== 'UNKNOWN') {
        if (stableFramesRef.current.sign === predicted) {
           stableFramesRef.current.count++;
        } else {
           stableFramesRef.current.sign = predicted;
           stableFramesRef.current.count = 1;
        }

        if (stableFramesRef.current.count >= 2) {
           setPredictedSign(predicted);
           setConfidence(confidenceValue);
           setIsSignCorrect(predicted === specificTargetSign.toUpperCase());
        }
      }
    } catch (err) {
      console.warn('AI prediction failed.', err);
    } finally {
      predictionInFlightRef.current = false;
    }
  };

  useEffect(() => {
    let intervalId: number | undefined;
    if (examState === 'running') {
      intervalId = window.setInterval(() => {
        void captureAndPredict();
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [examState, selectedLevel]);

  return (
    <CinematicSection delay={0.1} className="w-full max-w-5xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Certification Exams</h1>
          <p className="text-sm text-gray-500">Test your ASL fluency and earn verifiable professional certificates.</p>
        </div>
        {examState === 'running' && (
          <button 
            onClick={() => {
              setExamState('idle');
              stopCamera();
            }}
            className="px-5 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-bold rounded-xl transition flex items-center gap-2"
          >
            <XCircle className="h-5 w-5" /> Cancel Exam
          </button>
        )}
      </div>

      {examState === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {levelsError ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 gap-3">
               <AlertCircle className="h-8 w-8 text-red-500" />
               <p className="font-semibold">{levelsError}</p>
            </div>
          ) : levelsData.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-emerald-600 animate-pulse gap-3">
               <BrainCircuit className="h-10 w-10 opacity-70" />
               <p className="font-semibold">Loading certification levels...</p>
            </div>
          ) : levelsData.map((level) => (
            <motion.div 
              key={level.level}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 cursor-pointer flex flex-col justify-between"
              onClick={() => handleStartExam(level)}
            >
              <div>
                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{level.level}</h3>
                <p className="text-xs text-gray-500 mb-4">Required pass score: {level.pass_score}%</p>
                <div className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {level.required_signs.length} Questions
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
          
          {/* Top Info Bar with Corner Navigation */}
          <div className="flex items-center justify-between mb-6 relative px-4">
            <button 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="p-3 bg-white border border-emerald-200 rounded-full shadow-md hover:bg-emerald-50 disabled:opacity-30 transition absolute left-0 z-10"
              title="Previous Question"
            >
              <ChevronLeft className="h-8 w-8 text-emerald-600" />
            </button>

            <div className="text-center w-full">
              <p className="text-sm font-semibold text-emerald-600 tracking-wider uppercase mb-1">TARGET SIGN</p>
              <p className="text-4xl font-bold font-sans tracking-tight text-gray-900">"{selectedLevel.required_signs[currentQuestion]}"</p>
            </div>

            <button 
              onClick={handleNextQuestion}
              disabled={currentQuestion === selectedLevel.required_signs.length - 1}
              className={`p-3 bg-white border border-emerald-200 rounded-full shadow-md transition absolute right-0 z-10 hover:bg-emerald-50 disabled:opacity-30 ${currentQuestion === selectedLevel.required_signs.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
              title="Next Question"
            >
              <ChevronRight className="h-8 w-8 text-emerald-600" />
            </button>
          </div>

          <div className="aspect-video bg-gray-900 rounded-2xl w-full max-w-2xl mx-auto flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
             {!cameraError && stream ? (
               <video
                 ref={videoRef}
                 autoPlay
                 playsInline
                 muted
                 className="w-full h-full object-cover scale-x-[-1] absolute inset-0"
               />
             ) : (
               <div className="flex flex-col items-center absolute inset-0 justify-center bg-gray-900/90 z-0">
                 {cameraError ? (
                   <>
                     <CameraOff className="h-10 w-10 text-red-400 mb-3" />
                     <p className="text-red-300 text-sm font-medium mb-4">{cameraErrorMessage}</p>
                     <button 
                       onClick={startCamera} 
                       className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
                     >
                       Try Again
                     </button>
                   </>
                 ) : (
                   <>
                     <Camera className="h-10 w-10 text-gray-600 mb-3 animate-pulse" />
                     <p className="text-gray-400 text-sm font-medium">Starting Camera...</p>
                   </>
                 )}
               </div>
             )}
          </div>
          
          <div className="mt-6 flex flex-col items-center justify-center text-center space-y-4">
             <div className="text-gray-800 text-lg font-medium">
               AI predicts: <span className="font-bold text-gray-900">{predictedSign}</span>
               <span className="mx-4 text-gray-300">|</span>
               Confidence: <span className="font-bold text-gray-900">{confidence}%</span>
             </div>

             {isEvaluating ? (
               <div className="text-xl font-bold text-emerald-600 flex items-center gap-2 animate-pulse">
                 <BrainCircuit className="h-6 w-6" /> Processing Submission...
               </div>
             ) : isSignCorrect !== null && (
               <div className={`text-2xl font-bold flex items-center gap-2 ${isSignCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                 {isSignCorrect ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                 {isSignCorrect ? 'Correct' : 'Incorrect'}
               </div>
             )}

             <div className="text-sm font-bold text-gray-500 mt-4">
               Question {currentQuestion + 1} of {selectedLevel.required_signs.length}
             </div>

             <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating}
                  className="px-12 py-3.5 bg-emerald-600 border border-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-emerald-500 disabled:opacity-60 transition tracking-wide"
                >
                  {hasSubmittedCurrent ? "Resubmit Answer" : "Submit"}
                </button>
                
                {currentQuestion === selectedLevel.required_signs.length - 1 && (
                  <button 
                    onClick={handleFinishExam}
                    disabled={isEvaluating}
                    className="px-8 py-3.5 bg-emerald-700 border border-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-emerald-600 disabled:opacity-50 transition ml-2"
                  >
                    Finish Exam
                  </button>
                )}
             </div>
          </div>
        </motion.div>
      )}

      {examState === 'completed' && selectedLevel && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 bg-white border border-gray-100 shadow-premium rounded-[2.5rem] p-10 max-w-2xl mx-auto text-center">
          <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 shadow-lg ${passed ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20' : 'bg-red-100 text-red-600 shadow-red-500/20'}`}>
            {passed ? <CheckCircle className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CERTIFICATION EXAM RESULT
          </h2>
          {(finalScore !== 0 || passed === false) && (
            <div className="mb-4 space-y-2 mt-4">
               <p className="text-xl font-bold text-gray-800">Overall Score: {finalScore}%</p>
               <p className="text-sm font-semibold text-gray-600">Correct Answers: {examAnswers.filter(a => a.predicted_label === a.expected_label).length} / {examAnswers.length}</p>
               <p className="text-sm font-semibold text-gray-600">Incorrect Answers: {examAnswers.length - examAnswers.filter(a => a.predicted_label === a.expected_label).length} / {examAnswers.length}</p>
               <p className={`text-xl font-bold mt-2 ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                 Result: {passed ? '✓ PASSED' : '✗ FAILED'}
               </p>
               <p className="text-md font-semibold text-gray-700 mt-2">
                 Certificate Status: <span className={passed ? "text-emerald-600" : "text-gray-500"}>{passed ? 'ELIGIBLE' : 'Not Eligible'}</span>
               </p>
               {!passed && <p className="text-sm italic text-red-500 mt-1">Improve your score and try again.</p>}
            </div>
          )}
          {examResultInfo && <p className="text-red-500 font-bold mb-8">{examResultInfo}</p>}
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button 
              onClick={() => {
                setExamState('idle');
                stopCamera();
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
            >
              Return to Menu
            </button>
            {passed && (
              <button 
                onClick={async () => {
                  try {
                    const dlToken = localStorage.getItem('asl_access_token');
                    const res = await fetch(`${apiBaseUrl}/business/reports/me?report_type=certification&format=pdf`, {
                      headers: { Authorization: `Bearer ${dlToken}` }
                    });
                    if (!res.ok) throw new Error('Failed to generate PDF');
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'certificate.pdf';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(url);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition flex justify-center items-center gap-2"
              >
                <Award className="h-4 w-4" /> Generate Certificate
              </button>
            )}
          </div>
        </motion.div>
      )}
    </CinematicSection>
  );
}
