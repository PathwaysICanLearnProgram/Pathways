import type { Stage } from './types'

export const stageOrder: Stage[] = ['Upper Primary','Form 1','Form 2','Form 3','Form 4','Form 5']

export const stagePlans: Record<Stage, { theme: string; goals: string[] }> = {
  'Upper Primary': { theme: 'Discover who I am', goals: ['Notice favourite subjects and activities','Build reading, communication and digital confidence','Explore many kinds of work without choosing too early','Start a strengths and interests journal'] },
  'Form 1': { theme: 'Explore widely', goals: ['Connect school subjects to real jobs','Practise organisation and independent learning','Join clubs, sport, service or creative activities','Discuss early interests with a counsellor'] },
  'Form 2': { theme: 'Understand my options', goals: ['Compare career clusters','Identify subjects that keep useful pathways open','Complete the Pathways Profile and SWOT','Research university, TVET and entrepreneurship routes'] },
  'Form 3': { theme: 'Choose with evidence', goals: ['Review subject choices with results and interests','Shortlist 3–5 career families','Learn about entry requirements','Seek job-shadowing, volunteering or project experience'] },
  'Form 4': { theme: 'Prepare for transition', goals: ['Strengthen grades in pathway subjects','Draft a CV and personal statement','Research institutions, costs and funding','Practise interview and communication skills'] },
  'Form 5': { theme: 'Launch my next step', goals: ['Submit applications and track deadlines','Prepare for interviews and entrance letters','Make a Plan A, Plan B and Plan C','Prepare emotionally and practically for life after school'] }
}

export const dimensions = {
  analytical: { label:'Analytical', description:'Solving problems, working with evidence, numbers and systems.', careers:['Engineer','Data Analyst','Accountant','Economist','Actuary','Research Scientist'], subjects:['Mathematics','Physics','Chemistry','Accounting','Computer Studies'] },
  creative: { label:'Creative', description:'Creating ideas, stories, designs and new ways to communicate.', careers:['Designer','Architect','Writer','Content Producer','UX Designer','Media Specialist'], subjects:['Art','Design & Technology','English','Computer Studies','History'] },
  people: { label:'People & Service', description:'Helping, teaching, listening, leading and working with people.', careers:['Teacher','Counsellor','Nurse','Doctor','Social Worker','Human Resources Specialist'], subjects:['English','Biology','History','Setswana','Business Studies'] },
  business: { label:'Business & Enterprise', description:'Organising resources, leading projects, selling and building value.', careers:['Entrepreneur','Marketing Specialist','Banker','Manager','Financial Adviser','Procurement Specialist'], subjects:['Business Studies','Accounting','Mathematics','English','Computer Studies'] },
  practical: { label:'Practical & Technical', description:'Building, repairing, operating, making and learning through hands-on work.', careers:['Electrician','Technician','Surveyor','Mechanic','Construction Manager','Agriculture Specialist'], subjects:['Design & Technology','Physics','Agriculture','Mathematics','Geography'] },
  digital: { label:'Digital & Technology', description:'Using technology to create, automate, connect and solve problems.', careers:['Software Developer','Cybersecurity Analyst','Network Engineer','Data Scientist','IT Support Specialist','Digital Product Manager'], subjects:['Computer Studies','Mathematics','Physics','Design & Technology','Business Studies'] }
} as const

export type DimensionKey = keyof typeof dimensions

export const quizQuestions: Array<[string, DimensionKey]> = [
  ['I enjoy solving puzzles or finding why something works.','analytical'],['I like working with numbers, patterns or evidence.','analytical'],['I enjoy comparing information before making a decision.','analytical'],
  ['I enjoy drawing, writing, designing or imagining new ideas.','creative'],['I like making presentations, stories, videos or visual projects.','creative'],['I often think of different ways to solve or present something.','creative'],
  ['I feel energised when I can help or support someone.','people'],['I enjoy explaining ideas or teaching others.','people'],['I care about how people feel and how groups work together.','people'],
  ['I enjoy planning, organising or taking responsibility for a project.','business'],['I am interested in how organisations make money or serve customers.','business'],['I like persuading, presenting, negotiating or leading.','business'],
  ['I prefer learning by doing, building, fixing or practising.','practical'],['I enjoy tools, machinery, experiments, making or outdoor tasks.','practical'],['I like seeing a physical result from the work I do.','practical'],
  ['I enjoy computers, apps, digital tools or learning how technology works.','digital'],['I would enjoy creating something using technology.','digital'],['I am curious about AI, coding, networks, data or digital systems.','digital']
]

export const subjectNames = ['English','Mathematics','Physics','Chemistry','Biology','Science','Computer Studies','Business Studies','Accounting','Economics','Design & Technology','Art','Geography','History','Agriculture','Setswana']

export function careerSuggestions(scores: Record<string, number> | null, subjects: Array<{name:string;score:number|null}>) {
  const ranked = Object.entries(scores || {}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k as DimensionKey)
  const strong = subjects.filter(s => (s.score ?? 0) >= 65).map(s=>s.name)
  const keys: DimensionKey[] = ranked.length ? ranked : (Object.keys(dimensions) as DimensionKey[])
  return keys.map(key => ({ key, ...dimensions[key], subjectMatch: dimensions[key].subjects.filter(s=>strong.includes(s)).length })).sort((a,b)=>b.subjectMatch-a.subjectMatch)
}
