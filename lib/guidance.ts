import type { Stage } from './types'

export const stageOrder = ['Upper Primary', 'Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5'] as const

export const subjectNames = [
  'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Science',
  'Computer Studies', 'Business Studies', 'Accounting', 'Economics',
  'Design & Technology', 'Art', 'Geography', 'History', 'Agriculture', 'Setswana'
]

export type DimensionKey = 'analytical' | 'creative' | 'people' | 'business' | 'practical' | 'digital'

export const dimensions: Record<DimensionKey, { label: string; description: string }> = {
  analytical: { label: 'Analytical thinker', description: 'You enjoy investigating, measuring and solving problems with evidence.' },
  creative: { label: 'Creative maker', description: 'You enjoy designing, expressing ideas and producing original work.' },
  people: { label: 'People and care', description: 'You enjoy teaching, guiding, helping and working closely with others.' },
  business: { label: 'Enterprise and leadership', description: 'You enjoy planning, organising, selling and leading projects.' },
  practical: { label: 'Hands-on and technical', description: 'You enjoy building, repairing and working with tools and equipment.' },
  digital: { label: 'Digital and technology', description: 'You enjoy computers, data, software and how technology works.' }
}

export const stagePlans: Record<Stage, { theme: string; goals: string[] }> = {
  'Upper Primary': {
    theme: 'Discover yourself and the world of work',
    goals: [
      'Notice the subjects and activities you enjoy most',
      'Talk to family and community members about the work they do',
      'Build strong reading, writing and number habits',
      'Try clubs, sport and creative activities to widen your interests'
    ]
  },
  'Form 1': {
    theme: 'Settle in and build strong study habits',
    goals: [
      'Set up a weekly study routine you can keep',
      'Record your marks each term so you can see progress',
      'Complete the career profile assessment for the first time',
      'List three careers that sound interesting and find out what they involve'
    ]
  },
  'Form 2': {
    theme: 'Explore broadly before you narrow down',
    goals: [
      'Compare your marks, enjoyment and confidence across every subject',
      'Do a first SWOT so you know your strengths and gaps',
      'Meet your counsellor to talk about possible subject combinations',
      'Explore at least one career field through reading or a visit'
    ]
  },
  'Form 3': {
    theme: 'Choose subjects with your future in mind',
    goals: [
      'Confirm the subject combination that keeps your options open',
      'Check the entry requirements of two or three programmes you like',
      'Build an action plan with dated steps for the year',
      'Start a simple record of achievements for your future CV'
    ]
  },
  'Form 4': {
    theme: 'Turn exploration into a realistic shortlist',
    goals: [
      'Shortlist institutions and programmes with their closing dates',
      'Lift the marks in the subjects your shortlist depends on',
      'Prepare draft application documents and a personal statement',
      'Plan a funding route: bursary, sponsorship, savings or work-study'
    ]
  },
  'Form 5': {
    theme: 'Apply, prepare and transition well',
    goals: [
      'Submit applications ahead of every closing date',
      'Prepare for interviews and selection tests',
      'Have a considered backup plan, including gap-year or work options',
      'Prepare practically for leaving school: budgeting, travel and accommodation'
    ]
  }
}

export const quizQuestions: Array<[string, DimensionKey]> = [
  ['I enjoy working out why something went wrong.', 'analytical'],
  ['I like experiments, research and checking facts.', 'analytical'],
  ['I am comfortable working with numbers and evidence.', 'analytical'],
  ['I enjoy drawing, writing, music or design.', 'creative'],
  ['I often think of new ways to do ordinary things.', 'creative'],
  ['I like producing work that other people can see or use.', 'creative'],
  ['I enjoy explaining things to other people.', 'people'],
  ['People come to me when they need help or advice.', 'people'],
  ['I would like a job where I care for or teach others.', 'people'],
  ['I enjoy organising events, teams or projects.', 'business'],
  ['I am interested in how businesses make and manage money.', 'business'],
  ['I am comfortable persuading people and speaking up.', 'business'],
  ['I like building, fixing or assembling things with my hands.', 'practical'],
  ['I would rather do a task than read about it.', 'practical'],
  ['I enjoy working with tools, machines or in a workshop.', 'practical'],
  ['I enjoy computers, apps and figuring out software.', 'digital'],
  ['I would like to learn coding or work with data.', 'digital'],
  ['I keep up with new technology and how it is used.', 'digital']
]

type Suggestion = { key: DimensionKey; label: string; careers: string[]; description: string; subjects: string[] }

const careerMap: Record<DimensionKey, { careers: string[]; description: string; subjects: string[] }> = {
  analytical: {
    careers: ['Engineer', 'Medical doctor', 'Laboratory scientist', 'Pharmacist', 'Statistician', 'Environmental scientist'],
    description: 'Fields that reward careful investigation, measurement and problem solving.',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology']
  },
  creative: {
    careers: ['Graphic designer', 'Architect', 'Journalist', 'Film and media producer', 'Fashion designer', 'Interior designer'],
    description: 'Fields where original ideas are turned into work other people experience.',
    subjects: ['Art', 'Design & Technology', 'English', 'Computer Studies']
  },
  people: {
    careers: ['Teacher', 'Nurse', 'Social worker', 'Counsellor', 'Human resources officer', 'Community health worker'],
    description: 'Fields built on guiding, teaching and caring for other people.',
    subjects: ['English', 'Biology', 'History', 'Setswana']
  },
  business: {
    careers: ['Accountant', 'Entrepreneur', 'Marketing manager', 'Banker', 'Supply chain officer', 'Project manager'],
    description: 'Fields that reward planning, leadership and commercial judgement.',
    subjects: ['Accounting', 'Business Studies', 'Economics', 'Mathematics']
  },
  practical: {
    careers: ['Electrician', 'Motor mechanic', 'Plumber', 'Boilermaker', 'Agricultural technician', 'Construction supervisor'],
    description: 'Skilled trades and technical routes, most often through TVET and apprenticeships.',
    subjects: ['Design & Technology', 'Physics', 'Mathematics', 'Agriculture']
  },
  digital: {
    careers: ['Software developer', 'Data analyst', 'Cyber-security officer', 'Network administrator', 'IT support specialist', 'Systems analyst'],
    description: 'Technology fields that combine logical thinking with constant learning.',
    subjects: ['Computer Studies', 'Mathematics', 'Physics', 'English']
  }
}

const subjectHints: Record<string, DimensionKey> = {
  Mathematics: 'analytical', Physics: 'analytical', Chemistry: 'analytical', Biology: 'people', Science: 'analytical',
  'Computer Studies': 'digital', 'Business Studies': 'business', Accounting: 'business', Economics: 'business',
  'Design & Technology': 'practical', Agriculture: 'practical', Art: 'creative', English: 'creative',
  History: 'people', Geography: 'analytical', Setswana: 'people'
}

export function careerSuggestions(
  scores: Record<string, number> | null,
  subjects: Array<{ name: string; score: number | null }>
): Suggestion[] {
  const weights: Record<DimensionKey, number> = { analytical: 0, creative: 0, people: 0, business: 0, practical: 0, digital: 0 }
  if (scores) {
    for (const key of Object.keys(weights) as DimensionKey[]) weights[key] += Number(scores[key] || 0)
  }
  for (const subject of subjects) {
    const key = subjectHints[subject.name]
    if (key && typeof subject.score === 'number') weights[key] += subject.score / 20
  }
  const ordered = (Object.keys(weights) as DimensionKey[]).sort((a, b) => weights[b] - weights[a])
  return ordered.map((key) => ({ key, label: dimensions[key].label, ...careerMap[key] }))
}
