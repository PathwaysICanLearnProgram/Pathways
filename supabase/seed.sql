-- Pathways Career Portal — starter content.
--
-- Optional. Run after schema.sql on a NEW deployment so the Learning Library and
-- the Universities & TVET area are not empty. Existing rows are left untouched.

insert into public.learning_modules (slug, category, title, summary, content_md, is_published) values
('know-yourself', 'Self discovery', 'Know yourself first',
 'Work out your strengths, interests and working style before you choose a career.',
 E'## Why this comes first\nA career choice that ignores who you are rarely lasts.\n\n## What to do\n- Complete the career profile assessment in the portal\n- Write a SWOT: strengths, weaknesses, opportunities, threats\n- List five activities you lose track of time doing\n- Ask two adults who know you what they think you are good at\n\n## Turning it into a decision\nCompare your top two profile dimensions with the subjects you score best in. Where they overlap is where to look first.', true),
('subjects-to-careers', 'Subjects & careers', 'From subjects to careers',
 'How subject choice opens and closes career doors, and how to keep options open.',
 E'## The rule of thumb\nMathematics and English keep the most doors open. Science subjects are gatekeepers for health and engineering routes.\n\n## What to do\n- Record every subject mark in the portal each term\n- Check the entry requirements of three programmes you like\n- Identify the one subject that most limits your options and make a plan for it\n\n## Watch out for\nChoosing a subject because of a teacher or a friend rather than where it leads.', true),
('university-or-tvet', 'University & TVET', 'University, TVET or both',
 'Compare academic and technical routes honestly, including cost, length and job outcomes.',
 E'## Two good routes\nUniversity is not automatically better than TVET. They lead to different kinds of work.\n\n## Compare on\n- Entry requirements and closing dates\n- Length and total cost, including living costs\n- What graduates actually do afterwards\n- Whether the qualification is recognised by employers you care about\n\n## What to do\nShortlist two university programmes and two TVET programmes, then compare them side by side.', true),
('work-and-study', 'Work & study', 'Working while you study',
 'Part-time work, learnerships and funded study routes.',
 E'## Options\n- Learnerships and apprenticeships that pay while you train\n- Part-time or distance study alongside employment\n- Employer-sponsored study\n\n## What to do\n- Check the study hours a job realistically leaves you\n- Get any study support agreement in writing\n- Protect your marks: a failed year costs more than the wages earned', true),
('gap-year', 'Gap year', 'Making a gap year count',
 'A gap year is only useful if it is planned.',
 E'## A useful gap year has\n- A goal: earn money, gain experience, improve results, or test a career\n- A start and end date\n- Something an employer or admissions officer can see afterwards\n\n## What to do\nWrite the plan down before the year begins, and apply for the following year during it — not after it.', true),
('entrepreneurship', 'Entrepreneurship', 'Starting something of your own',
 'How to test a business idea without risking everything.',
 E'## Start small\nTest whether people will pay before you spend money.\n\n## What to do\n- Describe the problem you solve in one sentence\n- Find ten possible customers and talk to them\n- Sell to three of them before you register anything\n- Keep records of every pula in and out from day one', true),
('leaving-school', 'Leaving school', 'Preparing to leave school',
 'The practical steps that catch school leavers out.',
 E'## Documents to have ready\n- Certified copies of your ID and results\n- A CV and a short personal statement\n- Contact details for two referees who have agreed\n\n## Money and living\n- Draft a monthly budget including transport and food\n- Confirm accommodation before you travel\n\n## Keep a backup plan\nAlways have a second option that you would genuinely accept.', true),
('interviews-and-cv', 'CV & applications', 'CVs, applications and interviews',
 'Presenting yourself clearly and preparing for the questions that always come.',
 E'## Your CV\nOne to two pages. Achievements, not duties. No photographs of documents.\n\n## Applications\n- Answer the question that was asked\n- Meet the closing date; late is the most common reason for rejection\n\n## Interviews\nPrepare answers for: tell us about yourself, why this programme, a challenge you overcame, and a question of your own to ask them.', true)
on conflict (slug) do nothing;

insert into public.institutions (name, institution_type, country, website_url, notes) values
('University of Botswana', 'University', 'Botswana', 'https://www.ub.bw', 'Broad range of undergraduate programmes. Check faculty-specific entry requirements and closing dates.'),
('Botswana International University of Science and Technology', 'University', 'Botswana', 'https://www.biust.ac.bw', 'Science, engineering and technology focus.'),
('Botswana University of Agriculture and Natural Resources', 'University', 'Botswana', 'https://www.buan.ac.bw', 'Agriculture, natural resources and related sciences.'),
('Botswana Accountancy College', 'Private college', 'Botswana', 'https://www.bac.ac.bw', 'Accounting, finance and business programmes.'),
('Gaborone Technical College', 'TVET / Technical college', 'Botswana', 'https://www.gtc.ac.bw', 'Technical and vocational programmes and trade certificates.')
on conflict do nothing;
