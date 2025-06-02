// Type definitions
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'coach' | 'parent' | 'student';
  profileImage?: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  ageRange: { min: number; max: number };
  schedule: string;
  monthlyFee: number;
}

interface Student {
  id: string;
  userId: string;
  parentId: string;
  categoryId: string;
  dateOfBirth: Date;
  medicalInfo: string;
  enrollmentDate: Date;
  active: boolean;
  position?: string;
  jerseyNumber?: number;
}

interface Coach {
  id: string;
  userId: string;
  specialization: string;
  experience: number;
  certification: string;
  categories: string[];
  achievements: string[];
  availability: { [key: string]: string[] };
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
  concept: string;
  date: Date;
  status: 'pending' | 'completed' | 'overdue';
  method?: 'cash' | 'card' | 'transfer';
  receiptNumber?: string;
  receiptUrl?: string;
  dueDate?: Date;
  notes?: string;
  pendingApproval?: boolean;
}

interface Tournament {
  id: string;
  name: string;
  date: Date;
  location: string;
  categories: string[];
  registrationDeadline: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  targetAudience: ('all' | 'parents' | 'students' | 'coaches')[];
  pinned: boolean;
  expiryDate?: Date;
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
  overall: number;
  notes: string;
  goals: string[];
}

interface ChallengeParameter {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'physical' | 'mental';
  unit: string;
  targetValue: number;
  difficultyLevels: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

interface StudentLogEntry {
  id: string;
  studentId: string;
  date: Date;
  type: 'achievement' | 'progress' | 'note';
  description: string;
  performedBy: string;
}

// Categorías disponibles
export const mockCategories: Category[] = [
  {
    id: 'cat_infantil',
    name: 'Infantil',
    description: 'Para niños de 8 a 12 años',
    ageRange: { min: 8, max: 12 },
    maxStudents: 15,
    currentStudents: 10,
    price: 45.00,
    monthlyFee: 45.00,
    schedule: ['Lunes, Miércoles y Viernes 15:30-17:00'],
    coachId: 'coach1'
  },
  {
    id: 'cat_juvenil',
    name: 'Juvenil',
    description: 'Para jóvenes de 13 a 17 años',
    ageRange: { min: 13, max: 17 },
    maxStudents: 20,
    currentStudents: 15,
    price: 50.00,
    monthlyFee: 50.00,
    schedule: ['Lunes, Miércoles y Viernes 17:00-18:30'],
    coachId: 'coach2'
  },
  {
    id: 'cat_competitivo',
    name: 'Competitivo',
    description: 'Equipo de competición',
    ageRange: { min: 14, max: 25 },
    maxStudents: 15,
    currentStudents: 12,
    price: 70.00,
    monthlyFee: 70.00,
    schedule: ['Martes, Jueves y Sábado 18:00-20:00'],
    coachId: 'coach3'
  }
];

// Usuarios mock
export const mockUsers: User[] = [
  // Admin
  {
    id: 'admin1',
    email: 'admin@academiavoley.pe',
    password: 'admin123',
    name: 'Admin Principal',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    active: true
  },
  // Coach
  {
    id: 'coach1',
    email: 'sofia.martinez@academiavoley.pe',
    password: 'coach123',
    name: 'Sofía Martínez',
    role: 'coach',
    phone: '999-111-222',
    profileImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'coach2',
    email: 'juan@academia.com',
    password: 'coach456',
    name: 'Juan Pérez',
    role: 'coach',
    phone: '999-222-333',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'coach3',
    email: 'carlos@academia.com',
    password: 'coach789',
    name: 'Carlos López',
    role: 'coach',
    phone: '999-333-444',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    active: true
  },
  // Parents
  {
    id: 'parent1',
    email: 'lucia.garcia@email.com',
    password: 'parent123',
    name: 'Lucía García',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent2',
    email: 'pedro.garcia@email.com',
    password: 'parent456',
    name: 'Pedro García',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent3',
    email: 'laura.lopez@email.com',
    password: 'parent789',
    name: 'Laura López',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent4',
    email: 'roberto.sanchez@email.com',
    password: 'parent012',
    name: 'Roberto Sánchez',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent5',
    email: 'carmen.torres@email.com',
    password: 'parent345',
    name: 'Carmen Torres',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent6',
    email: 'miguel.fernandez@email.com',
    password: 'parent678',
    name: 'Miguel Fernández',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent7',
    email: 'patricia.morales@email.com',
    password: 'parent901',
    name: 'Patricia Morales',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent8',
    email: 'jorge.ramirez@email.com',
    password: 'parent234',
    name: 'Jorge Ramírez',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent9',
    email: 'isabel.mendoza@email.com',
    password: 'parent567',
    name: 'Isabel Mendoza',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'parent10',
    email: 'andres.castro@email.com',
    password: 'parent890',
    name: 'Andrés Castro',
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    active: true
  },
  // Students
  {
    id: 'student1',
    email: 'sofia.martinez@email.com',
    password: 'student123',
    name: 'Sofía Martínez',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student2',
    email: 'diego.garcia@email.com',
    password: 'student456',
    name: 'Diego García',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student3',
    email: 'valentina.lopez@email.com',
    password: 'student789',
    name: 'Valentina López',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student4',
    email: 'mateo.sanchez@email.com',
    password: 'student012',
    name: 'Mateo Sánchez',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student5',
    email: 'camila.torres@email.com',
    password: 'student345',
    name: 'Camila Torres',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student6',
    email: 'lucas.fernandez@email.com',
    password: 'student678',
    name: 'Lucas Fernández',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student7',
    email: 'isabella.morales@email.com',
    password: 'student901',
    name: 'Isabella Morales',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student8',
    email: 'daniel.ramirez@email.com',
    password: 'student234',
    name: 'Daniel Ramírez',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student9',
    email: 'mariana.mendoza@email.com',
    password: 'student567',
    name: 'Mariana Mendoza',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  },
  {
    id: 'student10',
    email: 'sebastian.castro@email.com',
    password: 'student890',
    name: 'Sebastián Castro',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  }
];

// Estudiantes mock
export const mockStudents: Student[] = [
  {
    id: 'student1',
    userId: 'student1',
    parentId: 'parent1',
    categoryId: 'cat_infantil',
    dateOfBirth: new Date('2012-03-15'),
    medicalInfo: 'Sin alergias conocidas',
    enrollmentDate: new Date('2024-01-10'),
    active: true,
    position: 'Colocador',
    jerseyNumber: 7
  },
  {
    id: 'student2',
    userId: 'student2',
    parentId: 'parent2',
    categoryId: 'cat_infantil',
    dateOfBirth: new Date('2013-07-22'),
    medicalInfo: 'Alergia al polen',
    enrollmentDate: new Date('2024-01-15'),
    active: true,
    position: 'Atacante',
    jerseyNumber: 12
  },
  {
    id: 'student3',
    userId: 'student3',
    parentId: 'parent3',
    categoryId: 'cat_juvenil',
    dateOfBirth: new Date('2009-11-08'),
    medicalInfo: 'Asma leve',
    enrollmentDate: new Date('2023-09-01'),
    active: true,
    position: 'Líbero',
    jerseyNumber: 3
  },
  {
    id: 'student4',
    userId: 'student4',
    parentId: 'parent4',
    categoryId: 'cat_juvenil',
    dateOfBirth: new Date('2010-02-28'),
    medicalInfo: 'Sin condiciones médicas',
    enrollmentDate: new Date('2023-10-15'),
    active: true,
    position: 'Central',
    jerseyNumber: 15
  },
  {
    id: 'student5',
    userId: 'student5',
    parentId: 'parent5',
    categoryId: 'cat_competitivo',
    dateOfBirth: new Date('2008-06-10'),
    medicalInfo: 'Sin condiciones médicas',
    enrollmentDate: new Date('2023-01-20'),
    active: true,
    position: 'Opuesto',
    jerseyNumber: 9
  },
  {
    id: 'student6',
    userId: 'student6',
    parentId: 'parent6',
    categoryId: 'cat_competitivo',
    dateOfBirth: new Date('2007-09-05'),
    medicalInfo: 'Diabetes tipo 1',
    enrollmentDate: new Date('2022-11-10'),
    active: true,
    position: 'Colocador',
    jerseyNumber: 1
  },
  {
    id: 'student7',
    userId: 'student7',
    parentId: 'parent7',
    categoryId: 'cat_infantil',
    dateOfBirth: new Date('2012-12-20'),
    medicalInfo: 'Sin condiciones médicas',
    enrollmentDate: new Date('2024-02-01'),
    active: true,
    position: 'Atacante',
    jerseyNumber: 10
  },
  {
    id: 'student8',
    userId: 'student8',
    parentId: 'parent8',
    categoryId: 'cat_juvenil',
    dateOfBirth: new Date('2011-04-18'),
    medicalInfo: 'Alergia a frutos secos',
    enrollmentDate: new Date('2023-08-15'),
    active: true,
    position: 'Central',
    jerseyNumber: 8
  },
  {
    id: 'student9',
    userId: 'student9',
    parentId: 'parent9',
    categoryId: 'cat_competitivo',
    dateOfBirth: new Date('2006-10-30'),
    medicalInfo: 'Sin condiciones médicas',
    enrollmentDate: new Date('2022-05-20'),
    active: true,
    position: 'Líbero',
    jerseyNumber: 5
  },
  {
    id: 'student10',
    userId: 'student10',
    parentId: 'parent10',
    categoryId: 'cat_infantil',
    dateOfBirth: new Date('2013-01-14'),
    medicalInfo: 'Sin condiciones médicas',
    enrollmentDate: new Date('2024-01-25'),
    active: true,
    position: 'Opuesto',
    jerseyNumber: 11
  }
];

// Entrenadores mock
export const mockCoaches: any[] = [
  {
    id: 'coach1',
    name: 'Sofía Martínez',
    email: 'sofia.martinez@academiavoley.pe',
    phone: '999-111-222',
    specialization: ['Técnica', 'Preparación Física', 'Táctica'],
    experience: 8,
    certifications: ['Nivel 3 FIVB', 'Certificación Internacional', 'Especialización en Voleibol Juvenil'],
    hireDate: new Date('2016-03-15'),
    avatar: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    assignedCategories: ['cat_infantil']
  },
  {
    id: 'coach2',
    name: 'Juan Pérez',
    email: 'juan@academia.com',
    phone: '999-222-333',
    specialization: ['Preparación Física', 'Táctica', 'Análisis de Video'],
    experience: 12,
    certifications: ['Nivel 2 FIVB', 'Maestría en Educación Física', 'Certificación en Alto Rendimiento'],
    hireDate: new Date('2012-08-20'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    assignedCategories: ['cat_juvenil']
  },
  {
    id: 'coach3',
    name: 'Carlos López',
    email: 'carlos@academia.com',
    phone: '999-333-444',
    specialization: ['Táctica', 'Psicología Deportiva', 'Nutrición'],
    experience: 15,
    certifications: ['Nivel 4 FIVB', 'Ex-jugador Profesional', 'Diplomado en Psicología del Deporte'],
    hireDate: new Date('2009-01-10'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    assignedCategories: ['cat_competitivo']
  }
];

// Pagos mock
export const mockPayments: Payment[] = [
  // Pagos del student1 (Sofía - parent1)
  {
    id: 'pay1',
    studentId: 'student1',
    amount: 45.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-05'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0001'
  },
  {
    id: 'pay2',
    studentId: 'student1',
    amount: 45.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-03'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0015'
  },
  {
    id: 'pay3',
    studentId: 'student1',
    amount: 45.00,
    concept: 'Mensualidad Marzo 2024',
    date: new Date('2024-03-02'),
    status: 'pending',
    dueDate: new Date('2024-03-05')
  },
  // Pagos del student2 (Diego - parent2)
  {
    id: 'pay4',
    studentId: 'student2',
    amount: 45.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-10'),
    status: 'completed',
    method: 'card',
    receiptNumber: 'REC-2024-0003'
  },
  {
    id: 'pay5',
    studentId: 'student2',
    amount: 45.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-08'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0018'
  },
  // Pagos del student3 (Valentina - parent3)
  {
    id: 'pay6',
    studentId: 'student3',
    amount: 50.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-03'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0002'
  },
  {
    id: 'pay7',
    studentId: 'student3',
    amount: 50.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-05'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0016'
  },
  {
    id: 'pay8',
    studentId: 'student3',
    amount: 50.00,
    concept: 'Mensualidad Marzo 2024',
    date: new Date('2024-03-01'),
    status: 'pending',
    dueDate: new Date('2024-03-05')
  },
  // Pagos del student4 (Mateo - parent4)
  {
    id: 'pay9',
    studentId: 'student4',
    amount: 50.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-15'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0008'
  },
  {
    id: 'pay10',
    studentId: 'student4',
    amount: 50.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-12'),
    status: 'completed',
    method: 'card',
    receiptNumber: 'REC-2024-0020'
  },
  // Pagos del student5 (Camila - parent5)
  {
    id: 'pay11',
    studentId: 'student5',
    amount: 70.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-08'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0004'
  },
  {
    id: 'pay12',
    studentId: 'student5',
    amount: 70.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-07'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0017'
  },
  {
    id: 'pay13',
    studentId: 'student5',
    amount: 70.00,
    concept: 'Mensualidad Marzo 2024',
    date: new Date('2024-03-03'),
    status: 'pending',
    dueDate: new Date('2024-03-05')
  },
  // Pagos del student6 (Lucas - parent6)
  {
    id: 'pay14',
    studentId: 'student6',
    amount: 70.00,
    concept: 'Mensualidad Enero 2024',
    date: new Date('2024-01-11'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0005'
  },
  {
    id: 'pay15',
    studentId: 'student6',
    amount: 70.00,
    concept: 'Mensualidad Febrero 2024',
    date: new Date('2024-02-09'),
    status: 'completed',
    method: 'card',
    receiptNumber: 'REC-2024-0019'
  },
  // Pago con inscripción
  {
    id: 'pay16',
    studentId: 'student7',
    amount: 95.00, // 45 mensualidad + 50 inscripción
    concept: 'Inscripción + Mensualidad Febrero 2024',
    date: new Date('2024-02-01'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2024-0021',
    notes: 'Incluye cuota de inscripción'
  },
  // Pago de torneo
  {
    id: 'pay17',
    studentId: 'student5',
    amount: 35.00,
    concept: 'Inscripción Torneo Regional Marzo 2024',
    date: new Date('2024-02-15'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0022',
    notes: 'Torneo regional categoría competitiva'
  },
  // Pago parcial
  {
    id: 'pay18',
    studentId: 'student8',
    amount: 25.00,
    concept: 'Pago parcial - Mensualidad Febrero 2024',
    date: new Date('2024-02-14'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2024-0023',
    notes: 'Pago parcial 1/2'
  },
  {
    id: 'pay19',
    studentId: 'student8',
    amount: 25.00,
    concept: 'Pago parcial - Mensualidad Febrero 2024',
    date: new Date('2024-02-20'),
    status: 'pending',
    dueDate: new Date('2024-02-20'),
    notes: 'Pago parcial 2/2'
  },
  // Pagos pendientes de aprobación - IMPORTANTE: estos son los que necesitan aprobación
  {
    id: 'pay20',
    studentId: 'student9',
    amount: 70.00,
    concept: 'Mensualidad Marzo 2024',
    date: new Date('2024-02-28'),
    status: 'pending',
    method: 'transfer',
    pendingApproval: true,
    receiptUrl: 'https://example.com/receipt1.jpg',
    notes: 'Transferencia bancaria - Esperando verificación'
  },
  {
    id: 'pay21',
    studentId: 'student10',
    amount: 45.00,
    concept: 'Mensualidad Marzo 2024',
    date: new Date('2024-02-29'),
    status: 'pending',
    method: 'transfer',
    pendingApproval: true,
    receiptUrl: 'https://example.com/receipt2.jpg',
    notes: 'Pago por aplicación móvil'
  },
  {
    id: 'pay22',
    studentId: 'student3',
    amount: 50.00,
    concept: 'Mensualidad Abril 2024',
    date: new Date('2024-03-01'),
    status: 'pending',
    method: 'transfer',
    pendingApproval: true,
    receiptUrl: 'https://example.com/receipt3.jpg',
    notes: 'Transferencia desde app bancaria'
  },
  // Pagos históricos más antiguos
  {
    id: 'pay23',
    studentId: 'student5',
    amount: 70.00,
    concept: 'Mensualidad Diciembre 2023',
    date: new Date('2023-12-05'),
    status: 'completed',
    method: 'transfer',
    receiptNumber: 'REC-2023-0180'
  },
  {
    id: 'pay24',
    studentId: 'student6',
    amount: 70.00,
    concept: 'Mensualidad Diciembre 2023',
    date: new Date('2023-12-08'),
    status: 'completed',
    method: 'cash',
    receiptNumber: 'REC-2023-0182'
  }
];

// Horarios mock
export const mockSchedules: Schedule[] = [
  {
    id: 'schedule1',
    categoryId: 'cat_infantil',
    coachId: 'coach1',
    dayOfWeek: 1, // Lunes
    startTime: '15:30',
    endTime: '17:00',
    location: 'Cancha Principal',
    recurring: true
  },
  {
    id: 'schedule2',
    categoryId: 'cat_infantil',
    coachId: 'coach1',
    dayOfWeek: 3, // Miércoles
    startTime: '16:00',
    endTime: '17:30',
    location: 'Cancha Principal',
    recurring: true
  },
  {
    id: 'schedule3',
    categoryId: 'cat_infantil',
    coachId: 'coach1',
    dayOfWeek: 5, // Viernes
    startTime: '15:30',
    endTime: '17:00',
    location: 'Cancha Principal',
    recurring: true
  },
  {
    id: 'schedule4',
    categoryId: 'cat_juvenil',
    coachId: 'coach2',
    dayOfWeek: 1, // Lunes
    startTime: '18:00',
    endTime: '19:30',
    location: 'Cancha Secundaria',
    recurring: true
  },
  {
    id: 'schedule5',
    categoryId: 'cat_juvenil',
    coachId: 'coach2',
    dayOfWeek: 3, // Miércoles
    startTime: '18:00',
    endTime: '19:30',
    location: 'Cancha Secundaria',
    recurring: true
  },
  {
    id: 'schedule6',
    categoryId: 'cat_juvenil',
    coachId: 'coach2',
    dayOfWeek: 5, // Viernes
    startTime: '17:00',
    endTime: '18:30',
    location: 'Cancha Secundaria',
    recurring: true
  },
  {
    id: 'schedule7',
    categoryId: 'cat_competitivo',
    coachId: 'coach3',
    dayOfWeek: 2, // Martes
    startTime: '19:00',
    endTime: '21:00',
    location: 'Cancha Principal',
    recurring: true
  },
  {
    id: 'schedule8',
    categoryId: 'cat_competitivo',
    coachId: 'coach3',
    dayOfWeek: 4, // Jueves
    startTime: '19:00',
    endTime: '21:00',
    location: 'Cancha Principal',
    recurring: true
  },
  {
    id: 'schedule9',
    categoryId: 'cat_competitivo',
    coachId: 'coach3',
    dayOfWeek: 6, // Sábado
    startTime: '09:00',
    endTime: '11:00',
    location: 'Cancha Principal',
    recurring: true
  }
];
export const mockTournaments: Tournament[] = [];
export const mockAnnouncements: Announcement[] = [];
export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'plan1',
    title: 'Fundamentos de Vóley - Nivel Iniciación',
    description: 'Plan completo para aprender los fundamentos básicos del vóleibol, incluyendo posición, servicio y recepción.',
    categoryId: 'cat_infantil',
    coachId: 'coach1',
    createdAt: new Date('2024-01-15'),
    duration: 90,
    difficulty: 'beginner',
    objectives: [
      'Dominar la posición básica de vóleibol',
      'Aprender técnica correcta de servicio bajo',
      'Mejorar la recepción y pase básico',
      'Desarrollar coordinación y equilibrio'
    ],
    exercises: [
      {
        id: 'ex1',
        name: 'Calentamiento General',
        description: 'Ejercicios de movilidad articular, trote suave y estiramientos dinámicos',
        duration: 15,
        equipment: [],
        instructions: [
          'Trote suave alrededor de la cancha (5 min)',
          'Círculos de brazos y hombros',
          'Estiramientos de piernas',
          'Saltos suaves en el lugar'
        ],
        difficulty: 'beginner',
        category: 'warmup'
      },
      {
        id: 'ex2',
        name: 'Posición Básica',
        description: 'Aprendizaje y práctica de la posición fundamental de vóleibol',
        duration: 20,
        equipment: ['Conos marcadores'],
        instructions: [
          'Pies a la anchura de hombros',
          'Rodillas ligeramente flexionadas',
          'Peso del cuerpo hacia adelante',
          'Brazos listos para recibir'
        ],
        difficulty: 'beginner',
        category: 'technique'
      },
      {
        id: 'ex3',
        name: 'Servicio Bajo',
        description: 'Técnica básica del servicio bajo o de seguridad',
        duration: 25,
        equipment: ['Balones de vóleibol'],
        instructions: [
          'Pie contrario adelante',
          'Balón en mano no dominante',
          'Péndulo con brazo dominante',
          'Contacto con puño cerrado'
        ],
        difficulty: 'beginner',
        category: 'technique'
      },
      {
        id: 'ex4',
        name: 'Recepción con Antebrazos',
        description: 'Técnica de recepción básica y control del balón',
        duration: 25,
        equipment: ['Balones de vóleibol', 'Red'],
        instructions: [
          'Brazos extendidos y juntos',
          'Contacto con antebrazos',
          'Flexión de piernas',
          'Dirigir hacia el colocador'
        ],
        difficulty: 'beginner',
        category: 'technique'
      },
      {
        id: 'ex5',
        name: 'Vuelta a la Calma',
        description: 'Estiramientos estáticos y relajación',
        duration: 5,
        equipment: [],
        instructions: [
          'Estiramientos de brazos',
          'Estiramientos de piernas',
          'Respiración profunda',
          'Caminar suave'
        ],
        difficulty: 'beginner',
        category: 'cooldown'
      }
    ]
  },
  {
    id: 'plan2',
    title: 'Desarrollo de Ataque y Remate',
    description: 'Plan enfocado en mejorar las habilidades de ataque, incluyendo aproximación, salto y técnica de remate.',
    categoryId: 'cat_juvenil',
    coachId: 'coach2',
    createdAt: new Date('2024-01-20'),
    duration: 120,
    difficulty: 'intermediate',
    objectives: [
      'Perfeccionar la técnica de aproximación al remate',
      'Mejorar la potencia y precisión del ataque',
      'Desarrollar diferentes tipos de remate',
      'Fortalecer el salto vertical'
    ],
    exercises: [
      {
        id: 'ex6',
        name: 'Calentamiento Específico',
        description: 'Preparación específica para trabajo de ataque y salto',
        duration: 20,
        equipment: ['Balones medicinales'],
        instructions: [
          'Activación de hombros con balón medicinal',
          'Saltos progresivos',
          'Simulación de movimientos de ataque',
          'Estiramientos dinámicos específicos'
        ],
        difficulty: 'intermediate',
        category: 'warmup'
      },
      {
        id: 'ex7',
        name: 'Técnica de Remate',
        description: 'Práctica intensiva de la técnica de remate desde diferentes posiciones',
        duration: 40,
        equipment: ['Balones de vóleibol', 'Red', 'Plataformas'],
        instructions: [
          'Aproximación de 3-4 pasos',
          'Timing del salto',
          'Contacto con el balón en el punto más alto',
          'Seguimiento del brazo'
        ],
        difficulty: 'intermediate',
        category: 'technique'
      },
      {
        id: 'ex8',
        name: 'Desarrollo de Potencia',
        description: 'Ejercicios pliométricos para desarrollar potencia de salto',
        duration: 30,
        equipment: ['Cajones pliométricos', 'Vallas'],
        instructions: [
          'Saltos a cajón',
          'Saltos con vallas',
          'Ejercicios de reactividad'
        ],
        difficulty: 'intermediate',
        category: 'physical'
      },
      {
        id: 'ex9',
        name: 'Situaciones de Juego',
        description: 'Práctica de remate en situaciones reales de juego',
        duration: 25,
        equipment: ['Balones de vóleibol', 'Red'],
        instructions: [
          'Remates desde pase de colocador',
          'Ataques rápidos',
          'Remates con oposición'
        ],
        difficulty: 'intermediate',
        category: 'tactical'
      },
      {
        id: 'ex10',
        name: 'Recuperación',
        description: 'Ejercicios de recuperación y estiramiento',
        duration: 5,
        equipment: [],
        instructions: [
          'Respiración y relajación',
          'Estiramiento de piernas',
          'Masaje suave de hombros'
        ],
        difficulty: 'intermediate',
        category: 'cooldown'
      }
    ]
  },
  {
    id: 'plan3',
    title: 'Entrenamiento de Alto Rendimiento',
    description: 'Plan intensivo para jugadores competitivos que buscan maximizar su rendimiento en torneos.',
    categoryId: 'cat_competitivo',
    coachId: 'coach3',
    createdAt: new Date('2024-02-10'),
    duration: 150,
    difficulty: 'advanced',
    objectives: [
      'Optimizar todas las técnicas fundamentales',
      'Desarrollar táctica avanzada de juego',
      'Mejorar condición física específica',
      'Preparar para competencias de alto nivel'
    ],
    exercises: [
      {
        id: 'ex11',
        name: 'Activación Pre-Entrenamiento',
        description: 'Rutina de activación muscular y mental para entrenamiento intensivo',
        duration: 25,
        equipment: ['Balones medicinales', 'Bandas elásticas'],
        instructions: [
          'Activación del core',
          'Movilidad dinámica completa',
          'Ejercicios de activación neural'
        ],
        difficulty: 'advanced',
        category: 'warmup'
      },
      {
        id: 'ex12',
        name: 'Técnicas Especializadas',
        description: 'Perfeccionamiento de técnicas avanzadas: fintas, ataques rápidos, bloqueos',
        duration: 50,
        equipment: ['Balones', 'Red', 'Máquina lanzadora'],
        instructions: [
          'Fintas y engaños en el remate',
          'Ataques rápidos (1er tiempo)',
          'Bloqueo doble y triple',
          'Defensas espectaculares'
        ],
        difficulty: 'advanced',
        category: 'technique'
      },
      {
        id: 'ex13',
        name: 'Preparación Física Específica',
        description: 'Entrenamiento físico de alta intensidad específico para vóleibol',
        duration: 35,
        equipment: ['Pesas', 'Cajones', 'Balones medicinales'],
        instructions: [
          'Ejercicios de fuerza funcional',
          'Pliometría avanzada',
          'Resistencia específica'
        ],
        difficulty: 'advanced',
        category: 'physical'
      },
      {
        id: 'ex14',
        name: 'Táctica de Juego',
        description: 'Sistemas de juego complejos y toma de decisiones bajo presión',
        duration: 30,
        equipment: ['Balones', 'Red', 'Pizarra táctica'],
        instructions: [
          'Sistema 6-2 avanzado',
          'Rotaciones y cambios',
          'Jugadas preparadas',
          'Adaptación táctica'
        ],
        difficulty: 'advanced',
        category: 'tactical'
      },
      {
        id: 'ex15',
        name: 'Recuperación Activa',
        description: 'Protocolo de recuperación para entrenamiento de alta intensidad',
        duration: 10,
        equipment: ['Foam roller', 'Pelotas de masaje'],
        instructions: [
          'Auto-masaje con foam roller',
          'Estiramientos específicos',
          'Técnicas de respiración'
        ],
        difficulty: 'advanced',
        category: 'cooldown'
      }
    ]
  }
];

// Class Plans mock
export const mockClassPlans: ClassPlan[] = [
  {
    id: 'class1',
    title: 'Técnica de Remate',
    category: 'Juvenil A',
    date: new Date('2024-01-15'),
    startTime: '16:00',
    endTime: '17:30',
    duration: 90,
    location: 'Cancha Principal',
    coachId: 'coach1',
    objectives: ['Mejorar técnica de aproximación', 'Perfeccionar timing de salto', 'Aumentar potencia de remate'],
    materials: [
      { id: 'm1', name: 'Balones de voleibol', type: 'equipment', description: '12 balones oficiales', required: true },
      { id: 'm2', name: 'Conos marcadores', type: 'equipment', description: '8 conos para delimitar zonas', required: true },
      { id: 'm3', name: 'Video técnica de remate', type: 'video', url: 'https://youtube.com/watch?v=ejemplo', required: false }
    ],
    warmUpPlan: {
      exercises: [
        { name: 'Trote suave', duration: 5, description: 'Trote alrededor de la cancha' },
        { name: 'Movilidad articular', duration: 5, description: 'Ejercicios de movilidad para hombros y cadera' }
      ],
      totalDuration: 10
    },
    mainActivityPlan: {
      exercises: [
        { name: 'Aproximación sin balón', duration: 15, description: 'Práctica de pasos de aproximación' },
        { name: 'Remate contra pared', duration: 20, description: 'Técnica de golpeo contra la pared' },
        { name: 'Remate con colocador', duration: 25, description: 'Práctica completa con pase del colocador' }
      ],
      totalDuration: 60
    },
    coolDownPlan: {
      exercises: [
        { name: 'Estiramientos estáticos', duration: 10, description: 'Estiramiento de principales grupos musculares' },
        { name: 'Relajación', duration: 10, description: 'Ejercicios de respiración y relajación' }
      ],
      totalDuration: 20
    },
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'class2',
    title: 'Defensa en Red',
    category: 'Juvenil B',
    date: new Date('2024-01-15'),
    startTime: '18:00',
    endTime: '19:15',
    duration: 75,
    location: 'Cancha Auxiliar',
    coachId: 'coach2',
    objectives: ['Coordinación en bloqueo doble', 'Lectura del atacante', 'Transición defensa-ataque'],
    materials: [
      { id: 'm4', name: 'Red regulamentaria', type: 'equipment', description: 'Red a altura oficial', required: true },
      { id: 'm5', name: 'Guía de posiciones', type: 'document', url: '/docs/posiciones-defensa.pdf', required: false }
    ],
    warmUpPlan: {
      exercises: [
        { name: 'Calentamiento articular', duration: 10, description: 'Especial énfasis en muñecas y dedos' }
      ],
      totalDuration: 10
    },
    mainActivityPlan: {
      exercises: [
        { name: 'Técnica de bloqueo individual', duration: 20, description: 'Posición de manos y timing' },
        { name: 'Bloqueo coordinado', duration: 30, description: 'Trabajo en parejas y tríos' }
      ],
      totalDuration: 50
    },
    coolDownPlan: {
      exercises: [
        { name: 'Estiramientos', duration: 15, description: 'Foco en brazos y espalda' }
      ],
      totalDuration: 15
    },
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'class3',
    title: 'Servicio y Recepción',
    category: 'Infantil',
    date: new Date('2024-01-16'),
    startTime: '15:30',
    endTime: '16:30',
    duration: 60,
    location: 'Cancha Principal',
    coachId: 'coach1',
    objectives: ['Técnica básica de servicio', 'Posición de recepción', 'Comunicación en cancha'],
    materials: [
      { id: 'm6', name: 'Balones ligeros', type: 'equipment', description: 'Balones adaptados para categoría infantil', required: true },
      { id: 'm7', name: 'Zona de servicio marcada', type: 'equipment', description: 'Cinta para marcar zona', required: true }
    ],
    warmUpPlan: {
      exercises: [
        { name: 'Juegos de coordinación', duration: 10, description: 'Juegos lúdicos con balón' }
      ],
      totalDuration: 10
    },
    mainActivityPlan: {
      exercises: [
        { name: 'Servicio bajo', duration: 20, description: 'Técnica básica de servicio' },
        { name: 'Recepción básica', duration: 20, description: 'Posición y técnica de antebrazos' }
      ],
      totalDuration: 40
    },
    coolDownPlan: {
      exercises: [
        { name: 'Juego libre', duration: 5, description: 'Mini partido recreativo' },
        { name: 'Estiramientos', duration: 5, description: 'Estiramientos suaves' }
      ],
      totalDuration: 10
    },
    createdAt: new Date('2024-01-11')
  }
];

export const mockAttendances: Attendance[] = [
  // Asistencias para Sofía (student1) - Categoría Infantil
  {
    id: 'att1',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-05'), // Lunes pasado
    present: true,
    notes: 'Excelente participación en los ejercicios de servicio',
    checkedBy: 'coach1'
  },
  {
    id: 'att2',
    studentId: 'student1',
    scheduleId: 'schedule2',
    date: new Date('2024-02-07'), // Miércoles pasado
    present: true,
    notes: 'Mejoró mucho en la recepción',
    checkedBy: 'coach1'
  },
  {
    id: 'att3',
    studentId: 'student1',
    scheduleId: 'schedule3',
    date: new Date('2024-02-09'), // Viernes pasado
    present: false,
    notes: 'Falta justificada por examen médico',
    checkedBy: 'coach1'
  },
  {
    id: 'att4',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-12'), // Lunes de esta semana
    present: true,
    notes: 'Buena actitud y concentración',
    checkedBy: 'coach1'
  },
  {
    id: 'att5',
    studentId: 'student1',
    scheduleId: 'schedule2',
    date: new Date('2024-02-14'), // Miércoles de esta semana
    present: true,
    notes: 'Trabajó muy bien en equipo',
    checkedBy: 'coach1'
  },
  // Asistencias para Diego (student2) - Categoría Infantil
  {
    id: 'att6',
    studentId: 'student2',
    scheduleId: 'schedule1',
    date: new Date('2024-02-05'),
    present: true,
    notes: 'Muy motivado en la práctica',
    checkedBy: 'coach1'
  },
  {
    id: 'att7',
    studentId: 'student2',
    scheduleId: 'schedule2',
    date: new Date('2024-02-07'),
    present: true,
    notes: 'Necesita trabajar más en el servicio',
    checkedBy: 'coach1'
  },
  {
    id: 'att8',
    studentId: 'student2',
    scheduleId: 'schedule3',
    date: new Date('2024-02-09'),
    present: true,
    notes: 'Gran mejora en el remate',
    checkedBy: 'coach1'
  },
  // Asistencias para Valentina (student3) - Categoría Juvenil
  {
    id: 'att9',
    studentId: 'student3',
    scheduleId: 'schedule4',
    date: new Date('2024-02-05'),
    present: true,
    notes: 'Excelente liderazgo en la cancha',
    checkedBy: 'coach2'
  },
  {
    id: 'att10',
    studentId: 'student3',
    scheduleId: 'schedule5',
    date: new Date('2024-02-07'),
    present: true,
    notes: 'Muy buena técnica de colocación',
    checkedBy: 'coach2'
  },
  {
    id: 'att11',
    studentId: 'student3',
    scheduleId: 'schedule6',
    date: new Date('2024-02-09'),
    present: false,
    notes: 'Falta no justificada',
    checkedBy: 'coach2'
  },
  // Asistencias para Camila (student5) - Categoría Competitivo
  {
    id: 'att12',
    studentId: 'student5',
    scheduleId: 'schedule7',
    date: new Date('2024-02-06'),
    present: true,
    notes: 'Rendimiento destacado en el entrenamiento',
    checkedBy: 'coach3'
  },
  {
    id: 'att13',
    studentId: 'student5',
    scheduleId: 'schedule8',
    date: new Date('2024-02-08'),
    present: true,
    notes: 'Excelente preparación física',
    checkedBy: 'coach3'
  },
  {
    id: 'att14',
    studentId: 'student5',
    scheduleId: 'schedule9',
    date: new Date('2024-02-10'),
    present: true,
    notes: 'Lista para el próximo torneo',
    checkedBy: 'coach3'
  }
];
export const mockEvaluations: Evaluation[] = [
  // Evaluación para Sofía (student1)
  {
    id: 'eval1',
    studentId: 'student1',
    coachId: 'coach1',
    date: new Date('2024-02-01'),
    technical: {
      serve: 7,
      spike: 6,
      block: 5,
      dig: 7,
      set: 8
    },
    physical: {
      endurance: 8,
      strength: 6,
      agility: 7,
      jump: 6
    },
    mental: {
      focus: 8,
      teamwork: 9,
      leadership: 7,
      attitude: 9
    },
    overall: 7,
    notes: 'Sofía muestra gran progreso en los fundamentos. Excelente actitud y trabajo en equipo. Necesita mejorar la potencia en el remate.',
    goals: [
      'Mejorar técnica de remate',
      'Fortalecer el salto vertical',
      'Mantener la consistencia en el servicio'
    ]
  },
  // Evaluación para Diego (student2)
  {
    id: 'eval2',
    studentId: 'student2',
    coachId: 'coach1',
    date: new Date('2024-02-01'),
    technical: {
      serve: 6,
      spike: 7,
      block: 6,
      dig: 5,
      set: 6
    },
    physical: {
      endurance: 7,
      strength: 7,
      agility: 8,
      jump: 7
    },
    mental: {
      focus: 6,
      teamwork: 7,
      leadership: 5,
      attitude: 8
    },
    overall: 6.5,
    notes: 'Diego tiene buenas condiciones físicas. Debe trabajar en la concentración durante los partidos.',
    goals: [
      'Mejorar la recepción',
      'Desarrollar liderazgo en cancha',
      'Mantener el foco durante todo el entrenamiento'
    ]
  },
  // Evaluación para Valentina (student3)
  {
    id: 'eval3',
    studentId: 'student3',
    coachId: 'coach2',
    date: new Date('2024-01-25'),
    technical: {
      serve: 8,
      spike: 8,
      block: 7,
      dig: 9,
      set: 8
    },
    physical: {
      endurance: 9,
      strength: 7,
      agility: 8,
      jump: 7
    },
    mental: {
      focus: 9,
      teamwork: 10,
      leadership: 9,
      attitude: 10
    },
    overall: 8.5,
    notes: 'Valentina es una jugadora ejemplar. Excelente líbero con gran visión de juego. Lista para competencias de mayor nivel.',
    goals: [
      'Perfeccionar técnicas avanzadas',
      'Preparación para torneo regional',
      'Mentorear a jugadoras más jóvenes'
    ]
  },
  // Evaluación para Camila (student5)
  {
    id: 'eval4',
    studentId: 'student5',
    coachId: 'coach3',
    date: new Date('2024-01-20'),
    technical: {
      serve: 9,
      spike: 10,
      block: 8,
      dig: 7,
      set: 8
    },
    physical: {
      endurance: 9,
      strength: 9,
      agility: 8,
      jump: 9
    },
    mental: {
      focus: 9,
      teamwork: 8,
      leadership: 8,
      attitude: 9
    },
    overall: 8.8,
    notes: 'Camila es nuestra mejor atacante. Potencia excepcional y técnica depurada. Debe trabajar en la defensa baja.',
    goals: [
      'Mejorar defensa y recepción',
      'Desarrollar más variantes de ataque',
      'Preparación física para temporada competitiva'
    ]
  },
  // Evaluación más reciente para Sofía
  {
    id: 'eval5',
    studentId: 'student1',
    coachId: 'coach1',
    date: new Date('2024-02-15'),
    technical: {
      serve: 8,
      spike: 7,
      block: 6,
      dig: 8,
      set: 8
    },
    physical: {
      endurance: 8,
      strength: 7,
      agility: 8,
      jump: 7
    },
    mental: {
      focus: 9,
      teamwork: 9,
      leadership: 8,
      attitude: 10
    },
    overall: 7.8,
    notes: 'Notable mejora desde la última evaluación. El trabajo en el remate está dando resultados. Mantener el excelente espíritu de equipo.',
    goals: [
      'Continuar fortalecimiento físico',
      'Practicar bloqueo individual',
      'Prepararse para el siguiente nivel'
    ]
  }
];
export const mockChallengeParameters: ChallengeParameter[] = [
  {
    id: 'param1',
    name: 'Servicios Consecutivos',
    description: 'Número de servicios exitosos seguidos',
    category: 'technical',
    unit: 'servicios',
    targetValue: 10,
    difficultyLevels: {
      beginner: 5,
      intermediate: 10,
      advanced: 15
    }
  },
  {
    id: 'param2',
    name: 'Precisión de Remate',
    description: 'Porcentaje de remates dentro de la cancha',
    category: 'technical',
    unit: '%',
    targetValue: 70,
    difficultyLevels: {
      beginner: 50,
      intermediate: 70,
      advanced: 85
    }
  },
  {
    id: 'param3',
    name: 'Salto Vertical',
    description: 'Altura máxima de salto vertical',
    category: 'physical',
    unit: 'cm',
    targetValue: 45,
    difficultyLevels: {
      beginner: 30,
      intermediate: 45,
      advanced: 60
    }
  },
  {
    id: 'param4',
    name: 'Resistencia en Cancha',
    description: 'Minutos de juego continuo sin fatiga notable',
    category: 'physical',
    unit: 'minutos',
    targetValue: 30,
    difficultyLevels: {
      beginner: 15,
      intermediate: 30,
      advanced: 45
    }
  },
  {
    id: 'param5',
    name: 'Recepciones Perfectas',
    description: 'Número de recepciones que permiten armado directo',
    category: 'technical',
    unit: 'recepciones',
    targetValue: 15,
    difficultyLevels: {
      beginner: 8,
      intermediate: 15,
      advanced: 25
    }
  },
  {
    id: 'param6',
    name: 'Comunicación en Juego',
    description: 'Llamadas claras y efectivas durante el partido',
    category: 'mental',
    unit: 'puntos',
    targetValue: 8,
    difficultyLevels: {
      beginner: 5,
      intermediate: 8,
      advanced: 10
    }
  }
];
export const mockStudentLogs: StudentLogEntry[] = [
  {
    id: 'log1',
    studentId: 'student1',
    date: new Date('2024-02-15'),
    type: 'achievement',
    description: 'Logró 8 servicios consecutivos exitosos',
    performedBy: 'coach1'
  },
  {
    id: 'log2',
    studentId: 'student1',
    date: new Date('2024-02-14'),
    type: 'progress',
    description: 'Mejora notable en la técnica de remate',
    performedBy: 'coach1'
  },
  {
    id: 'log3',
    studentId: 'student3',
    date: new Date('2024-02-13'),
    type: 'achievement',
    description: 'Seleccionada para el equipo regional',
    performedBy: 'coach2'
  },
  {
    id: 'log4',
    studentId: 'student5',
    date: new Date('2024-02-12'),
    type: 'note',
    description: 'Necesita trabajar en la comunicación con el equipo',
    performedBy: 'coach3'
  },
  {
    id: 'log5',
    studentId: 'student2',
    date: new Date('2024-02-10'),
    type: 'progress',
    description: 'Superó su récord personal de salto vertical: 42cm',
    performedBy: 'coach1'
  },
  {
    id: 'log6',
    studentId: 'student1',
    date: new Date('2024-02-08'),
    type: 'achievement',
    description: 'Ganó el premio al mejor compañero del mes',
    performedBy: 'admin1'
  }
];

export const defaultCredentials = {
  admin: { email: 'admin@academiavoley.pe', password: 'admin123' },
  coach: { email: 'sofia.martinez@academiavoley.pe', password: 'coach123' },
  parent: { email: 'lucia.garcia@email.com', password: 'parent123' },
  student: { email: 'sofia.martinez@email.com', password: 'student123' }
};