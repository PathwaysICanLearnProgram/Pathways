-- Core Pathways learning library. Safe to re-run because slugs are unique.
insert into public.learning_modules(slug, category, title, summary, content_md, external_url, is_published)
values
('career-choice','Explore','Choosing a Career Without Rushing','Turn interests, strengths and values into career options without treating one quiz as a final answer.',
$$## Career choice is a process
There is rarely one perfect career answer at school age. Build a shortlist by looking at your interests, developing skills, values, school results and real opportunities together.

### Pathways method
1. Explore widely.
2. Compare evidence.
3. Test ideas through projects, clubs, volunteering or job exposure.
4. Discuss what you learned with your counsellor.
5. Choose the next sensible step, then review it later.

Ask yourself: What problems do I enjoy solving? Which subjects do I willingly practise? Do I prefer people, ideas, technology, business or hands-on work? What qualifications are normally required?$$, null, true),
('uni-vs-tvet','Study routes','University vs Technical College / TVET','Compare academic degrees with practical technical and vocational education.',
$$## Both are valid pathways
University often develops deeper academic and professional knowledge. Technical and vocational education is usually more occupation-focused and can lead directly into skilled work, apprenticeships or enterprise.

### University may suit you when
- Your intended profession requires a degree.
- You enjoy academic study and theory.
- You want a broad professional or research pathway.

### TVET may suit you when
- You prefer practical, applied learning.
- You want occupation-specific skills.
- You want a pathway into a trade or technical career.

Always verify accreditation, current entry requirements, costs and progression options before applying.$$,
'https://www.bqa.org.bw/registered-and-accredited-tvet', true),
('work-study','Study routes','Working and Studying at the Same Time','Weigh income and experience against workload, sleep and academic pressure.',
$$## Possible advantages
- Income and reduced financial pressure.
- Real workplace experience.
- Stronger time-management skills.
- Professional contacts and references.

## Possible challenges
- Less time for study and rest.
- Fatigue and falling behind.
- Transport and scheduling pressure.
- Work shifts conflicting with classes or examinations.

Estimate your study and rest requirements first. Then decide how many paid-work hours can realistically fit without damaging health, attendance or academic performance.$$,
null, true),
('gap-year','Life choices','Gap Year: Pros, Cons and a Purposeful Plan','Use a gap year intentionally rather than simply postponing a decision.',
$$## A gap year needs a purpose
Potential benefits include maturity, work experience, volunteering, saving money and strengthening an application. Risks include losing academic routine, delaying funding or applications and allowing unplanned time to pass.

Write three measurable outcomes for the year. Examples: complete a qualification, build a portfolio, gain work experience, save a target amount or submit applications by a set date.$$,
null, true),
('entrepreneurship','Enterprise','Entrepreneurship: Is It Right for Me?','Explore business ownership as a real pathway with responsibilities as well as opportunity.',
$$## Starting a company is a pathway, not an escape from planning
Possible benefits include independence, ownership, real-world learning and the chance to create income or employment. Challenges include uncertain income, responsibility for customers and cash flow, discipline and the need to sell and improve continuously.

### Start small
1. Identify a real problem.
2. Describe the customer clearly.
3. Test whether people value the solution.
4. Calculate costs and a realistic price.
5. Create a small pilot.
6. Measure feedback and improve.
7. Learn the legal, registration and tax requirements before expanding.$$,
null, true),
('leaving-school','Transition','Leaving School: What Do I Need to Think About?','Prepare for applications, finances, transport, routines, responsibilities and a changing identity.',
$$## Think beyond the qualification
Leaving school changes your routine, responsibilities and social environment. Plan for applications, identity documents, transport, accommodation, money, digital access, deadlines and who you can ask for help.

Make a Plan A, Plan B and Plan C. A strong alternative plan is preparation, not failure.$$,
null, true),
('interview','Work readiness','Interview Skills','Prepare examples, practise communication and learn how to answer questions with evidence.',
$$## Interview preparation
Research the organisation and role. Prepare short examples showing responsibility, teamwork, problem solving, learning and resilience.

Use the STAR structure when appropriate: Situation, Task, Action, Result. Practise aloud, arrive early, dress appropriately for the context, listen fully before answering and ask one thoughtful question at the end.$$,
null, true),
('cv','Work readiness','Writing a Strong Student CV','Build a clear first CV using school achievements, projects, skills and responsibilities.',
$$## A student CV can still show evidence
Include contact information, a short profile, education, relevant subjects, achievements, projects, volunteering, clubs, leadership, technical skills and referees where appropriate.

Use specific evidence instead of vague claims. For example, replace “good leader” with a short example of what you organised, who was involved and what happened.$$,
null, true),
('university-letter','Applications','University or College Entrance Letter','Plan a clear, specific motivation letter or personal statement.',
$$## A strong application letter connects evidence to purpose
Explain why you are applying, what has prepared you, what you have learned from relevant subjects or experiences, and why the programme fits your next step.

Avoid copying generic templates word-for-word. Your examples should be true and specific. Proofread carefully and follow the institution’s current word count and submission instructions.$$,
null, true),
('application-video','Applications','Making an Application Video','Plan, record and review a short professional application video.',
$$## Before recording
Write a short structure rather than memorising a long speech. Introduce yourself, answer the requested question, give one or two concrete examples and close confidently.

Use clear sound, good lighting and a simple background. Look at the camera, speak naturally, stay within the required time and check the institution’s current file and content requirements before submitting.$$,
null, true),
('emotional-transition','Wellbeing','The Emotional Side of Leaving School','Understand that excitement, uncertainty, grief, pressure and changing friendships can occur together.',
$$## Transition can bring mixed emotions
Leaving school can feel exciting and uncertain at the same time. Routines change, friendships may shift and decisions can suddenly feel more serious.

Helpful responses include keeping a basic routine, maintaining supportive relationships, asking questions early, breaking large decisions into smaller actions and speaking to a trusted adult or counsellor when stress is becoming difficult to manage.$$,
null, true),
('mindset','Mindset','Resilience & Mindset — Dean Graziosi Resource','An assignable external resource for mindset, confidence and constructive action.',
$$## External training resource
Pathways links to authorised external material rather than copying paid or proprietary course content. If your organisation has licensed access to Dean Graziosi’s Emergency Mindset Toolbox, replace the public resource URL with the authorised course link.

### Reflection
- Which idea was most useful?
- Where could you apply it this month?
- What is one action you will take?
- What support would help you follow through?$$,
'https://www.deangraziosi.com/category/mindset/', true)
on conflict (slug) do update set category=excluded.category,title=excluded.title,summary=excluded.summary,content_md=excluded.content_md,external_url=excluded.external_url,is_published=excluded.is_published;

insert into public.institutions(name,institution_type,country,website_url,admissions_url,notes,active)
select * from (values
('University of Botswana','University','Botswana','https://www.ub.bw/','https://www.ub.bw/study/undergraduate/how-apply-admission','Official university and undergraduate admissions information.',true),
('Botswana International University of Science & Technology (BIUST)','University','Botswana','https://www.biust.ac.bw/','https://www.biust.ac.bw/undergraduate-programmes/','Science, technology and engineering study routes.',true),
('Botswana University of Agriculture and Natural Resources (BUAN)','University','Botswana','https://www.buan.ac.bw/','https://www.buan.ac.bw/','Agriculture and natural-resource pathways.',true),
('Botho University Botswana','University','Botswana','https://botswana.bothouniversity.com/','https://botswana.bothouniversity.com/','Private tertiary programmes; verify current accreditation and entry requirements.',true),
('Botswana Accountancy College / Botswana School of Business Sciences','College','Botswana','https://www.bac.ac.bw/','https://www.bac.ac.bw/','Business, finance, accounting, computing and related pathways.',true),
('Botswana Qualifications Authority — Accredited TVET Providers','TVET directory','Botswana','https://www.bqa.org.bw/','https://www.bqa.org.bw/registered-and-accredited-tvet','Use the official BQA register to verify accredited providers.',true),
('Botswana Government — Vocational Education Training','TVET information','Botswana','https://www.gov.bw/','https://www.gov.bw/learning-and-teaching/vocational-education-training','Government information on Brigades and technical colleges.',true)
) as v(name,institution_type,country,website_url,admissions_url,notes,active)
where not exists (select 1 from public.institutions i where i.name=v.name);
