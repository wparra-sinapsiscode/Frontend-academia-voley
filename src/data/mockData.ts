// Type definitions
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'coach' | 'parent' | 'student';
  profileImage?: string;
  phone?: string;
  active: boolean;
  specialization?: string[];
  experience?: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  ageRange: { min: number; max: number };
  maxStudents: number;
  currentStudents: number;
  price: number;
  monthlyFee: number;
  schedule: string[];
  coachId: string;
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
  studentName?: string;
  amount: number;
  concept?: string;
  type?: string;
  typeName?: string;
  date: string;
  datetime?: string;
  status: 'pending' | 'completed' | 'overdue' | 'paid';
  method?: 'cash' | 'card' | 'transfer';
  receiptNumber?: string;
  receiptUrl?: string;
  dueDate?: string;
  description?: string;
  approved?: boolean;
  approvedBy?: string;
  approvedDate?: string;
  category?: string;
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

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  categoryName?: string;
  date: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
  supplier?: string;
  receiptNumber?: string;
  approvedBy: string;
  recurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'annual';
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
    active: true,
    specialization: ['Técnica', 'Preparación Física'],
    experience: 8
  },
  {
    id: 'coach2',
    email: 'juan@academia.com',
    password: 'coach456',
    name: 'Juan Pérez',
    role: 'coach',
    phone: '999-222-333',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    active: true,
    specialization: ['Preparación Física', 'Táctica', 'Análisis de Video'],
    experience: 12
  },
  {
    id: 'coach3',
    email: 'carlos@academia.com',
    password: 'coach789',
    name: 'Carlos López',
    role: 'coach',
    phone: '999-333-444',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    active: true,
    specialization: ['Táctica', 'Psicología Deportiva', 'Nutrición'],
    experience: 15
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

// Pagos mock - Junio 2025
export const mockPayments: Payment[] = [
  // Pagos completados - Mensualidades Junio 2025
  // Categoría Infantil (8 estudiantes)
  {
    id: 'pay_001',
    studentId: 'student1',
    studentName: 'Sofía Martínez',
    amount: 180,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'transfer' as const,
    status: 'paid' as const,
    date: '2025-06-01',
    datetime: '2025-06-01T10:30:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-01',
    category: 'cat_infantil'
  },
  {
    id: 'pay_002',
    studentId: 'student4',
    studentName: 'Isabella López',
    amount: 180,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'cash' as const,
    status: 'paid' as const,
    date: '2025-06-02',
    datetime: '2025-06-02T14:15:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-02',
    category: 'cat_infantil'
  },
  // Más pagos infantiles...
  {
    id: 'pay_003',
    studentId: 'student7',
    studentName: 'Daniela Vargas',
    amount: 180,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'transfer' as const,
    status: 'paid' as const,
    date: '2025-06-03',
    datetime: '2025-06-03T11:20:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-03',
    category: 'cat_infantil'
  },
  
  // Categoría Pre-Juvenil (10 estudiantes)
  {
    id: 'pay_010',
    studentId: 'student2',
    studentName: 'María Rodríguez',
    amount: 200,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'transfer' as const,
    status: 'paid' as const,
    date: '2025-06-01',
    datetime: '2025-06-01T09:45:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-01',
    category: 'cat_pre-juvenil'
  },
  {
    id: 'pay_011',
    studentId: 'student5',
    studentName: 'Camila Torres',
    amount: 200,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'cash' as const,
    status: 'paid' as const,
    date: '2025-06-02',
    datetime: '2025-06-02T16:30:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-02',
    category: 'cat_pre-juvenil'
  },
  {
    id: 'pay_012',
    studentId: 'student8',
    studentName: 'Carmen Silva',
    amount: 200,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'transfer' as const,
    status: 'pending' as const,
    date: '2025-06-05',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025 - PENDIENTE',
    category: 'cat_pre-juvenil'
  },
  
  // Categoría Juvenil A (12 estudiantes)
  {
    id: 'pay_020',
    studentId: 'student3',
    studentName: 'Lucía Mendoza',
    amount: 220,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'transfer' as const,
    status: 'overdue' as const,
    date: '2025-06-10',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025 - VENCIDA',
    category: 'cat_juvenil'
  },
  {
    id: 'pay_021',
    studentId: 'student6',
    studentName: 'Andrea Ruiz',
    amount: 220,
    type: 'payment_monthly',
    typeName: 'Mensualidad',
    method: 'card' as const,
    status: 'paid' as const,
    date: '2025-06-01',
    datetime: '2025-06-01T12:00:00',
    dueDate: '2025-06-05',
    description: 'Mensualidad Junio 2025',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-01',
    category: 'cat_juvenil'
  },
  
  // Otros ingresos
  {
    id: 'pay_030',
    studentId: 'student9',
    studentName: 'Patricia Flores',
    amount: 150,
    type: 'payment_registration',
    typeName: 'Matrícula',
    method: 'transfer' as const,
    status: 'paid' as const,
    date: '2025-06-01',
    datetime: '2025-06-01T08:30:00',
    dueDate: '2025-06-01',
    description: 'Matrícula nueva estudiante',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-01',
    category: 'cat_juvenil'
  },
  {
    id: 'pay_031',
    studentId: 'student10',
    studentName: 'Diana Castro',
    amount: 85,
    type: 'payment_uniform',
    typeName: 'Uniforme',
    method: 'cash' as const,
    status: 'paid' as const,
    date: '2025-06-02',
    datetime: '2025-06-02T15:45:00',
    dueDate: '2025-06-02',
    description: 'Uniforme completo talla M',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-02',
    category: 'cat_infantil'
  },
  {
    id: 'pay_032',
    studentId: 'student1',
    studentName: 'Sofía Martínez',
    amount: 50,
    type: 'payment_tournament',
    typeName: 'Torneo',
    method: 'transfer' as const,
    status: 'paid' as const,
    date: '2025-06-03',
    datetime: '2025-06-03T10:00:00',
    dueDate: '2025-06-10',
    description: 'Inscripción Torneo Inter-Academias Junio',
    approved: true,
    approvedBy: 'admin1',
    approvedDate: '2025-06-03',
    category: 'cat_infantil'
  }
];

// Gastos mock - 2025
export const mockExpenses: Expense[] = [
  // GASTOS DE ENERO 2025
  {
    id: 'exp_jan_001',
    description: 'Alquiler de canchas - Enero 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-01-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00201',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_jan_002',
    description: 'Servicios básicos - Enero',
    amount: 420,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-01-05',
    paymentMethod: 'transfer' as const,
    supplier: 'Servicios Públicos',
    receiptNumber: 'R-2025-01-001',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  
  // GASTOS DE FEBRERO 2025
  {
    id: 'exp_feb_001',
    description: 'Alquiler de canchas - Febrero 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-02-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00210',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_feb_002',
    description: 'Servicios básicos - Febrero',
    amount: 430,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-02-05',
    paymentMethod: 'transfer' as const,
    supplier: 'Servicios Públicos',
    receiptNumber: 'R-2025-02-001',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  
  // GASTOS DE MARZO 2025
  {
    id: 'exp_mar_001',
    description: 'Alquiler de canchas - Marzo 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-03-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00220',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_mar_002',
    description: 'Compra de uniformes equipo juvenil',
    amount: 850,
    category: 'equipamiento',
    categoryName: 'Equipamiento',
    date: '2025-03-15',
    paymentMethod: 'cash' as const,
    supplier: 'Deportes Elite',
    receiptNumber: 'B003-0123',
    approvedBy: 'admin1',
    recurring: false
  },
  
  // GASTOS DE ABRIL 2025
  {
    id: 'exp_apr_001',
    description: 'Alquiler de canchas - Abril 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-04-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00225',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_apr_002',
    description: 'Mantenimiento general de instalaciones',
    amount: 600,
    category: 'mantenimiento',
    categoryName: 'Mantenimiento',
    date: '2025-04-10',
    paymentMethod: 'transfer' as const,
    supplier: 'Servicios Generales SAC',
    receiptNumber: 'F004-0089',
    approvedBy: 'admin1',
    recurring: false
  },
  
  // GASTOS DE MAYO 2025
  {
    id: 'exp_may_001',
    description: 'Alquiler de canchas - Mayo 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-05-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00230',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_may_002',
    description: 'Servicios básicos - Mayo',
    amount: 440,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-05-05',
    paymentMethod: 'transfer' as const,
    supplier: 'Servicios Públicos',
    receiptNumber: 'R-2025-05-001',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_may_003',
    description: 'Renovación de material didáctico',
    amount: 320,
    category: 'equipamiento',
    categoryName: 'Equipamiento',
    date: '2025-05-20',
    paymentMethod: 'cash' as const,
    supplier: 'Librería Deportiva',
    receiptNumber: 'B005-0234',
    approvedBy: 'admin1',
    recurring: false
  },
  
  // GASTOS DE JUNIO 2025 (originales)
  {
    id: 'exp_001',
    description: 'Alquiler de canchas - Junio 2025',
    amount: 2500,
    category: 'alquiler',
    categoryName: 'Alquiler',
    date: '2025-06-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Complejo Deportivo Lima',
    receiptNumber: 'F001-00234',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_002',
    description: 'Servicios básicos (luz, agua)',
    amount: 450,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-06-05',
    paymentMethod: 'transfer' as const,
    supplier: 'Servicios Públicos',
    receiptNumber: 'R-2025-06-001',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_003',
    description: 'Internet y WiFi',
    amount: 120,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-06-05',
    paymentMethod: 'transfer' as const,
    supplier: 'Movistar',
    receiptNumber: 'MOV-2025-06-001',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  {
    id: 'exp_004',
    description: 'Seguro deportivo grupal',
    amount: 380,
    category: 'servicios',
    categoryName: 'Servicios',
    date: '2025-06-01',
    paymentMethod: 'transfer' as const,
    supplier: 'Pacífico Seguros',
    receiptNumber: 'SEG-2025-06',
    approvedBy: 'admin1',
    recurring: true,
    frequency: 'monthly' as const
  },
  
  // Gastos Variables
  {
    id: 'exp_005',
    description: 'Compra de 12 balones oficiales',
    amount: 720,
    category: 'equipamiento',
    categoryName: 'Equipamiento',
    date: '2025-06-02',
    paymentMethod: 'cash' as const,
    supplier: 'Deportes Total',
    receiptNumber: 'B001-1234',
    approvedBy: 'admin1',
    recurring: false
  },
  {
    id: 'exp_006',
    description: 'Mantenimiento y reparación de redes',
    amount: 180,
    category: 'mantenimiento',
    categoryName: 'Mantenimiento',
    date: '2025-06-03',
    paymentMethod: 'cash' as const,
    supplier: 'Servicios Deportivos Lima',
    receiptNumber: 'B002-0045',
    approvedBy: 'admin1',
    recurring: false
  },
  {
    id: 'exp_007',
    description: 'Material de entrenamiento (conos, escaleras)',
    amount: 250,
    category: 'equipamiento',
    categoryName: 'Equipamiento',
    date: '2025-06-04',
    paymentMethod: 'transfer' as const,
    supplier: 'Sport Equipment Peru',
    receiptNumber: 'F002-0567',
    approvedBy: 'admin1',
    recurring: false
  },
  {
    id: 'exp_008',
    description: 'Transporte para torneo',
    amount: 400,
    category: 'otros',
    categoryName: 'Otros',
    date: '2025-06-15',
    paymentMethod: 'cash' as const,
    supplier: 'Transportes Seguros SAC',
    receiptNumber: 'T-2025-06-01',
    approvedBy: 'admin1',
    recurring: false
  },
  {
    id: 'exp_009',
    description: 'Pago arbitraje torneo',
    amount: 300,
    category: 'personal',
    categoryName: 'Personal',
    date: '2025-06-15',
    paymentMethod: 'cash' as const,
    supplier: 'Federación Peruana de Voleibol',
    receiptNumber: 'ARB-2025-06',
    approvedBy: 'admin1',
    recurring: false
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
export const mockTournaments: Tournament[] = [
  {
    id: 'tourn1',
    name: 'Torneo Regional de Voleibol',
    date: new Date('2024-03-15'),
    location: 'Polideportivo Municipal',
    categories: ['cat_juvenil', 'cat_competitivo'],
    registrationDeadline: new Date('2024-03-10'),
    status: 'upcoming'
  },
  {
    id: 'tourn2',
    name: 'Copa de Verano 2024',
    date: new Date('2024-03-22'),
    location: 'Centro Deportivo Norte',
    categories: ['cat_infantil', 'cat_juvenil'],
    registrationDeadline: new Date('2024-03-18'),
    status: 'upcoming'
  },
  {
    id: 'tourn3',
    name: 'Campeonato Interacademias',
    date: new Date('2024-04-05'),
    location: 'Coliseo Principal',
    categories: ['cat_competitivo'],
    registrationDeadline: new Date('2024-03-30'),
    status: 'upcoming'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: '¡Próximo Torneo Regional!',
    content: 'Se acerca el Torneo Regional de Voleibol. Las inscripciones están abiertas hasta el 10 de marzo. ¡No te lo pierdas!',
    author: 'Admin Principal',
    createdAt: new Date('2024-02-20'),
    priority: 'high',
    targetAudience: ['all'],
    pinned: true,
    expiryDate: new Date('2024-03-15')
  },
  {
    id: 'ann2',
    title: 'Horario especial próxima semana',
    content: 'Debido al mantenimiento de las canchas, los entrenamientos del lunes se trasladarán al martes en el mismo horario.',
    author: 'Sofía Martínez',
    createdAt: new Date('2024-02-25'),
    priority: 'medium',
    targetAudience: ['students', 'parents'],
    pinned: false,
    expiryDate: new Date('2024-03-04')
  },
  {
    id: 'ann3',
    title: 'Nueva equipación disponible',
    content: 'Ya está disponible la nueva equipación de la academia. Pueden realizar sus pedidos en recepción.',
    author: 'Admin Principal',
    createdAt: new Date('2024-02-18'),
    priority: 'low',
    targetAudience: ['all'],
    pinned: false
  },
  {
    id: 'ann4',
    title: 'Reunión de padres - Categoría Juvenil',
    content: 'Se convoca a todos los padres de la categoría juvenil a una reunión el próximo viernes a las 19:00h para discutir los próximos torneos.',
    author: 'Juan Pérez',
    createdAt: new Date('2024-02-24'),
    priority: 'high',
    targetAudience: ['parents'],
    pinned: true,
    expiryDate: new Date('2024-03-01')
  }
];
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

// Class Plans mock - Vacío para mostrar solo las clases creadas por el usuario
export const mockClassPlans: ClassPlan[] = [];

// Asistencias mock - Datos de ejemplo para mostrar estadísticas
export const mockAttendances: Attendance[] = [
  // Asistencias para Sofía (student1) - Categoría Infantil
  {
    id: 'att1',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-01'),
    present: true,
    notes: 'Excelente participación en clase',
    checkedBy: 'coach1'
  },
  {
    id: 'att2',
    studentId: 'student1', 
    scheduleId: 'schedule2',
    date: new Date('2024-02-05'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att3',
    studentId: 'student1',
    scheduleId: 'schedule3', 
    date: new Date('2024-02-07'),
    present: false,
    notes: 'Faltó por enfermedad',
    checkedBy: 'coach1'
  },
  {
    id: 'att4',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-08'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att5',
    studentId: 'student1',
    scheduleId: 'schedule2',
    date: new Date('2024-02-12'),
    present: true,
    notes: 'Muy buen desempeño técnico',
    checkedBy: 'coach1'
  },
  {
    id: 'att6',
    studentId: 'student1',
    scheduleId: 'schedule3',
    date: new Date('2024-02-14'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att7',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-15'),
    present: false,
    notes: 'Faltó por viaje familiar',
    checkedBy: 'coach1'
  },
  {
    id: 'att8',
    studentId: 'student1',
    scheduleId: 'schedule2',
    date: new Date('2024-02-19'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att9',
    studentId: 'student1',
    scheduleId: 'schedule3',
    date: new Date('2024-02-21'),
    present: true,
    notes: 'Lideró bien los ejercicios en equipo',
    checkedBy: 'coach1'
  },
  {
    id: 'att10',
    studentId: 'student1',
    scheduleId: 'schedule1',
    date: new Date('2024-02-22'),
    present: true,
    checkedBy: 'coach1'
  },
  
  // Asistencias para Diego (student2) - Categoría Infantil
  {
    id: 'att11',
    studentId: 'student2',
    scheduleId: 'schedule1',
    date: new Date('2024-02-01'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att12',
    studentId: 'student2',
    scheduleId: 'schedule2',
    date: new Date('2024-02-05'),
    present: false,
    notes: 'Faltó por consulta médica',
    checkedBy: 'coach1'
  },
  {
    id: 'att13',
    studentId: 'student2',
    scheduleId: 'schedule3',
    date: new Date('2024-02-07'),
    present: true,
    checkedBy: 'coach1'
  },
  {
    id: 'att14',
    studentId: 'student2',
    scheduleId: 'schedule1',
    date: new Date('2024-02-08'),
    present: true,
    notes: 'Mejoró mucho en los remates',
    checkedBy: 'coach1'
  },
  {
    id: 'att15',
    studentId: 'student2',
    scheduleId: 'schedule2',
    date: new Date('2024-02-12'),
    present: true,
    checkedBy: 'coach1'
  },

  // Asistencias para Valentina (student3) - Categoría Juvenil
  {
    id: 'att16',
    studentId: 'student3',
    scheduleId: 'schedule4',
    date: new Date('2024-02-01'),
    present: true,
    notes: 'Excelente técnica como siempre',
    checkedBy: 'coach2'
  },
  {
    id: 'att17',
    studentId: 'student3',
    scheduleId: 'schedule5',
    date: new Date('2024-02-05'),
    present: true,
    checkedBy: 'coach2'
  },
  {
    id: 'att18',
    studentId: 'student3',
    scheduleId: 'schedule6',
    date: new Date('2024-02-07'),
    present: true,
    checkedBy: 'coach2'
  },
  {
    id: 'att19',
    studentId: 'student3',
    scheduleId: 'schedule4',
    date: new Date('2024-02-08'),
    present: true,
    notes: 'Lideró al equipo brillantemente',
    checkedBy: 'coach2'
  },
  {
    id: 'att20',
    studentId: 'student3',
    scheduleId: 'schedule5',
    date: new Date('2024-02-12'),
    present: true,
    checkedBy: 'coach2'
  },

  // Asistencias para Camila (student5) - Categoría Competitivo
  {
    id: 'att21',
    studentId: 'student5',
    scheduleId: 'schedule7',
    date: new Date('2024-02-01'),
    present: true,
    notes: 'Entrenamiento intensivo completado perfectamente',
    checkedBy: 'coach3'
  },
  {
    id: 'att22',
    studentId: 'student5',
    scheduleId: 'schedule8',
    date: new Date('2024-02-03'),
    present: true,
    checkedBy: 'coach3'
  },
  {
    id: 'att23',
    studentId: 'student5',
    scheduleId: 'schedule9',
    date: new Date('2024-02-05'),
    present: false,
    notes: 'Lesión menor en el tobillo',
    checkedBy: 'coach3'
  },
  {
    id: 'att24',
    studentId: 'student5',
    scheduleId: 'schedule7',
    date: new Date('2024-02-08'),
    present: true,
    notes: 'Recuperada de la lesión, excelente sesión',
    checkedBy: 'coach3'
  },
  {
    id: 'att25',
    studentId: 'student5',
    scheduleId: 'schedule8',
    date: new Date('2024-02-10'),
    present: true,
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

// Función para agregar un nuevo estudiante
export function addNewStudent(studentData: {
  studentName: string;
  studentEmail: string;
  studentPassword: string;
  parentName: string;
  parentEmail: string;
  parentPassword: string;
  categoryId: string;
  dateOfBirth: Date;
  medicalInfo?: string;
  position?: string;
  jerseyNumber?: number;
}) {
  // Generar IDs únicos
  const studentUserId = `student${mockUsers.filter(u => u.role === 'student').length + 1}`;
  const parentUserId = `parent${mockUsers.filter(u => u.role === 'parent').length + 1}`;
  
  // Crear usuario del estudiante
  const newStudentUser: User = {
    id: studentUserId,
    email: studentData.studentEmail,
    password: studentData.studentPassword,
    name: studentData.studentName,
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1605406575497-015ab0d21b9b?w=400&h=400&fit=crop',
    active: true
  };
  
  // Crear usuario del padre
  const newParentUser: User = {
    id: parentUserId,
    email: studentData.parentEmail,
    password: studentData.parentPassword,
    name: studentData.parentName,
    role: 'parent',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    active: true
  };
  
  // Crear registro del estudiante
  const newStudent: Student = {
    id: studentUserId,
    userId: studentUserId,
    parentId: parentUserId,
    categoryId: studentData.categoryId,
    dateOfBirth: studentData.dateOfBirth,
    medicalInfo: studentData.medicalInfo || 'Sin condiciones médicas',
    enrollmentDate: new Date(),
    active: true,
    position: studentData.position,
    jerseyNumber: studentData.jerseyNumber
  };
  
  // Agregar a los arrays
  mockUsers.push(newStudentUser);
  mockUsers.push(newParentUser);
  mockStudents.push(newStudent);
  
  return { studentUser: newStudentUser, parentUser: newParentUser, student: newStudent };
}

// Función para agregar un nuevo entrenador
export function addNewCoach(coachData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  specialization: string[];
  experience: number;
  certifications: string[];
  assignedCategories: string[];
}) {
  // Generar ID único
  const coachUserId = `coach${mockUsers.filter(u => u.role === 'coach').length + 1}`;
  
  // Crear usuario del entrenador
  const newCoachUser: User = {
    id: coachUserId,
    email: coachData.email,
    password: coachData.password,
    name: coachData.name,
    role: 'coach',
    phone: coachData.phone,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    active: true
  };
  
  // Crear registro del entrenador
  const newCoach = {
    id: coachUserId,
    name: coachData.name,
    email: coachData.email,
    phone: coachData.phone,
    specialization: coachData.specialization,
    experience: coachData.experience,
    certifications: coachData.certifications,
    hireDate: new Date(),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    assignedCategories: coachData.assignedCategories
  };
  
  // Agregar a los arrays
  mockUsers.push(newCoachUser);
  mockCoaches.push(newCoach);
  
  return { coachUser: newCoachUser, coach: newCoach };
}

