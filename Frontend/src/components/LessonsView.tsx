import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, Star, Play, CheckCircle, ChevronRight, X, ArrowLeft, Camera } from 'lucide-react';
import { Lesson, Difficulty, LessonStep } from '../types';
import { CinematicSection, StaggeredGrid, Premium3DCard } from './CinematicMotion';

interface LessonsViewProps {
  lessons: Lesson[];
  onNavigate: (tab: string, param?: any) => void;
  selectedLessonFromNav?: Lesson | null;
}

export default function LessonsView({ lessons, onNavigate, selectedLessonFromNav }: LessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'All'>('All');
  const [activeLessonModal, setActiveLessonModal] = useState<Lesson | null>(selectedLessonFromNav || null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || lesson.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyBadgeColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-100';
    }
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setActiveLessonModal(lesson);
    setCurrentStepIndex(0);
  };

  const handleCloseLesson = () => {
    setActiveLessonModal(null);
  };

  const handleLaunchPractice = (step: LessonStep, lessonName: string) => {
    onNavigate('Practice', { step, lessonName });
  };

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="lessons_view_container" className="space-y-6">
      
      {/* If a lesson details modal/drawer is active, render the step details */}
      {activeLessonModal ? (
        <div id="active_lesson_drawer" className="bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white/80 shadow-premium p-6 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <button
              id="back_to_lessons"
              onClick={handleCloseLesson}
              aria-label="Back to Lessons"
              className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Lessons</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border ${getDifficultyBadgeColor(activeLessonModal.difficulty)}`}>
                {activeLessonModal.difficulty}
              </span>
              <span className="text-xs text-gray-500">{activeLessonModal.duration}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: Steps navigation */}
            <div className="lg:col-span-4 space-y-3">
              <div>
                <h2 id="lesson_detail_title" className="font-sans font-bold text-xl text-gray-950">{activeLessonModal.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{activeLessonModal.description}</p>
              </div>

              <div id="lesson_steps_list" className="space-y-2 pt-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Lesson Outline</span>
                {activeLessonModal.steps.map((step, idx) => (
                  <button
                    key={step.id}
                    id={`step_tab_${step.id}`}
                    onClick={() => setCurrentStepIndex(idx)}
                    aria-pressed={currentStepIndex === idx}
                    aria-label={`Step ${idx + 1}: ${step.title}`}
                    className={`w-full text-left p-3 rounded-lg border text-sm flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                      currentStepIndex === idx
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                        : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                        currentStepIndex === idx ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
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

            {/* Right side: Step active instructions */}
            <div className="lg:col-span-8 bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Step {currentStepIndex + 1} of {activeLessonModal.steps.length}
                  </span>
                  <span className="text-xs text-gray-400">Gesture Demonstration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <h3 id="step_title" className="font-sans font-bold text-2xl text-gray-900">
                      Sign: "{activeLessonModal.steps[currentStepIndex].signSymbol}"
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {activeLessonModal.steps[currentStepIndex].description}
                    </p>
                  </div>

                  {/* Demonstration Placeholder Graphic */}
                  <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center space-y-4 min-h-64 shadow-sm">
                    <motion.div
                      key={activeLessonModal.steps[currentStepIndex].signSymbol}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="flex items-center justify-center w-full"
                    >
                      <motion.img
                        id={`ref-image-${activeLessonModal.steps[currentStepIndex].signSymbol}`}
                        src={`/signs/${activeLessonModal.steps[currentStepIndex].signSymbol.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`}
                        alt={`Reference for ${activeLessonModal.steps[currentStepIndex].signSymbol}`}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="object-contain w-auto mx-auto max-h-[220px] md:max-h-[260px] bg-transparent"
                        onError={(e) => {
                           (e.target as HTMLImageElement).style.display = 'none';
                           const fallback = document.getElementById(`fallback-${activeLessonModal.steps[currentStepIndex].signSymbol}`);
                           if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div 
                        id={`fallback-${activeLessonModal.steps[currentStepIndex].signSymbol}`} 
                        className="hidden flex-col items-center justify-center text-gray-400 py-10 space-y-3"
                      >
                        <Camera className="h-12 w-12 text-gray-300 opacity-80" />
                        <span className="text-sm font-semibold tracking-wide">No reference image available</span>
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500">Visual Model Ref</p>
                      <p className="text-[10px] text-gray-400">American Sign Language Standard</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200/60 gap-4">
                <div className="flex space-x-2 w-full sm:w-auto">
                  <button
                    id="prev_step"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                    aria-label="Previous Step"
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    id="next_step"
                    disabled={currentStepIndex === activeLessonModal.steps.length - 1}
                    onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                    aria-label="Next Step"
                    className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>

                <button
                  id="start_practice_for_step"
                  onClick={() => handleLaunchPractice(activeLessonModal.steps[currentStepIndex], activeLessonModal.name)}
                  aria-label="Start Live Webcam Assessment"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-50/70 backdrop-blur-md border border-emerald-200/50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition flex items-center justify-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Start Live Webcam Assessment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Lesson Grid Listing */
        <>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 id="lessons_header_title" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">ASL Syllabus</h1>
              <p className="text-sm text-gray-500">Comprehensive educational syllabus covering structural alphabets and complex phrases.</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white/60 shadow-glass flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="lessons_search_input"
                type="text"
                placeholder="Search lessons by name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
                  id={`filter_level_${level}`}
                  onClick={() => setDifficultyFilter(level)}
                  aria-pressed={difficultyFilter === level}
                  aria-label={`Filter by ${level} difficulty`}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition whitespace-nowrap ${
                    difficultyFilter === level
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons Cards List */}
          <StaggeredGrid id="lessons_cards_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
            {filteredLessons.map((lesson) => (
              <Premium3DCard
                key={lesson.id}
                id={`lesson_card_${lesson.id}`}
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

                <div className="space-y-4 pt-6 border-t border-gray-50 mt-6">
                  {/* Progress info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-emerald-600">{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${lesson.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{lesson.steps.length} learning modules</span>
                    <motion.button
                      id={`continue_btn_${lesson.id}`}
                      onClick={() => handleOpenLesson(lesson)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      aria-label={lesson.progress === 100 ? 'Review Lesson' : 'Continue Lesson'}
                      className="px-4 py-2 bg-emerald-50/80 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
                    >
                      {lesson.progress === 100 ? 'Review Lesson' : 'Continue'}
                    </motion.button>
                  </div>
                </div>
              </Premium3DCard>
            ))}
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
