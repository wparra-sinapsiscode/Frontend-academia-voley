import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { 
  mockUsers, 
  mockStudents, 
  mockCoaches, 
  mockCategories, 
  mockSchedules, 
  mockPayments,
  mockExpenses, 
  mockTournaments, 
  mockAnnouncements, 
  mockTrainingPlans,
  mockClassPlans, 
  mockAttendances, 
  mockEvaluations,
  mockChallengeParameters,
  mockStudentLogs,
  defaultCredentials 
} from '../data/mockData';

// Types defined locally to avoid import issues
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'coach' | 'parent' | 'student';
  avatar?: string;
  profileImage?: string;
  phone?: string;
  createdAt?: Date;
  lastLogin?: Date;
  studentId?: string;
  password?: string;
  active?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  ageRange: { min: number; max: number };
  maxStudents?: number;
  currentStudents?: number;
  price?: number;
  monthlyFee?: number;
  schedule: string | string[];
  coachId?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: Date;
  type: 'tournament' | 'skill' | 'attendance' | 'leadership';
  icon: string;
}

interface StudentStats {
  attendanceRate: number;
  skillLevel: number;
  improvement: number;
  totalSessions: number;
  averagePerformance: number;
}

interface Student {
  id: string;
  name: string;
  age: number;
  category: Category;
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

interface Coach {
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

interface Schedule {
  id: string;
  categoryId: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string;
  recurring: boolean;
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  dueDate?: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'completed';
  method?: 'cash' | 'card' | 'transfer';
  description?: string;
  period?: string;
  concept?: string;
  date?: Date;
  receiptNumber?: string;
  receiptUrl?: string;
  notes?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: Date;
  pendingApproval?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  voucherUrl?: string; // Mantener para compatibilidad
  voucherImage?: string; // NUEVO: imagen en base64
  voucherFileName?: string; // NUEVO: nombre original del archivo
  voucherFileSize?: number; // NUEVO: tamaño del archivo
  voucherUploadDate?: Date; // NUEVO: fecha de subida
  voucherThumbnail?: string; // NUEVO: thumbnail para vista previa
}

interface TournamentResult {
  position: number;
  studentId: string;
  points: number;
  awards: string[];
}

interface Tournament {
  id: string;
  name: string;
  description?: string;
  date: Date;
  location: string;
  categories: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  registrationDeadline: Date;
  entryFee?: number;
  prizes?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  results?: TournamentResult[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  targetAudience: ('all' | 'students' | 'parents' | 'coaches')[];
  pinned: boolean;
  expiryDate?: Date;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  equipment: string[];
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'warmup' | 'technique' | 'physical' | 'tactical' | 'cooldown';
}

interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  coachId: string;
  createdAt: Date;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  exercises: Exercise[];
  sourceType?: 'manual' | 'class';
  classId?: string;
  warmUp?: Exercise[];
  coolDown?: Exercise[];
}

interface ClassPlan {
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
  materials: Array<{
    id: string;
    name: string;
    type: 'equipment' | 'document' | 'video' | 'link';
    description?: string;
    url?: string;
    required: boolean;
  }>;
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

interface Attendance {
  id: string;
  studentId: string;
  scheduleId: string;
  date: Date;
  present: boolean;
  notes?: string;
  checkedBy: string;
}

interface Evaluation {
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
  overallScore?: number;
  overall?: number;
  goals?: string[];
}

interface StudentLogEntry {
  id: string;
  studentId: string;
  coachId?: string;
  date: Date;
  parameter?: string;
  value?: number;
  description?: string;
  type?: 'achievement' | 'progress' | 'note';
  performedBy?: string;
}

interface ChallengeParameter {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'physical' | 'mental' | 'tactical';
  unit: string;
  valueType?: 'number' | 'percentage';
  active?: boolean;
  targetValue?: number;
  difficultyLevels?: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

interface PaymentType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface EvaluationField {
  id: string;
  name: string;
  category: 'technical' | 'physical' | 'mental';
  description?: string;
  active: boolean;
}

interface Notification {
  id: string;
  type: 'payment' | 'general' | 'announcement';
  title: string;
  message: string;
  from: string;
  to: string;
  createdAt: Date;
  read: boolean;
  paymentId?: string;
  priority: 'low' | 'medium' | 'high';
}

interface CoachSpecialization {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
}

interface AppContextType {
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
  classPlans: ClassPlan[];
  attendances: Attendance[];
  evaluations: Evaluation[];
  challengeParameters: ChallengeParameter[];
  studentLogs: StudentLogEntry[];
  paymentTypes: PaymentType[];
  expenseCategories: ExpenseCategory[];
  evaluationFields: EvaluationField[];
  notifications: Notification[];
  coachSpecializations: CoachSpecialization[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  deleteStudent: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  addTournament: (tournament: Omit<Tournament, 'id'>) => void;
  updateTournament: (id: string, tournament: Partial<Tournament>) => void;
  deleteTournament: (id: string) => void;
  markAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => void;
  addClassPlan: (classPlan: Omit<ClassPlan, 'id'>) => void;
  updateClassPlan: (id: string, classPlan: Partial<ClassPlan>) => void;
  deleteClassPlan: (id: string) => void;
  addTrainingPlan: (trainingPlan: Omit<TrainingPlan, 'id'>) => void;
  updateTrainingPlan: (id: string, trainingPlan: Partial<TrainingPlan>) => void;
  deleteTrainingPlan: (id: string) => void;
  addStudentLog: (log: Omit<StudentLogEntry, 'id'>) => void;
  updateStudentLog: (id: string, log: Partial<StudentLogEntry>) => void;
  deleteStudentLog: (id: string) => void;
  updateChallengeParameter: (id: string, parameter: Partial<ChallengeParameter>) => void;
  addChallengeParameter: (parameter: Omit<ChallengeParameter, 'id'>) => void;
  updatePaymentType: (id: string, paymentType: Partial<PaymentType>) => void;
  addPaymentType: (paymentType: Omit<PaymentType, 'id'>) => void;
  deletePaymentType: (id: string) => void;
  updateExpenseCategory: (id: string, category: Partial<ExpenseCategory>) => void;
  addExpenseCategory: (category: Omit<ExpenseCategory, 'id'>) => void;
  deleteExpenseCategory: (id: string) => void;
  updateEvaluationField: (id: string, field: Partial<EvaluationField>) => void;
  addEvaluationField: (field: Omit<EvaluationField, 'id'>) => void;
  deleteEvaluationField: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addCoach: (coach: Omit<Coach, 'id'>) => void;
  updateCoach: (id: string, coach: Partial<Coach>) => void;
  deleteCoach: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  addCoachSpecialization: (specialization: Omit<CoachSpecialization, 'id'>) => void;
  updateCoachSpecialization: (id: string, specialization: Partial<CoachSpecialization>) => void;
  deleteCoachSpecialization: (id: string) => void;
  dispatch?: React.Dispatch<AppAction>;
}

interface AppState {
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
  classPlans: ClassPlan[];
  attendances: Attendance[];
  evaluations: Evaluation[];
  challengeParameters: ChallengeParameter[];
  studentLogs: StudentLogEntry[];
  paymentTypes: PaymentType[];
  expenseCategories: ExpenseCategory[];
  evaluationFields: EvaluationField[];
  notifications: Notification[];
  coachSpecializations: CoachSpecialization[];
  loading: boolean;
  darkMode: boolean;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_STUDENT'; payload: { id: string; student: Partial<Student> } }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: { id: string; payment: Partial<Payment> } }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Announcement }
  | { type: 'UPDATE_ANNOUNCEMENT'; payload: { id: string; announcement: Partial<Announcement> } }
  | { type: 'DELETE_ANNOUNCEMENT'; payload: string }
  | { type: 'ADD_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_TOURNAMENT'; payload: { id: string; tournament: Partial<Tournament> } }
  | { type: 'DELETE_TOURNAMENT'; payload: string }
  | { type: 'MARK_ATTENDANCE'; payload: Attendance }
  | { type: 'ADD_EVALUATION'; payload: Evaluation }
  | { type: 'ADD_CLASS_PLAN'; payload: ClassPlan }
  | { type: 'UPDATE_CLASS_PLAN'; payload: { id: string; classPlan: Partial<ClassPlan> } }
  | { type: 'DELETE_CLASS_PLAN'; payload: string }
  | { type: 'ADD_TRAINING_PLAN'; payload: TrainingPlan }
  | { type: 'UPDATE_TRAINING_PLAN'; payload: { id: string; trainingPlan: Partial<TrainingPlan> } }
  | { type: 'DELETE_TRAINING_PLAN'; payload: string }
  | { type: 'ADD_STUDENT_LOG'; payload: StudentLogEntry }
  | { type: 'UPDATE_STUDENT_LOG'; payload: { id: string; log: Partial<StudentLogEntry> } }
  | { type: 'DELETE_STUDENT_LOG'; payload: string }
  | { type: 'UPDATE_CHALLENGE_PARAMETER'; payload: { id: string; parameter: Partial<ChallengeParameter> } }
  | { type: 'ADD_CHALLENGE_PARAMETER'; payload: ChallengeParameter }
  | { type: 'UPDATE_PAYMENT_TYPE'; payload: { id: string; paymentType: Partial<PaymentType> } }
  | { type: 'ADD_PAYMENT_TYPE'; payload: PaymentType }
  | { type: 'DELETE_PAYMENT_TYPE'; payload: string }
  | { type: 'UPDATE_EXPENSE_CATEGORY'; payload: { id: string; category: Partial<ExpenseCategory> } }
  | { type: 'ADD_EXPENSE_CATEGORY'; payload: ExpenseCategory }
  | { type: 'DELETE_EXPENSE_CATEGORY'; payload: string }
  | { type: 'UPDATE_EVALUATION_FIELD'; payload: { id: string; field: Partial<EvaluationField> } }
  | { type: 'ADD_EVALUATION_FIELD'; payload: EvaluationField }
  | { type: 'DELETE_EVALUATION_FIELD'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_AS_READ'; payload: string }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'ADD_COACH'; payload: Coach }
  | { type: 'UPDATE_COACH'; payload: { id: string; coach: Partial<Coach> } }
  | { type: 'DELETE_COACH'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; user: Partial<User> } }
  | { type: 'ADD_COACH_SPECIALIZATION'; payload: CoachSpecialization }
  | { type: 'UPDATE_COACH_SPECIALIZATION'; payload: { id: string; specialization: Partial<CoachSpecialization> } }
  | { type: 'DELETE_COACH_SPECIALIZATION'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'INITIALIZE_DATA'; payload: Partial<AppState> };

const initialState: AppState = {
  user: null,
  users: [],
  students: [],
  coaches: [],
  categories: [],
  schedules: [],
  payments: [],
  tournaments: [],
  announcements: [],
  trainingPlans: [],
  classPlans: [],
  attendances: [],
  evaluations: [],
  challengeParameters: [],
  studentLogs: [],
  paymentTypes: [],
  expenseCategories: [],
  notifications: [],
  coachSpecializations: [
    {
      id: 'spec_1',
      name: 'Técnica',
      description: 'Desarrollo de habilidades técnicas fundamentales del voleibol',
      icon: 'FiTarget',
      color: 'blue',
      active: true
    },
    {
      id: 'spec_2',
      name: 'Preparación Física',
      description: 'Acondicionamiento físico y desarrollo de capacidades atléticas',
      icon: 'FiActivity',
      color: 'green',
      active: true
    },
    {
      id: 'spec_3',
      name: 'Táctica',
      description: 'Estrategias de juego y sistemas tácticos',
      icon: 'FiZap',
      color: 'purple',
      active: true
    },
    {
      id: 'spec_4',
      name: 'Psicología Deportiva',
      description: 'Desarrollo mental y manejo de emociones en el deporte',
      icon: 'FiTrendingUp',
      color: 'pink',
      active: true
    },
    {
      id: 'spec_5',
      name: 'Nutrición',
      description: 'Asesoramiento nutricional para deportistas',
      icon: 'FiBook',
      color: 'orange',
      active: true
    },
    {
      id: 'spec_6',
      name: 'Análisis de Video',
      description: 'Análisis técnico-táctico mediante grabaciones',
      icon: 'FiAward',
      color: 'red',
      active: true
    }
  ],
  evaluationFields: [
    // Campos técnicos predeterminados
    { id: 'serve', name: 'Saque', category: 'technical', description: 'Habilidad para realizar saques efectivos', active: true },
    { id: 'spike', name: 'Remate', category: 'technical', description: 'Capacidad para realizar remates eficientes', active: true },
    { id: 'block', name: 'Bloqueo', category: 'technical', description: 'Capacidad para realizar bloqueos efectivos', active: true },
    { id: 'dig', name: 'Defensa', category: 'technical', description: 'Habilidad para defender y recibir', active: true },
    { id: 'set', name: 'Colocación', category: 'technical', description: 'Habilidad para realizar pases precisos', active: true },
    
    // Campos físicos predeterminados
    { id: 'endurance', name: 'Resistencia', category: 'physical', description: 'Capacidad aeróbica y resistencia física', active: true },
    { id: 'strength', name: 'Fuerza', category: 'physical', description: 'Fortaleza muscular general', active: true },
    { id: 'agility', name: 'Agilidad', category: 'physical', description: 'Capacidad para moverse con rapidez y coordinación', active: true },
    { id: 'jump', name: 'Salto', category: 'physical', description: 'Potencia de salto vertical y horizontal', active: true },
    
    // Campos mentales predeterminados
    { id: 'focus', name: 'Concentración', category: 'mental', description: 'Capacidad para mantener la concentración', active: true },
    { id: 'teamwork', name: 'Trabajo en Equipo', category: 'mental', description: 'Colaboración y trabajo con compañeras', active: true },
    { id: 'leadership', name: 'Liderazgo', category: 'mental', description: 'Capacidad para liderar al equipo', active: true },
    { id: 'attitude', name: 'Actitud', category: 'mental', description: 'Actitud positiva y disposición', active: true }
  ],
  loading: false,
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id
            ? { ...student, ...action.payload.student }
            : student
        )
      };
    case 'ADD_STUDENT':
      return {
        ...state,
        students: [...state.students, action.payload]
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload)
      };
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload]
      };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, ...action.payload.payment }
            : payment
        )
      };
    case 'ADD_ANNOUNCEMENT':
      return {
        ...state,
        announcements: [...state.announcements, action.payload]
      };
    case 'UPDATE_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.map(announcement =>
          announcement.id === action.payload.id
            ? { ...announcement, ...action.payload.announcement }
            : announcement
        )
      };
    case 'DELETE_ANNOUNCEMENT':
      return {
        ...state,
        announcements: state.announcements.filter(announcement => announcement.id !== action.payload)
      };
    case 'ADD_TOURNAMENT':
      return {
        ...state,
        tournaments: [...state.tournaments, action.payload]
      };
    case 'UPDATE_TOURNAMENT':
      return {
        ...state,
        tournaments: state.tournaments.map(tournament =>
          tournament.id === action.payload.id
            ? { ...tournament, ...action.payload.tournament }
            : tournament
        )
      };
    case 'DELETE_TOURNAMENT':
      return {
        ...state,
        tournaments: state.tournaments.filter(tournament => tournament.id !== action.payload)
      };
    case 'MARK_ATTENDANCE':
      return {
        ...state,
        attendances: [...state.attendances, action.payload]
      };
    case 'ADD_EVALUATION':
      return {
        ...state,
        evaluations: [...state.evaluations, action.payload]
      };
    case 'ADD_CLASS_PLAN':
      return {
        ...state,
        classPlans: [...state.classPlans, action.payload]
      };
    case 'UPDATE_CLASS_PLAN':
      return {
        ...state,
        classPlans: state.classPlans.map(classPlan =>
          classPlan.id === action.payload.id
            ? { ...classPlan, ...action.payload.classPlan }
            : classPlan
        )
      };
    case 'DELETE_CLASS_PLAN':
      return {
        ...state,
        classPlans: state.classPlans.filter(classPlan => classPlan.id !== action.payload)
      };
    case 'ADD_TRAINING_PLAN':
      return {
        ...state,
        trainingPlans: [...state.trainingPlans, action.payload]
      };
    case 'UPDATE_TRAINING_PLAN':
      return {
        ...state,
        trainingPlans: state.trainingPlans.map(plan =>
          plan.id === action.payload.id
            ? { ...plan, ...action.payload.trainingPlan }
            : plan
        )
      };
    case 'DELETE_TRAINING_PLAN':
      return {
        ...state,
        trainingPlans: state.trainingPlans.filter(plan => plan.id !== action.payload)
      };
    case 'ADD_STUDENT_LOG':
      return {
        ...state,
        studentLogs: [...state.studentLogs, action.payload]
      };
    case 'UPDATE_STUDENT_LOG':
      return {
        ...state,
        studentLogs: state.studentLogs.map(log =>
          log.id === action.payload.id
            ? { ...log, ...action.payload.log }
            : log
        )
      };
    case 'DELETE_STUDENT_LOG':
      return {
        ...state,
        studentLogs: state.studentLogs.filter(log => log.id !== action.payload)
      };
    case 'UPDATE_CHALLENGE_PARAMETER':
      return {
        ...state,
        challengeParameters: state.challengeParameters.map(param =>
          param.id === action.payload.id
            ? { ...param, ...action.payload.parameter }
            : param
        )
      };
    case 'ADD_CHALLENGE_PARAMETER':
      return {
        ...state,
        challengeParameters: [...state.challengeParameters, action.payload]
      };
    case 'UPDATE_PAYMENT_TYPE':
      return {
        ...state,
        paymentTypes: state.paymentTypes.map(type =>
          type.id === action.payload.id
            ? { ...type, ...action.payload.paymentType }
            : type
        )
      };
    case 'ADD_PAYMENT_TYPE':
      return {
        ...state,
        paymentTypes: [...state.paymentTypes, action.payload]
      };
    case 'DELETE_PAYMENT_TYPE':
      return {
        ...state,
        paymentTypes: state.paymentTypes.filter(type => type.id !== action.payload)
      };
    case 'UPDATE_EXPENSE_CATEGORY':
      return {
        ...state,
        expenseCategories: state.expenseCategories.map(category =>
          category.id === action.payload.id
            ? { ...category, ...action.payload.category }
            : category
        )
      };
    case 'ADD_EXPENSE_CATEGORY':
      return {
        ...state,
        expenseCategories: [...state.expenseCategories, action.payload]
      };
    case 'DELETE_EXPENSE_CATEGORY':
      return {
        ...state,
        expenseCategories: state.expenseCategories.filter(category => category.id !== action.payload)
      };
    case 'UPDATE_EVALUATION_FIELD':
      return {
        ...state,
        evaluationFields: state.evaluationFields.map(field =>
          field.id === action.payload.id
            ? { ...field, ...action.payload.field }
            : field
        )
      };
    case 'ADD_EVALUATION_FIELD':
      return {
        ...state,
        evaluationFields: [...state.evaluationFields, action.payload]
      };
    case 'DELETE_EVALUATION_FIELD':
      return {
        ...state,
        evaluationFields: state.evaluationFields.filter(field => field.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'MARK_NOTIFICATION_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'ADD_COACH':
      return {
        ...state,
        coaches: [...state.coaches, action.payload]
      };
    case 'UPDATE_COACH':
      return {
        ...state,
        coaches: state.coaches.map(coach =>
          coach.id === action.payload.id
            ? { ...coach, ...action.payload.coach }
            : coach
        )
      };
    case 'DELETE_COACH':
      return {
        ...state,
        coaches: state.coaches.filter(coach => coach.id !== action.payload),
        // Also remove the associated user
        users: state.users.filter(user => {
          const coach = state.coaches.find(c => c.id === action.payload);
          return !(coach && user.email === coach.email);
        })
      };
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    case 'UPDATE_USER':
      const updatedUsers = state.users.map(user =>
        user.id === action.payload.id
          ? { ...user, ...action.payload.user }
          : user
      );
      
      // If updating the current user, update it as well
      const updatedCurrentUser = state.user && state.user.id === action.payload.id
        ? { ...state.user, ...action.payload.user }
        : state.user;
      
      return {
        ...state,
        users: updatedUsers,
        user: updatedCurrentUser
      };
    case 'ADD_COACH_SPECIALIZATION':
      return {
        ...state,
        coachSpecializations: [...state.coachSpecializations, action.payload]
      };
    case 'UPDATE_COACH_SPECIALIZATION':
      return {
        ...state,
        coachSpecializations: state.coachSpecializations.map(spec =>
          spec.id === action.payload.id
            ? { ...spec, ...action.payload.specialization }
            : spec
        )
      };
    case 'DELETE_COACH_SPECIALIZATION':
      return {
        ...state,
        coachSpecializations: state.coachSpecializations.filter(spec => spec.id !== action.payload)
      };
    case 'TOGGLE_DARK_MODE':
      const newDarkMode = !state.darkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', newDarkMode.toString());
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { ...state, darkMode: newDarkMode };
    case 'INITIALIZE_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize data from localStorage or use mock data
  useEffect(() => {
    
    // TEMPORAL: Descomentar la siguiente línea para limpiar localStorage y forzar carga de mockData
    // localStorage.removeItem('volleyAcademyData');
    
    const savedData = localStorage.getItem('volleyAcademyData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
      } catch (e) {
      }
    }
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const processedData = {
          ...parsedData,
          students: parsedData.students?.map((student: any) => ({
            ...student,
            birthDate: new Date(student.birthDate),
            enrollmentDate: new Date(student.enrollmentDate),
            category: student.category,
            achievements: student.achievements?.map((ach: any) => ({
              ...ach,
              earnedDate: new Date(ach.earnedDate)
            })) || []
          })) || [],
          coaches: (() => {
            // Merge mockCoaches with saved coaches to ensure all coaches are loaded
            const savedCoaches = parsedData.coaches?.map((coach: any) => ({
              ...coach,
              hireDate: new Date(coach.hireDate)
            })) || [];
            
            // Get existing coach IDs to avoid duplicates
            const existingIds = new Set(savedCoaches.map((c: any) => c.id));
            
            // Add mockCoaches that don't exist in saved data
            const missingMockCoaches = mockCoaches.filter(mockCoach => !existingIds.has(mockCoach.id));
            
            // Merge both arrays
            const allCoaches = [...savedCoaches, ...missingMockCoaches];
            
            
            return allCoaches;
          })(),
          payments: (() => {
            // Merge mockPayments with saved payments to ensure mockData is loaded
            const savedPayments = parsedData.payments?.map((payment: any) => ({
              ...payment,
              dueDate: new Date(payment.dueDate),
              paidDate: payment.paidDate ? new Date(payment.paidDate) : undefined,
              approvedDate: payment.approvedDate ? new Date(payment.approvedDate) : undefined,
              voucherUploadDate: payment.voucherUploadDate ? new Date(payment.voucherUploadDate) : undefined
            })) || [];
            
            // Get existing payment IDs to avoid duplicates
            const existingIds = new Set(savedPayments.map((p: any) => p.id));
            
            // Add mockPayments that don't exist in saved data
            const missingMockPayments = mockPayments.filter(mockPayment => !existingIds.has(mockPayment.id));
            
            // Merge both arrays
            const allPayments = [...savedPayments, ...missingMockPayments];
            
            
            return allPayments;
          })(),
          tournaments: parsedData.tournaments?.map((tournament: any) => ({
            ...tournament,
            date: new Date(tournament.date),
            registrationDeadline: new Date(tournament.registrationDeadline)
          })) || [],
          announcements: parsedData.announcements?.map((ann: any) => ({
            ...ann,
            createdAt: new Date(ann.createdAt)
          })) || [],
          trainingPlans: parsedData.trainingPlans?.map((plan: any) => ({
            ...plan,
            createdAt: new Date(plan.createdAt)
          })) || [],
          classPlans: (() => {
            const savedClassPlans = parsedData.classPlans?.map((classPlan: any) => ({
              ...classPlan,
              date: new Date(classPlan.date),
              createdAt: new Date(classPlan.createdAt)
            })) || [];
            
            // Convertir mockClassPlans
            const processedMockClassPlans = mockClassPlans.map(cp => ({
              ...cp,
              date: new Date(cp.date),
              createdAt: new Date(cp.createdAt)
            }));
            
            // Combinar mockClassPlans con savedClassPlans, evitando duplicados
            const existingIds = new Set(savedClassPlans.map((cp: any) => cp.id));
            const uniqueMockPlans = processedMockClassPlans.filter(cp => !existingIds.has(cp.id));
            
            
            // Retornar mockClassPlans primero, luego las guardadas
            return [...uniqueMockPlans, ...savedClassPlans];
          })(),
          attendances: parsedData.attendances?.map((att: any) => ({
            ...att,
            date: new Date(att.date)
          })) || [],
          evaluations: parsedData.evaluations?.map((evaluation: any) => ({
            ...evaluation,
            date: new Date(evaluation.date)
          })) || [],
          challengeParameters: parsedData.challengeParameters || mockChallengeParameters,
          paymentTypes: parsedData.paymentTypes || [],
          expenseCategories: parsedData.expenseCategories || [],
          evaluationFields: parsedData.evaluationFields || initialState.evaluationFields,
          notifications: parsedData.notifications?.map((notif: any) => ({
            ...notif,
            createdAt: new Date(notif.createdAt)
          })) || [],
          studentLogs: parsedData.studentLogs?.map((log: any) => ({
            ...log,
            date: new Date(log.date)
          })) || []
        };
        console.log('🚀 AppContext - Primeros 3 pagos después del merge:', processedData.payments?.slice(0, 3) || []);
        console.log('🚀 AppContext - Total classPlans después del procesamiento:', processedData.classPlans?.length || 0);
        console.log('🚀 AppContext - ClassPlans procesados:', processedData.classPlans);
        dispatch({ type: 'INITIALIZE_DATA', payload: processedData });
      } catch (error) {
        console.error('Error parsing saved data:', error);
        // Use mock data as fallback
        // Transform mockStudents to include full category object
        const transformedStudents = mockStudents.map((mockStudent: any) => {
          const category = mockCategories.find(cat => cat.id === mockStudent.categoryId);
          const user = mockUsers.find(u => u.id === mockStudent.userId);
          const parent = mockUsers.find(u => u.id === mockStudent.parentId);
          
          return {
            id: mockStudent.id,
            name: user?.name || 'Unknown Student',
            age: new Date().getFullYear() - new Date(mockStudent.dateOfBirth).getFullYear(),
            category: category ? {
              ...category,
              price: (category as any).price || (category as any).monthlyFee || 0,
              maxStudents: (category as any).maxStudents || 20,
              currentStudents: (category as any).currentStudents || 0,
              schedule: Array.isArray(category.schedule) ? category.schedule : [category.schedule]
            } : {
              ...mockCategories[0],
              price: (mockCategories[0] as any).price || (mockCategories[0] as any).monthlyFee || 0,
              maxStudents: (mockCategories[0] as any).maxStudents || 20,
              currentStudents: (mockCategories[0] as any).currentStudents || 0,
              schedule: Array.isArray(mockCategories[0].schedule) ? mockCategories[0].schedule : [mockCategories[0].schedule]
            },
            categoryId: mockStudent.categoryId,
            parentId: mockStudent.parentId,
            parentName: parent?.name || 'Unknown Parent',
            parentPhone: (parent as any)?.phone || '',
            parentEmail: parent?.email || '',
            emergencyContact: 'Contacto de emergencia',
            emergencyPhone: '999-999-999',
            medicalInfo: mockStudent.medicalInfo,
            address: 'Dirección no especificada',
            birthDate: mockStudent.dateOfBirth,
            enrollmentDate: mockStudent.enrollmentDate,
            avatar: (user as any)?.profileImage || (user as any)?.avatar,
            coachId: (category as any)?.coachId,
            achievements: [],
            stats: {
              attendanceRate: 0, // Se calculará basado en asistencias reales
              skillLevel: 0, // Se actualizará por evaluaciones del coach
              improvement: 0, // Se calculará basado en progreso real
              totalSessions: 0, // Se contará de asistencias marcadas por coach
              averagePerformance: 0 // Se calculará de evaluaciones reales
            },
            paymentStatus: 'paid' as const
          };
        });
        
        dispatch({
          type: 'INITIALIZE_DATA',
          payload: {
            user: null,
            users: mockUsers.map(u => ({ ...u, createdAt: (u as any).createdAt || new Date() })),
            students: transformedStudents,
            coaches: mockCoaches,
            categories: mockCategories.map(cat => ({
              ...cat,
              price: (cat as any).price || (cat as any).monthlyFee || 0,
              maxStudents: (cat as any).maxStudents || 20,
              currentStudents: (cat as any).currentStudents || 0,
              schedule: Array.isArray(cat.schedule) ? cat.schedule : [cat.schedule]
            })),
            schedules: mockSchedules,
            payments: mockPayments.map(payment => ({
              ...payment,
              description: (payment as any).description || (payment as any).concept || '',
              period: (payment as any).period || 'monthly',
              dueDate: (payment as any).dueDate || (payment as any).date || new Date(),
              status: payment.status === 'completed' ? 'paid' as const : payment.status
            } as Payment)),
            tournaments: mockTournaments.map(tournament => ({
              ...tournament,
              description: (tournament as any).description || '',
              maxParticipants: (tournament as any).maxParticipants || 100,
              currentParticipants: (tournament as any).currentParticipants || 0,
              entryFee: (tournament as any).entryFee || 0,
              prizes: (tournament as any).prizes || []
            })),
            announcements: mockAnnouncements,
            trainingPlans: mockTrainingPlans,
            classPlans: mockClassPlans,
            attendances: mockAttendances,
            evaluations: mockEvaluations.map(ev => ({
              ...ev,
              overallScore: (ev as any).overallScore || (ev as any).overall || 0
            })),
            challengeParameters: mockChallengeParameters.map(param => ({
              ...param,
              valueType: (param as any).valueType || 'number',
              active: (param as any).active !== undefined ? (param as any).active : true
            })),
            notifications: [],
            paymentTypes: [
              { id: 'type_mensualidad', name: 'Mensualidad', description: 'Pago mensual regular', active: true },
              { id: 'type_inscripcion', name: 'Inscripción', description: 'Pago único de inscripción', active: true },
              { id: 'type_torneo', name: 'Torneo', description: 'Pago para participación en torneos', active: true },
              { id: 'type_extra', name: 'Extra', description: 'Pagos adicionales o especiales', active: true }
            ],
            expenseCategories: [
              { id: 'cat_equipamiento', name: 'Equipamiento', description: 'Material deportivo e implementos', active: true },
              { id: 'cat_salarios', name: 'Salarios', description: 'Pagos a entrenadores y personal', active: true },
              { id: 'cat_alquiler', name: 'Alquiler', description: 'Alquiler de instalaciones', active: true },
              { id: 'cat_servicios', name: 'Servicios', description: 'Servicios básicos y mantenimiento', active: true },
              { id: 'cat_marketing', name: 'Marketing', description: 'Publicidad y promoción', active: true },
              { id: 'cat_otros', name: 'Otros', description: 'Gastos varios', active: true }
            ],
            evaluationFields: initialState.evaluationFields,
            studentLogs: mockStudentLogs
          }
        });
      }
    } else {
      // Use mock data for first time
      console.log('🚀 AppContext - No hay datos en localStorage, usando mockData');
      console.log('🚀 AppContext - Inicializando con mockPayments:', mockPayments.length);
      
      // Transform mockStudents to include full category object
      const transformedStudents = mockStudents.map((mockStudent: any) => {
        const category = mockCategories.find(cat => cat.id === mockStudent.categoryId);
        const user = mockUsers.find(u => u.id === mockStudent.userId);
        const parent = mockUsers.find(u => u.id === mockStudent.parentId);
        
        return {
          id: mockStudent.id,
          name: user?.name || 'Unknown Student',
          age: new Date().getFullYear() - new Date(mockStudent.dateOfBirth).getFullYear(),
          category: category ? {
            ...category,
            price: (category as any).price || (category as any).monthlyFee || 0,
            maxStudents: (category as any).maxStudents || 20,
            currentStudents: (category as any).currentStudents || 0,
            schedule: Array.isArray(category.schedule) ? category.schedule : [category.schedule]
          } : {
            ...mockCategories[0],
            price: (mockCategories[0] as any).price || (mockCategories[0] as any).monthlyFee || 0,
            maxStudents: (mockCategories[0] as any).maxStudents || 20,
            currentStudents: (mockCategories[0] as any).currentStudents || 0,
            schedule: Array.isArray(mockCategories[0].schedule) ? mockCategories[0].schedule : [mockCategories[0].schedule]
          },
          categoryId: mockStudent.categoryId,
          parentId: mockStudent.parentId,
          parentName: parent?.name || 'Unknown Parent',
          parentPhone: (parent as any)?.phone || '',
          parentEmail: parent?.email || '',
          emergencyContact: 'Contacto de emergencia',
          emergencyPhone: '999-999-999',
          medicalInfo: mockStudent.medicalInfo,
          address: 'Dirección no especificada',
          birthDate: mockStudent.dateOfBirth,
          enrollmentDate: mockStudent.enrollmentDate,
          avatar: (user as any)?.profileImage || (user as any)?.avatar,
          coachId: (category as any)?.coachId,
          achievements: [],
          stats: {
            attendanceRate: 85,
            skillLevel: 3,
            improvement: 15,
            totalSessions: 24,
            averagePerformance: 4.2
          },
          paymentStatus: 'paid' as const
        };
      });
      
      dispatch({
        type: 'INITIALIZE_DATA',
        payload: {
          user: null,
          users: mockUsers.map(u => ({ ...u, createdAt: (u as any).createdAt || new Date() })),
          students: transformedStudents,
          coaches: mockCoaches,
          categories: mockCategories.map(cat => ({
            ...cat,
            price: (cat as any).price || (cat as any).monthlyFee || 0,
            maxStudents: (cat as any).maxStudents || 20,
            currentStudents: (cat as any).currentStudents || 0,
            schedule: Array.isArray(cat.schedule) ? cat.schedule : [cat.schedule]
          })),
          schedules: mockSchedules,
          payments: mockPayments.map(payment => ({
            ...payment,
            description: (payment as any).description || (payment as any).concept || '',
            period: (payment as any).period || 'monthly',
            dueDate: (payment as any).dueDate || (payment as any).date || new Date(),
            status: payment.status === 'completed' ? 'paid' as const : payment.status
          } as Payment)),
          tournaments: mockTournaments.map(tournament => ({
            ...tournament,
            description: (tournament as any).description || '',
            maxParticipants: (tournament as any).maxParticipants || 100,
            currentParticipants: (tournament as any).currentParticipants || 0,
            entryFee: (tournament as any).entryFee || 0,
            prizes: (tournament as any).prizes || []
          })),
          announcements: mockAnnouncements,
          trainingPlans: mockTrainingPlans,
          classPlans: mockClassPlans,
          attendances: mockAttendances,
          evaluations: mockEvaluations.map(ev => ({
            ...ev,
            overallScore: (ev as any).overallScore || (ev as any).overall || 0
          })),
          challengeParameters: mockChallengeParameters.map(param => ({
            ...param,
            valueType: (param as any).valueType || 'number',
            active: (param as any).active !== undefined ? (param as any).active : true
          })),
          evaluationFields: initialState.evaluationFields,
          studentLogs: mockStudentLogs,
          notifications: [],
          paymentTypes: [
            { id: 'type_mensualidad', name: 'Mensualidad', description: 'Pago mensual regular', active: true },
            { id: 'type_inscripcion', name: 'Inscripción', description: 'Pago único de inscripción', active: true },
            { id: 'type_torneo', name: 'Torneo', description: 'Pago para participación en torneos', active: true },
            { id: 'type_extra', name: 'Extra', description: 'Pagos adicionales o especiales', active: true }
          ],
          expenseCategories: [
            { id: 'cat_equipamiento', name: 'Equipamiento', description: 'Material deportivo e implementos', active: true },
            { id: 'cat_salarios', name: 'Salarios', description: 'Pagos a entrenadores y personal', active: true },
            { id: 'cat_alquiler', name: 'Alquiler', description: 'Alquiler de instalaciones', active: true },
            { id: 'cat_servicios', name: 'Servicios', description: 'Servicios básicos y mantenimiento', active: true },
            { id: 'cat_marketing', name: 'Marketing', description: 'Publicidad y promoción', active: true },
            { id: 'cat_otros', name: 'Otros', description: 'Gastos varios', active: true }
          ]
        }
      });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (state.students.length > 0) {
      localStorage.setItem('volleyAcademyData', JSON.stringify({
        users: state.users,
        students: state.students,
        coaches: state.coaches,
        categories: state.categories,
        schedules: state.schedules,
        payments: state.payments,
        tournaments: state.tournaments,
        announcements: state.announcements,
        trainingPlans: state.trainingPlans,
        classPlans: state.classPlans,
        attendances: state.attendances,
        evaluations: state.evaluations,
        challengeParameters: state.challengeParameters,
        studentLogs: state.studentLogs,
        paymentTypes: state.paymentTypes,
        expenseCategories: state.expenseCategories,
        evaluationFields: state.evaluationFields,
        notifications: state.notifications
      }));
    }
  }, [state]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials against all users (including newly created ones)
    // First check the current state users
    const allUsers = state.users;
    const user = allUsers.find(u => u.email === email && u.password === password && u.active);
    
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date(), createdAt: (user as any).createdAt || new Date() };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    }
    
    // Fallback: Check default credentials (for backward compatibility)
    const isValidCredentials = Object.values(defaultCredentials).some(
      cred => cred.email === email && cred.password === password
    );
    
    if (isValidCredentials) {
      const mockUser = mockUsers.find(u => u.email === email);
      if (mockUser) {
        const updatedUser = { ...mockUser, lastLogin: new Date(), createdAt: (mockUser as any).createdAt || new Date() };
        dispatch({ type: 'SET_USER', payload: updatedUser });
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return false;
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('currentUser');
  };

  const updateStudent = (id: string, student: Partial<Student>) => {
    dispatch({ type: 'UPDATE_STUDENT', payload: { id, student } });
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `student_${Date.now()}`
    };
    dispatch({ type: 'ADD_STUDENT', payload: newStudent });
  };

  const deleteStudent = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: id });
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    console.log('🎯 AppContext - Recibiendo datos de pago:', paymentData);
    
    const newPayment: Payment = {
      ...paymentData,
      id: `payment_${Date.now()}`
    };
    
    console.log('🎯 AppContext - Pago completo creado:', newPayment);
    dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
    console.log('🎯 AppContext - Pago añadido al estado');
    
    // Create notification for admin when a payment is registered
    if (paymentData.pendingApproval) {
      console.log('🔔 AppContext - Creando notificación para admin (pendingApproval = true)');
      const student = state.students.find(s => s.id === paymentData.studentId);
      if (student) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'payment',
          title: 'Nuevo pago pendiente de aprobación',
          message: `${student.name} ha registrado un pago de S/ ${paymentData.amount} que requiere aprobación.`,
          from: state.user?.id || 'parent',
          to: 'admin',
          createdAt: new Date(),
          read: false,
          paymentId: newPayment.id,
          priority: 'high'
        };
        console.log('🔔 AppContext - Notificación creada:', notification);
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        console.log('🔔 AppContext - Notificación añadida al estado');
      } else {
        console.log('❌ AppContext - No se encontró el estudiante para la notificación');
      }
    } else {
      console.log('⚠️ AppContext - No se crea notificación (pendingApproval = false)');
    }
  };

  const updatePayment = (id: string, payment: Partial<Payment>) => {
    // Get the current payment to check for changes
    const currentPayment = state.payments.find(p => p.id === id);
    
    // If payment is being marked as pending approval and wasn't before, create a notification
    if (payment.pendingApproval && currentPayment && !currentPayment.pendingApproval) {
      const student = state.students.find(s => s.id === currentPayment.studentId);
      if (student) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'payment',
          title: 'Nueva aprobación de pago pendiente',
          message: `${student.name} ha registrado un pago de S/ ${currentPayment.amount} que requiere aprobación.`,
          from: state.user?.id || 'parent1',
          to: 'admin',
          createdAt: new Date(),
          read: false,
          paymentId: id,
          priority: 'high'
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      }
    }
    
    // If payment is being approved, create notification for parent
    if (payment.approved && currentPayment && !currentPayment.approved) {
      const student = state.students.find(s => s.id === currentPayment.studentId);
      const parent = state.users.find(u => u.studentId === currentPayment.studentId && u.role === 'parent');
      if (student && parent) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'payment',
          title: 'Pago aprobado',
          message: `Su pago de S/ ${currentPayment.amount} para ${student.name} ha sido aprobado.`,
          from: 'admin',
          to: parent.id,
          createdAt: new Date(),
          read: false,
          paymentId: id,
          priority: 'medium'
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      }
    }
    
    // If payment is being rejected, create notification for parent
    if (payment.rejected && currentPayment && !currentPayment.rejected) {
      const student = state.students.find(s => s.id === currentPayment.studentId);
      const parent = state.users.find(u => u.studentId === currentPayment.studentId && u.role === 'parent');
      if (student && parent) {
        const notification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'payment',
          title: 'Pago rechazado',
          message: `Su pago de S/ ${currentPayment.amount} para ${student.name} ha sido rechazado. ${payment.rejectionReason ? `Motivo: ${payment.rejectionReason}` : ''}`,
          from: 'admin',
          to: parent.id,
          createdAt: new Date(),
          read: false,
          paymentId: id,
          priority: 'high'
        };
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      }
    }
    
    dispatch({ type: 'UPDATE_PAYMENT', payload: { id, payment } });
  };

  const addAnnouncement = (announcementData: Omit<Announcement, 'id'>) => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `announcement_${Date.now()}`
    };
    dispatch({ type: 'ADD_ANNOUNCEMENT', payload: newAnnouncement });
  };

  const updateAnnouncement = (id: string, announcement: Partial<Announcement>) => {
    dispatch({ type: 'UPDATE_ANNOUNCEMENT', payload: { id, announcement } });
  };

  const deleteAnnouncement = (id: string) => {
    dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: id });
  };

  const addTournament = (tournamentData: Omit<Tournament, 'id'>) => {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `tournament_${Date.now()}`
    };
    dispatch({ type: 'ADD_TOURNAMENT', payload: newTournament });
  };

  const updateTournament = (id: string, tournament: Partial<Tournament>) => {
    dispatch({ type: 'UPDATE_TOURNAMENT', payload: { id, tournament } });
  };

  const deleteTournament = (id: string) => {
    dispatch({ type: 'DELETE_TOURNAMENT', payload: id });
  };

  const markAttendance = (attendanceData: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      ...attendanceData,
      id: `att_${Date.now()}`
    };
    dispatch({ type: 'MARK_ATTENDANCE', payload: newAttendance });
  };

  const addEvaluation = (evaluationData: Omit<Evaluation, 'id'>) => {
    const newEvaluation: Evaluation = {
      ...evaluationData,
      id: `eval_${Date.now()}`
    };
    dispatch({ type: 'ADD_EVALUATION', payload: newEvaluation });
  };

  const addClassPlan = (classPlanData: Omit<ClassPlan, 'id'>) => {
    const newClassPlan: ClassPlan = {
      ...classPlanData,
      id: `class_${Date.now()}`
    };
    
    // Create corresponding training plan
    const trainingPlan: TrainingPlan = {
      id: `plan_${Date.now()}`,
      title: classPlanData.title,
      description: `Plan de entrenamiento generado desde la clase: ${classPlanData.title}`,
      categoryId: classPlanData.category,
      coachId: classPlanData.coachId,
      createdAt: new Date(),
      duration: classPlanData.duration,
      difficulty: 'intermediate' as const,
      objectives: classPlanData.objectives,
      sourceType: 'class',
      classId: newClassPlan.id,
      warmUp: classPlanData.warmUpPlan.exercises.map((ex, index) => ({
        id: `warmup_${index}_${Date.now()}`,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        equipment: [],
        instructions: [ex.description],
        difficulty: 'beginner' as const,
        category: 'warmup' as const
      })),
      exercises: classPlanData.mainActivityPlan.exercises.map((ex, index) => ({
        id: `main_${index}_${Date.now()}`,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        equipment: [],
        instructions: [ex.description],
        difficulty: 'intermediate' as const,
        category: 'technique' as const
      })),
      coolDown: classPlanData.coolDownPlan.exercises.map((ex, index) => ({
        id: `cooldown_${index}_${Date.now()}`,
        name: ex.name,
        description: ex.description,
        duration: ex.duration,
        equipment: [],
        instructions: [ex.description],
        difficulty: 'beginner' as const,
        category: 'cooldown' as const
      }))
    };
    
    newClassPlan.trainingPlanId = trainingPlan.id;
    
    dispatch({ type: 'ADD_CLASS_PLAN', payload: newClassPlan });
    dispatch({ type: 'ADD_TRAINING_PLAN', payload: trainingPlan });
  };

  const updateClassPlan = (id: string, classPlanData: Partial<ClassPlan>) => {
    const currentClassPlan = state.classPlans.find(cp => cp.id === id);
    if (currentClassPlan && currentClassPlan.trainingPlanId) {
      // Update corresponding training plan
      const updatedTrainingPlan: Partial<TrainingPlan> = {};
      
      if (classPlanData.title) updatedTrainingPlan.title = classPlanData.title;
      if (classPlanData.objectives) updatedTrainingPlan.objectives = classPlanData.objectives;
      if (classPlanData.duration) updatedTrainingPlan.duration = classPlanData.duration;
      
      if (classPlanData.warmUpPlan) {
        updatedTrainingPlan.warmUp = classPlanData.warmUpPlan.exercises.map((ex, index) => ({
          id: `warmup_${index}_${Date.now()}`,
          name: ex.name,
          description: ex.description,
          duration: ex.duration,
          equipment: [],
          instructions: [ex.description],
          difficulty: 'beginner' as const,
          category: 'warmup' as const
        }));
      }
      
      if (classPlanData.mainActivityPlan) {
        updatedTrainingPlan.exercises = classPlanData.mainActivityPlan.exercises.map((ex, index) => ({
          id: `main_${index}_${Date.now()}`,
          name: ex.name,
          description: ex.description,
          duration: ex.duration,
          equipment: [],
          instructions: [ex.description],
          difficulty: 'intermediate' as const,
          category: 'technique' as const
        }));
      }
      
      if (classPlanData.coolDownPlan) {
        updatedTrainingPlan.coolDown = classPlanData.coolDownPlan.exercises.map((ex, index) => ({
          id: `cooldown_${index}_${Date.now()}`,
          name: ex.name,
          description: ex.description,
          duration: ex.duration,
          equipment: [],
          instructions: [ex.description],
          difficulty: 'beginner' as const,
          category: 'cooldown' as const
        }));
      }
      
      dispatch({ type: 'UPDATE_TRAINING_PLAN', payload: { id: currentClassPlan.trainingPlanId, trainingPlan: updatedTrainingPlan } });
    }
    
    dispatch({ type: 'UPDATE_CLASS_PLAN', payload: { id, classPlan: classPlanData } });
  };

  const deleteClassPlan = (id: string) => {
    const classPlan = state.classPlans.find(cp => cp.id === id);
    if (classPlan && classPlan.trainingPlanId) {
      dispatch({ type: 'DELETE_TRAINING_PLAN', payload: classPlan.trainingPlanId });
    }
    dispatch({ type: 'DELETE_CLASS_PLAN', payload: id });
  };

  const addTrainingPlanFunc = (trainingPlanData: Omit<TrainingPlan, 'id'>) => {
    const newTrainingPlan: TrainingPlan = {
      ...trainingPlanData,
      id: `plan_${Date.now()}`,
      sourceType: trainingPlanData.sourceType || 'manual'
    };
    dispatch({ type: 'ADD_TRAINING_PLAN', payload: newTrainingPlan });
  };

  const updateTrainingPlanFunc = (id: string, trainingPlanData: Partial<TrainingPlan>) => {
    const currentPlan = state.trainingPlans.find(tp => tp.id === id);
    
    // If this is a plan generated from a class, update the corresponding class
    if (currentPlan && currentPlan.sourceType === 'class' && currentPlan.classId) {
      const classPlan = state.classPlans.find(cp => cp.id === currentPlan.classId);
      if (classPlan) {
        const updatedClassPlan: Partial<ClassPlan> = {};
        
        if (trainingPlanData.title) updatedClassPlan.title = trainingPlanData.title;
        if (trainingPlanData.objectives) updatedClassPlan.objectives = trainingPlanData.objectives;
        if (trainingPlanData.duration) updatedClassPlan.duration = trainingPlanData.duration;
        
        if (trainingPlanData.warmUp) {
          updatedClassPlan.warmUpPlan = {
            exercises: trainingPlanData.warmUp.map(ex => ({
              name: ex.name,
              duration: ex.duration,
              description: ex.description
            })),
            totalDuration: trainingPlanData.warmUp.reduce((sum, ex) => sum + ex.duration, 0)
          };
        }
        
        if (trainingPlanData.exercises) {
          updatedClassPlan.mainActivityPlan = {
            exercises: trainingPlanData.exercises.map(ex => ({
              name: ex.name,
              duration: ex.duration,
              description: ex.description
            })),
            totalDuration: trainingPlanData.exercises.reduce((sum, ex) => sum + ex.duration, 0)
          };
        }
        
        if (trainingPlanData.coolDown) {
          updatedClassPlan.coolDownPlan = {
            exercises: trainingPlanData.coolDown.map(ex => ({
              name: ex.name,
              duration: ex.duration,
              description: ex.description
            })),
            totalDuration: trainingPlanData.coolDown.reduce((sum, ex) => sum + ex.duration, 0)
          };
        }
        
        dispatch({ type: 'UPDATE_CLASS_PLAN', payload: { id: currentPlan.classId, classPlan: updatedClassPlan } });
      }
    }
    
    dispatch({ type: 'UPDATE_TRAINING_PLAN', payload: { id, trainingPlan: trainingPlanData } });
  };

  const deleteTrainingPlanFunc = (id: string) => {
    const trainingPlan = state.trainingPlans.find(tp => tp.id === id);
    
    // If this is a plan generated from a class, also delete the class
    if (trainingPlan && trainingPlan.sourceType === 'class' && trainingPlan.classId) {
      dispatch({ type: 'DELETE_CLASS_PLAN', payload: trainingPlan.classId });
    }
    
    dispatch({ type: 'DELETE_TRAINING_PLAN', payload: id });
  };

  const addStudentLog = (logData: Omit<StudentLogEntry, 'id'>) => {
    const newLog: StudentLogEntry = {
      ...logData,
      id: `log_${Date.now()}`
    };
    dispatch({ type: 'ADD_STUDENT_LOG', payload: newLog });
  };

  const updateStudentLog = (id: string, log: Partial<StudentLogEntry>) => {
    dispatch({ type: 'UPDATE_STUDENT_LOG', payload: { id, log } });
  };

  const deleteStudentLog = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT_LOG', payload: id });
  };

  const updateChallengeParameter = (id: string, parameter: Partial<ChallengeParameter>) => {
    dispatch({ type: 'UPDATE_CHALLENGE_PARAMETER', payload: { id, parameter } });
  };

  const addChallengeParameter = (parameterData: Omit<ChallengeParameter, 'id'>) => {
    const newParameter: ChallengeParameter = {
      ...parameterData,
      id: `param_${Date.now()}`
    };
    dispatch({ type: 'ADD_CHALLENGE_PARAMETER', payload: newParameter });
  };

  const updatePaymentType = (id: string, paymentType: Partial<PaymentType>) => {
    dispatch({ type: 'UPDATE_PAYMENT_TYPE', payload: { id, paymentType } });
  };

  const addPaymentType = (paymentTypeData: Omit<PaymentType, 'id'>) => {
    const newPaymentType: PaymentType = {
      ...paymentTypeData,
      id: `type_${Date.now()}`
    };
    dispatch({ type: 'ADD_PAYMENT_TYPE', payload: newPaymentType });
  };

  const deletePaymentType = (id: string) => {
    dispatch({ type: 'DELETE_PAYMENT_TYPE', payload: id });
  };

  const updateExpenseCategory = (id: string, category: Partial<ExpenseCategory>) => {
    dispatch({ type: 'UPDATE_EXPENSE_CATEGORY', payload: { id, category } });
  };

  const addExpenseCategory = (categoryData: Omit<ExpenseCategory, 'id'>) => {
    const newCategory: ExpenseCategory = {
      ...categoryData,
      id: `cat_${Date.now()}`
    };
    dispatch({ type: 'ADD_EXPENSE_CATEGORY', payload: newCategory });
  };

  const deleteExpenseCategory = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE_CATEGORY', payload: id });
  };

  const updateEvaluationField = (id: string, field: Partial<EvaluationField>) => {
    dispatch({ type: 'UPDATE_EVALUATION_FIELD', payload: { id, field } });
  };

  const addEvaluationField = (fieldData: Omit<EvaluationField, 'id'>) => {
    const newField: EvaluationField = {
      ...fieldData,
      id: `field_${fieldData.category}_${Date.now()}`
    };
    dispatch({ type: 'ADD_EVALUATION_FIELD', payload: newField });
  };

  const deleteEvaluationField = (id: string) => {
    dispatch({ type: 'DELETE_EVALUATION_FIELD', payload: id });
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
      read: false
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markNotificationAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_AS_READ', payload: id });
  };

  const deleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const addCoach = (coachData: Omit<Coach, 'id'>) => {
    const newCoach: Coach = {
      ...coachData,
      id: `coach_${Date.now()}`
    };
    dispatch({ type: 'ADD_COACH', payload: newCoach });
  };

  const updateCoach = (id: string, coach: Partial<Coach>) => {
    dispatch({ type: 'UPDATE_COACH', payload: { id, coach } });
  };

  const deleteCoach = (id: string) => {
    dispatch({ type: 'DELETE_COACH', payload: id });
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
  };

  const addCoachSpecialization = (specializationData: Omit<CoachSpecialization, 'id'>) => {
    const newSpecialization: CoachSpecialization = {
      ...specializationData,
      id: `spec_${Date.now()}`
    };
    dispatch({ type: 'ADD_COACH_SPECIALIZATION', payload: newSpecialization });
  };

  const updateCoachSpecialization = (id: string, specialization: Partial<CoachSpecialization>) => {
    dispatch({ type: 'UPDATE_COACH_SPECIALIZATION', payload: { id, specialization } });
  };

  const deleteCoachSpecialization = (id: string) => {
    dispatch({ type: 'DELETE_COACH_SPECIALIZATION', payload: id });
  };

  // Check for saved user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  // Initialize dark mode on app load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const contextValue: AppContextType = {
    user: state.user,
    users: state.users,
    students: state.students,
    coaches: state.coaches,
    categories: state.categories,
    schedules: state.schedules,
    payments: state.payments,
    tournaments: state.tournaments,
    announcements: state.announcements,
    trainingPlans: state.trainingPlans,
    classPlans: state.classPlans,
    attendances: state.attendances,
    evaluations: state.evaluations,
    challengeParameters: state.challengeParameters,
    studentLogs: state.studentLogs,
    paymentTypes: state.paymentTypes,
    expenseCategories: state.expenseCategories,
    evaluationFields: state.evaluationFields,
    notifications: state.notifications,
    coachSpecializations: state.coachSpecializations,
    darkMode: state.darkMode,
    toggleDarkMode,
    login,
    logout,
    updateStudent,
    addStudent,
    deleteStudent,
    addPayment,
    updatePayment,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addTournament,
    updateTournament,
    deleteTournament,
    markAttendance,
    addEvaluation,
    addClassPlan,
    updateClassPlan,
    deleteClassPlan,
    addTrainingPlan: addTrainingPlanFunc,
    updateTrainingPlan: updateTrainingPlanFunc,
    deleteTrainingPlan: deleteTrainingPlanFunc,
    addStudentLog,
    updateStudentLog,
    deleteStudentLog,
    updateChallengeParameter,
    addChallengeParameter,
    updatePaymentType,
    addPaymentType,
    deletePaymentType,
    updateExpenseCategory,
    addExpenseCategory,
    deleteExpenseCategory,
    updateEvaluationField,
    addEvaluationField,
    deleteEvaluationField,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    addCoach,
    updateCoach,
    deleteCoach,
    addUser,
    addCoachSpecialization,
    updateCoachSpecialization,
    deleteCoachSpecialization,
    dispatch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;