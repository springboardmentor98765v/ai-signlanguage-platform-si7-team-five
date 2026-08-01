import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Play, Square, RefreshCw, AlertCircle, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { LessonStep } from '../types';
import { aiApiBaseUrl } from '../utils/api';
import { CinematicSection } from './CinematicMotion';

interface PracticeViewProps {
  initialTargetStep?: { step: LessonStep; lessonName: string } | null;
  onNavigate: (tab: string, param?: any) => void;
}

export default function PracticeView({ initialTargetStep, onNavigate }: PracticeViewProps) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState(false);
  
  // Loaded sign to practice
  const [targetSign, setTargetSign] = useState<string>(
    initialTargetStep?.step.signSymbol || 'A'
  );
  const [targetDescription, setTargetDescription] = useState<string>(
    initialTargetStep?.step.description || 'Make a fist, with your thumb resting flat against the side of your index finger.'
  );

  // Simulated AI results
  const [predictedSign, setPredictedSign] = useState<string>('—');
  const [confidence, setConfidence] = useState<number>(0);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('Click "Start Practice" to begin real-time gesture feedback.');
  const [feedbackHistory, setFeedbackHistory] = useState<string[]>([]);
  const [isSignCorrect, setIsSignCorrect] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const captureAndPredict = async () => {
    if (!videoRef.current || !isPracticing) return;

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

    try {
      const response = await fetch(`${aiApiBaseUrl}/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Prediction failed');

      const predicted = data.predicted_sign || 'unknown';
      const confidenceValue = Number(data.confidence || 0) * 100;
      setPredictedSign(predicted);
      setConfidence(confidenceValue);
      setAccuracyScore(Math.min(100, Math.round(confidenceValue)));
      setFeedback(predicted === targetSign || predicted === targetSign.toUpperCase()
        ? 'Excellent alignment! Form matches the reference standards perfectly.'
        : 'Keep adjusting your hand shape and position to match the target sign.');
      setIsSignCorrect(predicted === targetSign || predicted === targetSign.toUpperCase());
      setFeedbackHistory(prev => [`[AI] ${predicted} (${Math.round(confidenceValue)}%)`, ...prev.slice(0, 4)]);
    } catch (err) {
      console.warn('AI prediction failed; using fallback feedback.', err);
      setFeedback('AI model unavailable. Continue practicing while the classifier reconnects.');
    }
  };

  // Available signs to choose from
  const availablePracticeSigns = [
    { symbol: 'A', desc: 'Fist with thumb flat against the side of the index finger.' },
    { symbol: 'B', desc: 'Flat hand, fingers together, thumb folded across palm.' },
    { symbol: 'C', desc: 'Curve fingers and thumb into a clear C shape.' },
    { symbol: 'D', desc: 'Index pointing straight up; thumb and other fingers forming a circle.' },
    { symbol: 'E', desc: 'Fingers curled tightly, resting on thumb folded across palm.' },
    { symbol: 'HELLO', desc: 'Bring flat hand to forehead, salute outward slightly.' },
    { symbol: 'THANK YOU', desc: 'Touch lips with fingers, move flat hand forward/down.' },
    { symbol: 'PLEASE', desc: 'Rub flat dominant hand in a circular motion on chest.' },
    { symbol: '1', desc: 'Palm facing you. Raise only index finger.' },
    { symbol: '2', desc: 'Palm facing you. Raise index and middle fingers (V shape).' },
    { symbol: '3', desc: 'Palm facing you. Raise thumb, index, and middle fingers.' },
  ];

  // Handle stream creation/cleanup
  const startCamera = async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable. Loading interactive skeleton tracker simulation.', err);
      setCameraError(true);
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
    if (isPracticing && stream && videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(e => console.warn('Could not auto-play video:', e));
    }
  }, [isPracticing, stream]);

  const handleStartPractice = () => {
    setIsPracticing(true);
    startCamera();
    
    // Set initial waiting states
    setPredictedSign('Analyzing...');
    setConfidence(0);
    setAccuracyScore(0);
    setFeedback('Position your hand within the center framework and hold still...');
    setIsSignCorrect(null);
  };

  const handleStopPractice = () => {
    setIsPracticing(false);
    stopCamera();
    setPredictedSign('—');
    setConfidence(0);
    setAccuracyScore(0);
    setFeedback('Assessment stopped. Ready for your next session.');
    setIsSignCorrect(null);
  };

  useEffect(() => {
    let intervalId: number | undefined;
    if (isPracticing) {
      intervalId = window.setInterval(() => {
        void captureAndPredict();
      }, 3000);
    } else {
      setFeedbackHistory([]);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPracticing, targetSign]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const handleSelectSign = (symbol: string, desc: string) => {
    setTargetSign(symbol);
    setTargetDescription(desc);
    if (isPracticing) {
      // restart assessment loop
      setPredictedSign('Analyzing...');
      setConfidence(0);
      setAccuracyScore(0);
      setFeedback(`Scanning for hand gestures matching "${symbol}"...`);
      setIsSignCorrect(null);
    }
  };

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="practice_view" className="space-y-6">
      
      {/* Header banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 id="practice_main_header" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Interactive Assessment Lab</h1>
          <p className="text-sm text-gray-500">Practice your sign handshapes with computer vision and real-time neural evaluation.</p>
        </div>
        {initialTargetStep && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1 shrink-0">
            <span>Linked to: </span>
            <span className="font-bold">{initialTargetStep.lessonName}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (Webcam & reference) - Colspan 8 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visual Arena */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden relative transition-all duration-300 hover:shadow-premium">
            
            {/* Aspect Ratio Screen */}
            <div className="aspect-video bg-gray-950 flex items-center justify-center relative shadow-inner">
              
              {/* If camera stream is running, render video element */}
              {isPracticing && !cameraError ? (
                <video
                  id="webcam_stream_video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // mirrors webcam for natural practice
                />
              ) : (
                /* Fallback Graphic (either simulated skeletal layout or offline banner) */
                <div className="text-center p-8 space-y-4">
                  {isPracticing && cameraError ? (
                    <div className="space-y-4 animate-pulse">
                      {/* Skeletal hand tracker representation */}
                      <div className="relative h-44 w-44 mx-auto border-2 border-dashed border-emerald-500/60 rounded-full flex items-center justify-center">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-4 bg-emerald-500 rounded-full"></div>
                        <div className="absolute top-12 left-1/3 h-3 w-3 bg-emerald-500 rounded-full"></div>
                        <div className="absolute top-10 left-2/3 h-3 w-3 bg-emerald-500 rounded-full"></div>
                        <div className="absolute top-20 left-1/4 h-3.5 w-3.5 bg-emerald-500 rounded-full"></div>
                        <div className="absolute top-22 left-3/4 h-3.5 w-3.5 bg-emerald-500 rounded-full"></div>
                        <div className="h-6 w-16 bg-emerald-600/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-[10px] text-emerald-400 font-mono font-bold uppercase">
                          Skeletal Tracking
                        </div>
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-gray-200">Skeletal Simulator Active</h4>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">Webcam blocked or unavailable. Emulating sign coordinates synthetically.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <div className="h-16 w-16 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center mx-auto text-gray-500 shadow-inner">
                        <CameraOff className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-sans font-semibold text-gray-300">Camera Feed Offline</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto">Click "Start Practice" to engage webcam stream and initialize sign classification.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Target Outline Overlay overlay (helps user align hand) */}
              {isPracticing && (
                <div className="absolute inset-4 border-2 border-dashed border-white/20 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="h-56 w-56 border-2 border-dashed border-emerald-500/60 rounded-xl flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-gray-950/80 px-2.5 py-1 rounded-full">
                      Align Hand Shape
                    </span>
                  </div>
                </div>
              )}

              {/* Top indicators */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isPracticing ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`}></span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-gray-950/60 px-2 py-0.5 rounded">
                  {isPracticing ? 'Live Assess Active' : 'Idle'}
                </span>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!isPracticing ? (
                  <button
                    id="start_practice_btn"
                    onClick={handleStartPractice}
                    aria-label="Start Practice"
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition flex items-center space-x-2 shadow-sm"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Start Practice</span>
                  </button>
                ) : (
                  <button
                    id="stop_practice_btn"
                    onClick={handleStopPractice}
                    aria-label="Stop Practice"
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition flex items-center space-x-2 shadow-sm"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop Practice</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Current Target:</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                  Sign "{targetSign}"
                </span>
              </div>
            </div>
          </div>

          {/* Practice Selectors List */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 space-y-4 hover:shadow-premium transition-all duration-300">
            <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider">Select a Sign to Practice</h3>
            <div className="flex flex-wrap gap-2">
              {availablePracticeSigns.map((s) => (
                <button
                  key={s.symbol}
                  id={`practice_selector_${s.symbol}`}
                  onClick={() => handleSelectSign(s.symbol, s.desc)}
                  aria-label={`Select sign ${s.symbol}`}
                  aria-pressed={targetSign === s.symbol}
                  className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ${
                    targetSign === s.symbol
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Sign {s.symbol}
                </button>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sign Instructions</span>
              <p className="text-xs text-gray-600 leading-relaxed">{targetDescription}</p>
            </div>
          </div>

        </div>

        {/* Right column (AI feedback diagnostics) - Colspan 4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Diagnostic Metrics Sidebar */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 space-y-5 hover:shadow-premium transition-all duration-300">
            <h3 className="font-sans font-bold text-sm text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-3">
              Diagnostic Feed
            </h3>

            {/* Predicted Sign Block */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Predicted Sign</span>
              <div className="flex items-baseline space-x-2">
                <span id="predicted_sign_value" className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">
                  {predictedSign}
                </span>
                {isSignCorrect !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    isSignCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isSignCorrect ? 'Matches Target' : 'Inaccurate Shape'}
                  </span>
                )}
              </div>
            </div>

            {/* Confidence Gauge */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">Confidence Score</span>
                <span id="confidence_score_value" className="text-gray-900 font-bold">{confidence}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    confidence > 85 ? 'bg-emerald-500' : confidence > 50 ? 'bg-amber-500' : 'bg-gray-300'
                  }`} 
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
            </div>

            {/* Accuracy Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-500">Accuracy Rating</span>
                <span id="accuracy_score_value" className="text-gray-900 font-bold">{accuracyScore}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    accuracyScore > 85 ? 'bg-emerald-500' : accuracyScore > 50 ? 'bg-amber-500' : 'bg-gray-300'
                  }`} 
                  style={{ width: `${accuracyScore}%` }}
                ></div>
              </div>
            </div>

            {/* Feedback Messages */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">AI Evaluation Note</span>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span id="diagnostic_feedback_text">{feedback}</span>
              </div>
            </div>

            {/* Action history log */}
            {feedbackHistory.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Diagnostic Logs</span>
                <div className="bg-gray-950 p-3 rounded-lg font-mono text-[10px] text-emerald-400 space-y-1 max-h-32 overflow-y-auto">
                  {feedbackHistory.map((log, i) => (
                    <div key={i} className="line-clamp-1 border-b border-gray-900 pb-1 last:border-0">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next recommendation card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 space-y-4 hover:shadow-premium transition-all duration-300">
            <h3 className="font-sans font-bold text-sm text-gray-950 uppercase tracking-wider">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start space-x-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-gray-900">Recommended Pathway</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">Maintain 90%+ accuracy over three letters to unlock the ASL Level Assessment exam.</p>
                </div>
              </div>

              <button
                id="view_full_reports"
                onClick={() => onNavigate('Reports')}
                aria-label="View Full Performance Reports"
                className="w-full py-2 bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition flex items-center justify-center space-x-1"
              >
                <span>View Full Performance Reports</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </CinematicSection>
  );
}
