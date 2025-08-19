export interface DemoQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  tags: string[]
}

export interface DemoPerformance {
  subject: string
  score: number
  questionsAnswered: number
  accuracy: number
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
  topics: {
    name: string
    score: number
    questions: number
  }[]
}

export const demoQuestions: DemoQuestion[] = [
  {
    id: '1',
    question: 'What is the derivative of f(x) = x³ + 2x² - 5x + 3?',
    options: [
      '3x² + 4x - 5',
      '3x² + 4x + 5',
      'x² + 2x - 5',
      '3x² + 2x - 5'
    ],
    correctAnswer: 0,
    explanation: 'Using the power rule: d/dx(x³) = 3x², d/dx(2x²) = 4x, d/dx(-5x) = -5, d/dx(3) = 0. Therefore, f\'(x) = 3x² + 4x - 5.',
    subject: 'Mathematics',
    difficulty: 'medium',
    topic: 'Calculus',
    tags: ['derivatives', 'power rule', 'polynomials']
  },
  {
    id: '2',
    question: 'Which of the following is a vector quantity?',
    options: [
      'Mass',
      'Temperature',
      'Force',
      'Time'
    ],
    correctAnswer: 2,
    explanation: 'Force is a vector quantity because it has both magnitude and direction. Mass, temperature, and time are scalar quantities that only have magnitude.',
    subject: 'Physics',
    difficulty: 'easy',
    topic: 'Vectors and Scalars',
    tags: ['vectors', 'force', 'scalars']
  },
  {
    id: '3',
    question: 'What is the chemical formula for sulfuric acid?',
    options: [
      'H₂SO₄',
      'HCl',
      'HNO₃',
      'H₃PO₄'
    ],
    correctAnswer: 0,
    explanation: 'Sulfuric acid has the chemical formula H₂SO₄, containing two hydrogen atoms, one sulfur atom, and four oxygen atoms.',
    subject: 'Chemistry',
    difficulty: 'medium',
    topic: 'Acids and Bases',
    tags: ['acids', 'sulfuric acid', 'chemical formulas']
  },
  {
    id: '4',
    question: 'Which organelle is responsible for cellular respiration?',
    options: [
      'Nucleus',
      'Mitochondria',
      'Endoplasmic reticulum',
      'Golgi apparatus'
    ],
    correctAnswer: 1,
    explanation: 'Mitochondria are known as the "powerhouses of the cell" and are responsible for cellular respiration, producing ATP through the process of oxidative phosphorylation.',
    subject: 'Biology',
    difficulty: 'easy',
    topic: 'Cell Biology',
    tags: ['mitochondria', 'cellular respiration', 'ATP']
  },
  {
    id: '5',
    question: 'What is the value of ∫(2x + 3)dx?',
    options: [
      'x² + 3x + C',
      'x² + 3x',
      '2x² + 3x + C',
      'x² + 3'
    ],
    correctAnswer: 0,
    explanation: '∫(2x + 3)dx = ∫2x dx + ∫3 dx = x² + 3x + C, where C is the constant of integration.',
    subject: 'Mathematics',
    difficulty: 'medium',
    topic: 'Integration',
    tags: ['integration', 'antiderivatives', 'calculus']
  },
  {
    id: '6',
    question: 'According to Newton\'s Second Law, what is the relationship between force, mass, and acceleration?',
    options: [
      'F = ma',
      'F = m/a',
      'F = a/m',
      'F = m + a'
    ],
    correctAnswer: 0,
    explanation: 'Newton\'s Second Law states that F = ma, where F is force, m is mass, and a is acceleration. This means force equals mass times acceleration.',
    subject: 'Physics',
    difficulty: 'easy',
    topic: 'Newton\'s Laws',
    tags: ['newton\'s laws', 'force', 'acceleration']
  },
  {
    id: '7',
    question: 'What type of reaction is: 2H₂ + O₂ → 2H₂O?',
    options: [
      'Decomposition',
      'Synthesis',
      'Single replacement',
      'Double replacement'
    ],
    correctAnswer: 1,
    explanation: 'This is a synthesis reaction where two or more simple substances combine to form a more complex substance. Hydrogen and oxygen combine to form water.',
    subject: 'Chemistry',
    difficulty: 'medium',
    topic: 'Chemical Reactions',
    tags: ['synthesis', 'combustion', 'water formation']
  },
  {
    id: '8',
    question: 'What is the function of the ribosomes in a cell?',
    options: [
      'Energy production',
      'Protein synthesis',
      'DNA replication',
      'Waste removal'
    ],
    correctAnswer: 1,
    explanation: 'Ribosomes are the sites of protein synthesis in cells. They read mRNA and assemble amino acids into polypeptide chains according to the genetic code.',
    subject: 'Biology',
    difficulty: 'easy',
    topic: 'Cell Biology',
    tags: ['ribosomes', 'protein synthesis', 'mRNA']
  }
]

export const demoPerformance: DemoPerformance[] = [
  {
    subject: 'Mathematics',
    score: 89,
    questionsAnswered: 245,
    accuracy: 82,
    trend: 'up',
    lastUpdated: '2024-01-15',
    topics: [
      { name: 'Calculus', score: 92, questions: 89 },
      { name: 'Algebra', score: 87, questions: 76 },
      { name: 'Geometry', score: 85, questions: 80 }
    ]
  },
  {
    subject: 'Physics',
    score: 91,
    questionsAnswered: 189,
    accuracy: 88,
    trend: 'up',
    lastUpdated: '2024-01-14',
    topics: [
      { name: 'Mechanics', score: 94, questions: 67 },
      { name: 'Thermodynamics', score: 89, questions: 45 },
      { name: 'Electromagnetism', score: 88, questions: 77 }
    ]
  },
  {
    subject: 'Chemistry',
    score: 94,
    questionsAnswered: 156,
    accuracy: 91,
    trend: 'up',
    lastUpdated: '2024-01-13',
    topics: [
      { name: 'Organic Chemistry', score: 96, questions: 58 },
      { name: 'Inorganic Chemistry', score: 92, questions: 49 },
      { name: 'Physical Chemistry', score: 93, questions: 49 }
    ]
  },
  {
    subject: 'Biology',
    score: 87,
    questionsAnswered: 203,
    accuracy: 79,
    trend: 'stable',
    lastUpdated: '2024-01-12',
    topics: [
      { name: 'Cell Biology', score: 90, questions: 72 },
      { name: 'Genetics', score: 85, questions: 68 },
      { name: 'Ecology', score: 86, questions: 63 }
    ]
  }
]

export const demoWeeklyProgress = [
  { week: 'Week 1', score: 75, questions: 45, subjects: ['Mathematics', 'Physics'] },
  { week: 'Week 2', score: 78, questions: 52, subjects: ['Mathematics', 'Chemistry'] },
  { week: 'Week 3', score: 82, questions: 48, subjects: ['Physics', 'Biology'] },
  { week: 'Week 4', score: 85, questions: 55, subjects: ['Mathematics', 'Chemistry'] },
  { week: 'Week 5', score: 87, questions: 61, subjects: ['Physics', 'Biology'] },
  { week: 'Week 6', score: 89, questions: 58, subjects: ['Mathematics', 'Physics'] },
  { week: 'Week 7', score: 91, questions: 63, subjects: ['Chemistry', 'Biology'] }
]

export const demoStudyMaterials = [
  {
    id: '1',
    name: 'Calculus Notes.pdf',
    type: 'PDF',
    size: '2.4 MB',
    subject: 'Mathematics',
    uploadedAt: '2024-01-10',
    tags: ['calculus', 'notes', 'derivatives']
  },
  {
    id: '2',
    name: 'Physics Formula Sheet.docx',
    type: 'Word',
    size: '1.8 MB',
    subject: 'Physics',
    uploadedAt: '2024-01-08',
    tags: ['formulas', 'mechanics', 'thermodynamics']
  },
  {
    id: '3',
    name: 'Chemistry Lab Report.pdf',
    type: 'PDF',
    size: '3.2 MB',
    subject: 'Chemistry',
    uploadedAt: '2024-01-05',
    tags: ['lab report', 'experiments', 'reactions']
  },
  {
    id: '4',
    name: 'Biology Study Guide.pptx',
    type: 'PowerPoint',
    size: '5.1 MB',
    subject: 'Biology',
    uploadedAt: '2024-01-03',
    tags: ['study guide', 'cell biology', 'genetics']
  }
]

export const demoNotifications = [
  {
    id: '1',
    type: 'reminder',
    title: 'Daily Study Goal',
    message: 'You have 15 questions remaining to reach your daily goal of 25 questions.',
    timestamp: '2 hours ago',
    read: false
  },
  {
    id: '2',
    type: 'achievement',
    title: 'New Badge Unlocked!',
    message: 'Congratulations! You\'ve earned the "Streak Master" badge for studying 12 days in a row.',
    timestamp: '1 day ago',
    read: false
  },
  {
    id: '3',
    type: 'progress',
    title: 'Subject Milestone',
    message: 'You\'ve answered 100 questions in Chemistry! Keep up the great work.',
    timestamp: '3 days ago',
    read: true
  }
]
