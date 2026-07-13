import React, { useState } from 'react';
import { Search, Filter, BookOpen, Star, Play, CheckCircle, ChevronRight, X, ArrowLeft, Camera } from 'lucide-react';
import { Lesson, Difficulty, LessonStep } from '../types';

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
    <div id="lessons_view_container" className="space-y-6">
      
      {/* If a lesson details modal/drawer is active, render the step details */}
      {activeLessonModal ? (
        <div id="active_lesson_drawer" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <button
              id="back_to_lessons"
              onClick={handleCloseLesson}
              className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-emerald-600 transition"
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
                    className={`w-full text-left p-3 rounded-lg border text-sm flex items-center justify-between transition ${
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
                    <div className="h-28 w-28 rounded-full bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-700 font-sans font-extrabold text-4xl">
                      {activeLessonModal.steps[currentStepIndex].signSymbol}
                    </div>
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
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    id="next_step"
                    disabled={currentStepIndex === activeLessonModal.steps.length - 1}
                    onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>

                <button
                  id="start_practice_for_step"
                  onClick={() => handleLaunchPractice(activeLessonModal.steps[currentStepIndex], activeLessonModal.name)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition flex items-center justify-center space-x-2"
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
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
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
          <div id="lessons_cards_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                id={`lesson_card_${lesson.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition duration-200"
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
                    <button
                      id={`continue_btn_${lesson.id}`}
                      onClick={() => handleOpenLesson(lesson)}
                      className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm"
                    >
                      {lesson.progress === 100 ? 'Review Lesson' : 'Continue'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredLessons.length === 0 && (
              <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-100 space-y-2">
                <BookOpen className="h-10 w-10 text-gray-300 mx-auto" />
                <h4 className="font-sans font-bold text-gray-800">No lessons match your search</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">Try refining your filter queries or entering a different keyword above.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
