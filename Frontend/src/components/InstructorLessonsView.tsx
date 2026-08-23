import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, ChevronRight, ArrowLeft, Camera, Users, Target, Activity } from 'lucide-react';
import { Lesson, Difficulty } from '../types';
import { CinematicSection, StaggeredGrid, Premium3DCard } from './CinematicMotion';
import { apiBaseUrl } from '../utils/api';

interface InstructorLessonsViewProps {
  lessons: Lesson[];
}

interface LessonStats {
  learnersCount: number;
  averageAccuracy: number;
  completionRate: number;
}

export default function InstructorLessonsView({ lessons }: InstructorLessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [activeLessonModal, setActiveLessonModal] = useState<Lesson | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const [statsMap, setStatsMap] = useState<Record<string, LessonStats | null>>({});

  useEffect(() => {
    // Attempt to fetch real statistics for these lessons.
    // If the endpoint doesn't exist, we fallback to our graceful 'no data' empty state string.
    const token = localStorage.getItem('asl_access_token');
    
    // Creating a placeholder async fetcher here. Assuming a backend expansion might provide this, 
    // but enforcing empty states strictly since we do not want to hardcode or invent numbers.
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/instructors/lessons/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Assuming data is a map of lesson string IDs or names to stats
          setStatsMap(data);
        }
      } catch (e) {
        // Soft fallback to empty stat map
      }
    };
    fetchStats();
  }, []);

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || lesson.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadgeColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-50 text-green-700 border-green-100';
      case 'Intermediate': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Advanced': return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="instructor_lessons_container" className="space-y-6">
      
      {activeLessonModal ? (
        <div id="active_lesson_drawer" className="bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white/80 shadow-premium p-6 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <button
              onClick={() => setActiveLessonModal(null)}
              className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-blue-600 focus:outline-none rounded transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Catalogue</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border uppercase tracking-wider font-bold ${getDifficultyBadgeColor(activeLessonModal.difficulty)}`}>
                {activeLessonModal.difficulty}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-200 uppercase tracking-widest font-bold">
                {activeLessonModal.category}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="font-sans font-bold text-2xl text-gray-950">{activeLessonModal.name}</h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{activeLessonModal.description}</p>
                <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                  <h4 className="text-xs font-bold uppercase text-gray-900 tracking-wider mb-2 flex items-center gap-1.5"><Users className="h-4 w-4 text-blue-600"/> Learner Performance</h4>
                  {statsMap[activeLessonModal.id] ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Learners:</span><span className="font-semibold">{statsMap[activeLessonModal.id]?.learnersCount}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Avg Accuracy:</span><span className="font-semibold text-emerald-600">{statsMap[activeLessonModal.id]?.averageAccuracy}%</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Completion:</span><span className="font-semibold text-blue-600">{statsMap[activeLessonModal.id]?.completionRate}%</span></div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No learner data available yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Course Modules ({activeLessonModal.steps.length})</span>
                {activeLessonModal.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-sm flex items-center justify-between transition ${
                      currentStepIndex === idx
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-medium'
                        : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                        currentStepIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Module {currentStepIndex + 1} of {activeLessonModal.steps.length}
                </span>
                <span className="text-xs text-gray-400">Content Overview</span>
              </div>

              <div className="flex flex-col gap-6 items-center">
                <div className="space-y-3 w-full text-center">
                  <h3 className="font-sans font-bold text-2xl text-gray-900">
                    Sign: "{activeLessonModal.steps[currentStepIndex].signSymbol}"
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
                    {activeLessonModal.steps[currentStepIndex].description}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px] w-full max-w-md">
                  <img
                    src={`/signs/${activeLessonModal.steps[currentStepIndex].signSymbol.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`}
                    alt={`Reference for ${activeLessonModal.steps[currentStepIndex].signSymbol}`}
                    className="object-contain w-auto max-h-[250px] mix-blend-multiply"
                    onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                       const fallback = document.getElementById(`fallback-instr-${activeLessonModal.steps[currentStepIndex].signSymbol}`);
                       if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    id={`fallback-instr-${activeLessonModal.steps[currentStepIndex].signSymbol}`} 
                    className="hidden flex-col items-center justify-center text-gray-400 py-10 space-y-3"
                  >
                    <Camera className="h-12 w-12 text-gray-300 opacity-80" />
                    <span className="text-sm font-semibold tracking-wide">No reference image available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="font-sans font-bold text-2xl text-gray-950 tracking-tight">ASL Lesson Catalogue</h1>
              <p className="text-sm text-gray-500">View available sign language lessons, course content, and learner performance.</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white/60 shadow-glass flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search lessons by name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-gray-500 uppercase flex items-center space-x-1 shrink-0">
                <Filter className="h-3 w-3" />
                <span>Level:</span>
              </span>
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
                    difficultyFilter === level
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
            {filteredLessons.map((lesson) => {
              const stats = statsMap[lesson.id];
              return (
                <Premium3DCard
                  key={lesson.id}
                  className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-glass p-5 flex flex-col justify-between hover:bg-white/90 hover:shadow-premium transition duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lesson.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getDifficultyBadgeColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-sans font-bold text-base text-gray-950 line-clamp-1">{lesson.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{lesson.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-50 mt-6">
                    <div className="text-xs text-gray-500 font-semibold mb-2">{lesson.steps.length} learning modules</div>
                    
                    {stats ? (
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center justify-between text-xs">
                         <div className="flex flex-col"><span className="text-gray-400 font-medium">Learners</span><span className="font-bold text-gray-900">{stats.learnersCount}</span></div>
                         <div className="flex flex-col"><span className="text-gray-400 font-medium flex items-center gap-1"><Target className="h-3 w-3"/> Avg</span><span className="font-bold text-emerald-600">{stats.averageAccuracy}%</span></div>
                         <div className="flex flex-col"><span className="text-gray-400 font-medium flex items-center gap-1"><Activity className="h-3 w-3"/> Comp.</span><span className="font-bold text-blue-600">{stats.completionRate}%</span></div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-400 italic text-center">
                        No learner data available yet.
                      </div>
                    )}

                    <div className="pt-2">
                      <motion.button
                        onClick={() => {
                          setActiveLessonModal(lesson);
                          setCurrentStepIndex(0);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 bg-white border-2 border-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm text-sm"
                      >
                        View Lesson
                      </motion.button>
                    </div>
                  </div>
                </Premium3DCard>
              );
            })}
          </StaggeredGrid>

          {filteredLessons.length === 0 && (
            <div className="col-span-full bg-white/70 backdrop-blur-xl p-12 text-center rounded-[1.5rem] border border-white/60 shadow-glass space-y-2">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto" />
              <h4 className="font-sans font-bold text-gray-800">No lessons match your search</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">Try refining your filter queries or entering a different keyword above.</p>
            </div>
          )}
        </>
      )}
    </CinematicSection>
  );
}
