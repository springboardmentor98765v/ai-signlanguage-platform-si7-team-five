import { Lesson, PracticeSession, User } from './types';

export const mockUser: User = {
  id: 'usr_1',
  name: 'Jane Doe',
  email: 'learner@aslsignai.edu',
  role: 'Learner',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  streak: 5,
  lessonsCompleted: 12,
  practiceSessions: 42,
  avgAccuracy: 88,
};

export const mockLessons: Lesson[] = [
  {
    id: 'les_1',
    name: 'ASL Alphabet: Letters A-E',
    description: 'Learn the foundational handshapes for the first five letters of the American Sign Language alphabet.',
    difficulty: 'Beginner',
    category: 'Alphabet',
    progress: 100,
    duration: '10 mins',
    steps: [
      { id: 'les_1_s1', title: 'Letter A', description: 'Make a fist, with your thumb resting flat against the side of your index finger.', signSymbol: 'A' },
      { id: 'les_1_s2', title: 'Letter B', description: 'Extend your fingers straight up, touching each other, with your thumb folded across your palm.', signSymbol: 'B' },
      { id: 'les_1_s3', title: 'Letter C', description: 'Curve all fingers and your thumb to form a C shape with your hand.', signSymbol: 'C' },
      { id: 'les_1_s4', title: 'Letter D', description: 'Point your index finger straight up, while your thumb and remaining fingers touch to form a circle.', signSymbol: 'D' },
      { id: 'les_1_s5', title: 'Letter E', description: 'Curl all fingers down, resting their tips lightly on top of your thumb, which is folded across your palm.', signSymbol: 'E' },
    ]
  },
  {
    id: 'les_2',
    name: 'Essential Social Greetings',
    description: 'Master polite gestures to start and end conversations in the Deaf and Hard-of-Hearing community.',
    difficulty: 'Beginner',
    category: 'Phrases',
    progress: 60,
    duration: '15 mins',
    steps: [
      { id: 'les_2_s1', title: 'Hello', description: 'Bring your dominant hand to your forehead, slightly above your temple, and salute outwards with palm facing forward.', signSymbol: 'HELLO' },
      { id: 'les_2_s2', title: 'Thank You', description: 'Touch the fingertips of your flat dominant hand to your lips, then move your hand down and forward toward the person.', signSymbol: 'THANK YOU' },
      { id: 'les_2_s3', title: 'Please', description: 'Place your flat dominant hand on the center of your chest and rub it in a circular motion clockwise a couple of times.', signSymbol: 'PLEASE' },
      { id: 'les_2_s4', title: 'Goodbye', description: 'Raise your hand to about shoulder height, palm facing forward, and wave your fingers up and down together.', signSymbol: 'GOODBYE' },
    ]
  },
  {
    id: 'les_3',
    name: 'Numbers 1 to 10',
    description: 'Learn how to count from 1 to 10. Counting in ASL uses unique palm-orientation rules.',
    difficulty: 'Beginner',
    category: 'Numbers',
    progress: 80,
    duration: '12 mins',
    steps: [
      { id: 'les_3_s1', title: 'Number 1', description: 'Palm faces backward towards yourself. Raise your index finger straight up.', signSymbol: '1' },
      { id: 'les_3_s2', title: 'Number 2', description: 'Palm faces backward. Raise your index and middle fingers in a V-shape.', signSymbol: '2' },
      { id: 'les_3_s3', title: 'Number 3', description: 'Palm faces backward. Raise your thumb, index finger, and middle finger.', signSymbol: '3' },
      { id: 'les_3_s4', title: 'Number 4', description: 'Palm faces backward. Raise index, middle, ring, and pinky fingers, keeping thumb tucked.', signSymbol: '4' },
      { id: 'les_3_s5', title: 'Number 5', description: 'Palm faces backward. Open your entire hand with all fingers and thumb spread out.', signSymbol: '5' },
    ]
  },
  {
    id: 'les_4',
    name: 'Common Question Words',
    description: 'Learn how to sign Who, What, When, Where, and Why, and how to use non-manual markers (facial expressions).',
    difficulty: 'Intermediate',
    category: 'Phrases',
    progress: 25,
    duration: '18 mins',
    steps: [
      { id: 'les_4_s1', title: 'What', description: 'Hold both hands in front of you, palms up, fingers slightly spread, and shake your hands back and forth while furrowing your eyebrows.', signSymbol: 'WHAT' },
      { id: 'les_4_s2', title: 'Where', description: 'Hold up your dominant index finger, palm facing out, and shake it from side to side like a small pendulum. Furrow your brows.', signSymbol: 'WHERE' },
      { id: 'les_4_s3', title: 'Who', description: 'Place your thumb on your chin and wiggle your index finger down and up several times, keeping other fingers curled. Furrow brows.', signSymbol: 'WHO' },
      { id: 'les_4_s4', title: 'Why', description: 'Touch your forehead with your dominant fingers, then pull your hand away while changing it into the "Y" handshape (thumb and pinky extended).', signSymbol: 'WHY' },
    ]
  },
  {
    id: 'les_5',
    name: 'Family and Relationships',
    description: 'Learn key signs for describing your family, including gendered position rules around the forehead and chin.',
    difficulty: 'Intermediate',
    category: 'Vocabulary',
    progress: 0,
    duration: '20 mins',
    steps: [
      { id: 'les_5_s1', title: 'Mother', description: 'Spread fingers of dominant hand, touch your thumb tip to your chin twice.', signSymbol: 'MOTHER' },
      { id: 'les_5_s2', title: 'Father', description: 'Spread fingers of dominant hand, touch your thumb tip to your forehead twice.', signSymbol: 'FATHER' },
      { id: 'les_5_s3', title: 'Brother', description: 'Make "L" shape with both hands. Touch dominant thumb to forehead, then bring it down to rest on top of non-dominant hand.', signSymbol: 'BROTHER' },
      { id: 'les_5_s4', title: 'Sister', description: 'Make "L" shape with both hands. Touch dominant thumb to chin, then bring it down to rest on top of non-dominant hand.', signSymbol: 'SISTER' },
    ]
  },
  {
    id: 'les_6',
    name: 'Emergency Phrase Signing',
    description: 'Crucial phrases for first responders, healthcare, and public situations. High accuracy is essential.',
    difficulty: 'Advanced',
    category: 'Emergency',
    progress: 0,
    duration: '25 mins',
    steps: [
      { id: 'les_6_s1', title: 'Need Help', description: 'Place closed dominant hand (thumb pointing up) onto flat non-dominant hand, and lift both together upwards.', signSymbol: 'NEED HELP' },
      { id: 'les_6_s2', title: 'Call Doctor', description: 'Tap your dominant index and middle fingers against your non-dominant wrist twice (simulating pulse), then tap towards the chin.', signSymbol: 'CALL DOCTOR' },
      { id: 'les_6_s3', title: 'Emergency', description: 'Form an "E" shape with your dominant hand and shake it back and forth rapidly from side to side in front of your shoulder.', signSymbol: 'EMERGENCY' },
      { id: 'les_6_s4', title: 'Are you OK?', description: 'Point index finger at the person, tap chest with flat hand twice, then give a questioning facial expression.', signSymbol: 'ARE YOU OK' },
    ]
  }
];

export const mockPracticeHistory: PracticeSession[] = [
  {
    id: 'prac_1',
    date: '2026-07-06 14:32',
    lessonName: 'ASL Alphabet: Letters A-E',
    signSymbol: 'A',
    score: 94,
    accuracy: 94,
    durationSeconds: 45,
    feedback: 'Excellent thumb placement. Your hand is fully stable.'
  },
  {
    id: 'prac_2',
    date: '2026-07-06 14:34',
    lessonName: 'ASL Alphabet: Letters A-E',
    signSymbol: 'B',
    score: 88,
    accuracy: 88,
    durationSeconds: 50,
    feedback: 'Great form. Make sure your fingers are fully vertical and tightly held together.'
  },
  {
    id: 'prac_3',
    date: '2026-07-05 10:15',
    lessonName: 'Essential Social Greetings',
    signSymbol: 'HELLO',
    score: 91,
    accuracy: 91,
    durationSeconds: 30,
    feedback: 'Wonderful fluid motion! Hand gesture speed matches professional sign language standards.'
  },
  {
    id: 'prac_4',
    date: '2026-07-04 16:05',
    lessonName: 'Essential Social Greetings',
    signSymbol: 'THANK YOU',
    score: 75,
    accuracy: 75,
    durationSeconds: 65,
    feedback: 'Avoid starting too low. Begin directly at your lips before moving your hand outwards.'
  },
  {
    id: 'prac_5',
    date: '2026-07-03 11:20',
    lessonName: 'Numbers 1 to 10',
    signSymbol: '3',
    score: 92,
    accuracy: 92,
    durationSeconds: 40,
    feedback: 'Perfect thumb extension! Make sure your palm orientation stays backwards.'
  },
  {
    id: 'prac_6',
    date: '2026-07-02 09:40',
    lessonName: 'Numbers 1 to 10',
    signSymbol: '1',
    score: 85,
    accuracy: 85,
    durationSeconds: 25,
    feedback: 'Index finger is clearly upright. Good palm-backwards orientation.'
  }
];

export const accuracyProgressData = [
  { date: 'Mon', accuracy: 82, target: 85, time: 10 },
  { date: 'Tue', accuracy: 84, target: 85, time: 15 },
  { date: 'Wed', accuracy: 88, target: 85, time: 22 },
  { date: 'Thu', accuracy: 86, target: 85, time: 12 },
  { date: 'Fri', accuracy: 89, target: 85, time: 25 },
  { date: 'Sat', accuracy: 92, target: 85, time: 35 },
  { date: 'Sun', accuracy: 94, target: 85, time: 40 },
];

export const categoryBreakdownData = [
  { name: 'Alphabet', accuracy: 92, sessions: 18 },
  { name: 'Greetings', accuracy: 86, sessions: 12 },
  { name: 'Numbers', accuracy: 88, sessions: 8 },
  { name: 'Phrases', accuracy: 78, sessions: 4 },
];

// =============================================
// MILESTONE 2 – INSTRUCTOR DASHBOARD MOCK DATA
// =============================================

export interface InstructorStudent {
  id: string;
  name: string;
  email: string;
  lessonsCompleted: number;
  accuracy: number;
  streak: number;
  lastActive: string;
}

export const mockInstructorStudents: InstructorStudent[] = [
  { id: 'stu_1', name: 'Alice Johnson',  email: 'alice@school.edu',   lessonsCompleted: 14, accuracy: 94, streak: 8,  lastActive: '2 hrs ago' },
  { id: 'stu_2', name: 'Bob Martinez',   email: 'bob@school.edu',     lessonsCompleted: 10, accuracy: 82, streak: 5,  lastActive: '1 day ago' },
  { id: 'stu_3', name: 'Carol White',    email: 'carol@school.edu',   lessonsCompleted: 7,  accuracy: 67, streak: 2,  lastActive: '3 days ago' },
  { id: 'stu_4', name: 'David Kim',      email: 'david@school.edu',   lessonsCompleted: 18, accuracy: 91, streak: 12, lastActive: '30 mins ago' },
  { id: 'stu_5', name: 'Eva Nguyen',     email: 'eva@school.edu',     lessonsCompleted: 5,  accuracy: 58, streak: 1,  lastActive: '5 days ago' },
  { id: 'stu_6', name: 'Frank Brown',    email: 'frank@school.edu',   lessonsCompleted: 11, accuracy: 79, streak: 4,  lastActive: '6 hrs ago' },
  { id: 'stu_7', name: 'Grace Lee',      email: 'grace@school.edu',   lessonsCompleted: 16, accuracy: 96, streak: 15, lastActive: '1 hr ago' },
  { id: 'stu_8', name: 'Henry Clark',    email: 'henry@school.edu',   lessonsCompleted: 3,  accuracy: 62, streak: 0,  lastActive: '1 week ago' },
];

export const mockInstructorClassPerformance = [
  { lesson: 'Alphabet',   avgAccuracy: 88 },
  { lesson: 'Greetings',  avgAccuracy: 82 },
  { lesson: 'Numbers',    avgAccuracy: 76 },
  { lesson: 'Questions',  avgAccuracy: 69 },
  { lesson: 'Family',     avgAccuracy: 73 },
  { lesson: 'Emergency',  avgAccuracy: 65 },
];

export const mockInstructorWeeklyActivity = [
  { day: 'Mon', sessions: 42, completions: 18 },
  { day: 'Tue', sessions: 55, completions: 24 },
  { day: 'Wed', sessions: 38, completions: 15 },
  { day: 'Thu', sessions: 61, completions: 28 },
  { day: 'Fri', sessions: 49, completions: 21 },
  { day: 'Sat', sessions: 30, completions: 12 },
  { day: 'Sun', sessions: 22, completions: 9  },
];

// =============================================
// MILESTONE 2 – ADMIN DASHBOARD MOCK DATA
// =============================================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Instructor' | 'Learner';
  active: boolean;
  joined: string;
}

export const mockAdminUsers: AdminUser[] = [
  { id: 'adm_1', name: 'Sarah Connor',    email: 'sarah@signai.edu',    role: 'Admin',      active: true,  joined: 'Jan 2026' },
  { id: 'adm_2', name: 'James Wilson',    email: 'james@signai.edu',    role: 'Instructor', active: true,  joined: 'Feb 2026' },
  { id: 'adm_3', name: 'Maria Garcia',    email: 'maria@signai.edu',    role: 'Learner',    active: true,  joined: 'Mar 2026' },
  { id: 'adm_4', name: 'Tom Harris',      email: 'tom@signai.edu',      role: 'Instructor', active: false, joined: 'Mar 2026' },
  { id: 'adm_5', name: 'Lisa Thompson',   email: 'lisa@signai.edu',     role: 'Learner',    active: true,  joined: 'Apr 2026' },
  { id: 'adm_6', name: 'Kevin Anderson',  email: 'kevin@signai.edu',    role: 'Learner',    active: true,  joined: 'May 2026' },
];

export const mockAdminPlatformActivity = [
  { day: 'Mon', activeUsers: 186, sessions: 342 },
  { day: 'Tue', activeUsers: 212, sessions: 401 },
  { day: 'Wed', activeUsers: 175, sessions: 298 },
  { day: 'Thu', activeUsers: 234, sessions: 460 },
  { day: 'Fri', activeUsers: 198, sessions: 387 },
  { day: 'Sat', activeUsers: 142, sessions: 230 },
  { day: 'Sun', activeUsers: 101, sessions: 178 },
];

export const mockAdminRoleDistribution = [
  { name: 'Learners',    value: 982 },
  { name: 'Instructors', value: 218 },
  { name: 'Trainers',    value: 38  },
  { name: 'Admins',      value: 10  },
];

export const mockAdminSystemAlerts = [
  {
    id: 'alert_1',
    title: 'AI Model Response Latency Spike',
    description: 'Average sign detection response time increased to 850ms (baseline: 200ms).',
    severity: 'warning' as const,
    time: 'Today, 3:14 PM',
  },
  {
    id: 'alert_2',
    title: 'Video Streaming Degraded',
    description: 'CDN node in ap-southeast-1 experiencing packet loss. Rerouting in progress.',
    severity: 'error' as const,
    time: 'Today, 1:42 PM',
  },
  {
    id: 'alert_3',
    title: 'Scheduled Maintenance Reminder',
    description: 'Sunday 2:00 AM UTC – estimated 30m downtime for database cluster upgrade.',
    severity: 'info' as const,
    time: 'Yesterday, 10:00 AM',
  },
];

// =============================================
// MILESTONE 2 – ENHANCED LEARNER DASHBOARD DATA
// =============================================

export const lessonsCompletedBarData = [
  { week: 'Week 1', completed: 2 },
  { week: 'Week 2', completed: 3 },
  { week: 'Week 3', completed: 1 },
  { week: 'Week 4', completed: 4 },
  { week: 'Week 5', completed: 2 },
  { week: 'Week 6', completed: 5 },
  { week: 'Week 7', completed: 3 },
];

export const mockWeakLetters = [
  { letter: 'G', accuracy: 58, attempts: 12 },
  { letter: 'J', accuracy: 62, attempts: 9  },
  { letter: 'P', accuracy: 65, attempts: 15 },
  { letter: 'Q', accuracy: 68, attempts: 7  },
  { letter: 'Z', accuracy: 70, attempts: 11 },
];

export const mockRecentActivity = [
  { id: 'act_1', type: 'practice', label: 'Practiced Letter A', time: '2 hrs ago',  score: 94 },
  { id: 'act_2', type: 'lesson',   label: 'Completed Greetings Lesson', time: '5 hrs ago',  score: null },
  { id: 'act_3', type: 'practice', label: 'Practiced HELLO sign', time: '1 day ago', score: 88 },
  { id: 'act_4', type: 'practice', label: 'Practiced Number 3',   time: '2 days ago', score: 92 },
  { id: 'act_5', type: 'lesson',   label: 'Started Question Words', time: '3 days ago', score: null },
];

export const mockAchievements = [
  { id: 'ach_1', emoji: '🔥', title: '5-Day Streak',       desc: 'Practiced 5 days in a row',     unlocked: true  },
  { id: 'ach_2', emoji: '🎓', title: 'Alphabet Master',    desc: 'Completed A-E with 90%+ accuracy', unlocked: true  },
  { id: 'ach_3', emoji: '🤖', title: 'Vision Hero',        desc: 'Completed 25 live AI sessions', unlocked: true  },
  { id: 'ach_4', emoji: '💬', title: 'Social Signer',      desc: 'Perfect score on Greetings',    unlocked: false },
  { id: 'ach_5', emoji: '⚡', title: 'Speed Learner',      desc: 'Finish 3 lessons in one day',   unlocked: false },
];
