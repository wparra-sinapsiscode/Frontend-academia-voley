export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'parent';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  studentId?: string; // ID de la estudiante asociada (solo para padres)
}

export interface Student {
  id: string;
  name: string;
  age: number;
  category: Category;
  categoryId: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalInfo: string;
  address: string;
  birthDate: Date;
  enrollmentDate: Date;
  avatar?: string;
  coachId?: string;
  achievements: Achievement[];
  stats: StudentStats;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  certifications: string[];
  hireDate: Date;
  avatar?: string;
  assignedCategories: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  ageRange: {
    min: number;
    max: number;
  };
  maxStudents: number;
  currentStudents: number;
  price: number;
  monthlyFee: number;
  schedule: string[];
  coachId?: string;
}

export interface Schedule {
  id: string;
  categoryId: string;
  coachId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  location: string;
  recurring: boolean;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  method?: 'cash' | 'card' | 'transfer';
  description: string;
  period: string; // "Enero 2024", "Febrero 2024", etc.
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  type: 'tournament' | 'skill' | 'attendance' | 'leadership';
  icon: string;
}

export interface StudentStats {
  attendanceRate: number;
  skillLevel: number;
  improvement: number;
  totalSessions: number;
  averagePerformance: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  categories: string[];
  maxParticipants: number;
  currentParticipants: number;
  registrationDeadline: Date;
  entryFee: number;
  prizes: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  results?: TournamentResult[];
}

export interface TournamentResult {
  position: number;
  studentId: string;
  points: number;
  awards: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'students' | 'parents' | 'coaches';
  pinned: boolean;
}

export interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  coachId: string;
  createdAt: Date;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  exercises: Exercise[];
  sourceType?: 'manual' | 'class';
  classId?: string;
  warmUp?: Exercise[];
  coolDown?: Exercise[];
}

export interface ClassPlan {
  id: string;
  title: string;
  category: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  coachId: string;
  objectives: string[];
  materials: string[];
  warmUpPlan: {
    exercises: { name: string; duration: number; description: string; }[];
    totalDuration: number;
  };
  mainActivityPlan: {
    exercises: { name: string; duration: number; description: string; }[];
    totalDuration: number;
  };
  coolDownPlan: {
    exercises: { name: string; duration: number; description: string; }[];
    totalDuration: number;
  };
  createdAt: Date;
  trainingPlanId?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  equipment: string[];
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'warmup' | 'technique' | 'physical' | 'tactical' | 'cooldown';
}

export interface Attendance {
  id: string;
  studentId: string;
  scheduleId: string;
  date: Date;
  present: boolean;
  notes?: string;
  checkedBy: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  coachId: string;
  date: Date;
  technical: {
    serve: number;
    spike: number;
    block: number;
    dig: number;
    set: number;
  };
  physical: {
    endurance: number;
    strength: number;
    agility: number;
    jump: number;
  };
  mental: {
    focus: number;
    teamwork: number;
    leadership: number;
    attitude: number;
  };
  notes: string;
  overallScore: number;
}

export interface AppContextType {
  user: User | null;
  users: User[];
  students: Student[];
  coaches: Coach[];
  categories: Category[];
  schedules: Schedule[];
  payments: Payment[];
  tournaments: Tournament[];
  announcements: Announcement[];
  trainingPlans: TrainingPlan[];
  attendances: Attendance[];
  evaluations: Evaluation[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  addTournament: (tournament: Omit<Tournament, 'id'>) => void;
  markAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  addClassPlan: (classPlan: Omit<ClassPlan, 'id'>) => void;
  updateClassPlan: (id: string, classPlan: Partial<ClassPlan>) => void;
  deleteClassPlan: (id: string) => void;
  addTrainingPlan: (trainingPlan: Omit<TrainingPlan, 'id'>) => void;
  updateTrainingPlan: (id: string, trainingPlan: Partial<TrainingPlan>) => void;
  deleteTrainingPlan: (id: string) => void;
  addCoach: (coach: Omit<Coach, 'id'>) => void;
  updateCoach: (id: string, coach: Partial<Coach>) => void;
  deleteCoach: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
}