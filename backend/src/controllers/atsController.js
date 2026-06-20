const { extractText } = require('unpdf');
const axios = require('axios');
const User = require('../models/User');
const Resume = require('../models/Resume');

// ─────────────────────────────────────────────────────────────
// Section detector: analyses resume text and returns a
// human-readable summary of what sections are present or missing.
// This is passed as context to the AI — no score is computed here.
// ─────────────────────────────────────────────────────────────
const analyzeSections = (text) => {
  const lines = [];

  const hasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{6,}\d)/.test(text);
  lines.push(`Contact Info: email=${hasEmail ? 'FOUND' : 'MISSING'}, phone=${hasPhone ? 'FOUND' : 'MISSING'}`);

  const hasSummary = /(summary|objective|profile|about me)/i.test(text);
  lines.push(`Professional Summary: ${hasSummary ? 'FOUND' : 'MISSING'}`);

  const hasProjects = /(projects?|portfolio|personal work|side project)/i.test(text);
  lines.push(`Projects Section: ${hasProjects ? 'FOUND' : 'MISSING — this is a major gap, deduct -10'}`);

  const hasSkills = /(skills?|technologies|tech stack|competenc)/i.test(text);
  lines.push(`Skills Section: ${hasSkills ? 'FOUND' : 'MISSING'}`);

  const hasExperience = /(experience|internship|intern\b|employment|work history)/i.test(text);
  lines.push(`Experience/Internships: ${hasExperience ? 'FOUND' : 'MISSING'}`);

  const hasEducation = /(education|university|college|bachelor|master|b\.tech|b\.e|b\.sc|b\.ca|m\.tech)/i.test(text);
  lines.push(`Education Section: ${hasEducation ? 'FOUND' : 'MISSING'}`);

  const hasDeclaration = /(declaration|i hereby declare)/i.test(text);
  if (hasDeclaration) lines.push('Declaration Section: FOUND — this is outdated, deduct -2');

  const knownTypos = ['pythhon', 'expereince', 'recieve', 'managment', 'refrence', 'adress'];
  const typoFound = knownTypos.some(typo => text.toLowerCase().includes(typo));
  if (typoFound) lines.push('Spelling Error: DETECTED — deduct -3');

  if (hasExperience) {
    const hasMetrics = /\d+\s*(%|percent|ms\b|x faster|users?|requests?|reduction|improved|latency|throughput)/i.test(text);
    lines.push(`Quantifiable Metrics in Experience: ${hasMetrics ? 'FOUND' : 'NOT FOUND — deduct -4 if bullets exist but have zero numbers'}`);
  }

  return lines.join('\n');
};



exports.scoreResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    // 1. Parse PDF from memory buffer using unpdf
    // Log file specs and first few bytes to check if it's a valid PDF
    console.log('Uploaded File Specs:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    if (req.file.buffer && req.file.buffer.length > 10) {
      console.log('Buffer magic bytes:', req.file.buffer.slice(0, 10).toString('utf8'));
    }

    const pdfData = await extractText(new Uint8Array(req.file.buffer), { mergePages: true });
    // Join the pages array if it's returned as an array, fallback to empty string
    const resumeText = Array.isArray(pdfData.text) ? pdfData.text.join('\n') : (pdfData.text || '');

    // Log for debugging
    console.log('Extracted Resume Pages:', pdfData.totalPages);
    console.log('Extracted Resume Text Length:', resumeText.length);
    console.log('Extracted Resume Text Preview:', JSON.stringify(resumeText.substring(0, 200)));

    // Clean text check (filtering out page numbers or simple whitespace)
    const cleanTextCheck = resumeText.replace(/-- \d+ of \d+ --/g, '').trim();

    if (!cleanTextCheck || cleanTextCheck.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Could not extract text from the PDF. Please make sure your PDF contains selectable text and is not a scanned image.' 
      });
    }

    // 2. Detect which sections are present/missing — used as context for AI (no score override)
    const sectionAnalysis = analyzeSections(resumeText);
    console.log('Section analysis:', sectionAnalysis);

    // Read the target sector from request body
    const sector = req.body.sector || 'IT & Software Engineering';

    // 3. Build the prompt — AI gets section context + full resume text, scores freely as an ATS expert
    const prompt = `You are a professional ATS (Applicant Tracking System) evaluator specializing in resumes for the "${sector}" field.
Note: Today's date is ${new Date().toDateString()}.

Our parser has extracted the following structural information from this resume:

--- RESUME SECTION ANALYSIS ---
${sectionAnalysis}
--- END ---

Using the above structural context AND the full resume text below, evaluate this resume as a professional ATS system would.
Score it based on your expert knowledge of what makes a strong resume in the "${sector}" field.

Rules you must follow:
- Personal emails (@gmail, @yahoo, @outlook) are completely acceptable — do NOT flag them
- If link text like 'Live Demo', 'GitHub', 'LinkedIn', 'Portfolio', or other professional links appear in the text, treat them as working hyperlinks
- If the candidate is a student with a future graduation year, that is expected and fine
- Only provide feedback on genuine, specific problems — no generic praise, no compliments
- Use single quotes (') inside string values in your JSON output

Evaluate these four categories (each 0-100):
- impact: Strength of action verbs, use of measurable results/metrics, industry depth of bullet points/responsibilities
- brevity: Clean, concise writing — no filler words or padded descriptions
- style: ATS-readability, clear section headers, professional formatting
- sections: Presence and quality of the key resume sections relevant to "${sector}" (such as contact, summary, skills, experience, projects, education)

Respond with ONLY raw JSON — no markdown, no explanation:
{
  "score": <overall score 0-100>,
  "categories": {
    "impact": <0-100>,
    "brevity": <0-100>,
    "style": <0-100>,
    "sections": <0-100>
  },
  "missingKeywords": ["<relevant industry keyword, skill, or methodology missing from this resume for the ${sector} field>", ...],
  "feedback": [
    "<specific actionable problem the candidate should fix>",
    ...
  ]
}

Resume Text:
${resumeText.substring(0, 4000)}
`;

    // 3. Call Nvidia API using user's snippet
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    // Make sure API key exists
    if (!process.env.NVIDIA_API_KEY) {
       return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured in server' });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const payload = {
      "model": "meta/llama-3.3-70b-instruct", // Using state-of-the-art 70B model for high accuracy
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 2048,
      "temperature": 0.2,
      "top_p": 0.95,
      "stream": false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const aiContent = response.data.choices[0].message.content;
    
    // Parse the JSON from the AI response
    // Remove any potential markdown block wrappers if the AI ignored the instruction
    let jsonString = aiContent;
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/```/g, '');
    }
    
    const atsResult = JSON.parse(jsonString.trim());

    res.status(200).json({
      success: true,
      data: atsResult,
      resumeText: resumeText.substring(0, 4000)
    });

  } catch (error) {
    console.error('ATS Scoring Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze resume. Please try again later.',
      error: error.message
    });
  }
};

// Helper to convert frontend resume JSON to a structured textual format
const convertResumeToText = (resume) => {
  if (!resume) return '';
  let text = '';
  
  // Personal Info
  if (resume.personalInfo) {
    const p = resume.personalInfo;
    text += `NAME: ${p.fullName || ''}\n`;
    text += `CONTACT: ${p.email || ''} | ${p.phoneNumber || ''} | ${p.location || ''}\n`;
    text += `LINKS: ${p.linkedinUrl || ''} ${p.githubUrl || ''} ${p.portfolioUrl || ''}\n\n`;
  }
  
  // Summary
  if (resume.summary) {
    text += `SUMMARY:\n${resume.summary}\n\n`;
  }
  
  // Skills
  if (resume.skills) {
    text += `TECHNICAL SKILLS:\n`;
    const s = resume.skills;
    if (s.programmingLanguages?.length > 0) text += `Programming Languages: ${s.programmingLanguages.join(', ')}\n`;
    if (s.frontend?.length > 0) text += `Frontend Technologies: ${s.frontend.join(', ')}\n`;
    if (s.backend?.length > 0) text += `Backend Technologies: ${s.backend.join(', ')}\n`;
    if (s.database?.length > 0) text += `Databases: ${s.database.join(', ')}\n`;
    if (s.tools?.length > 0) text += `Developer Tools: ${s.tools.join(', ')}\n`;
    if (s.custom?.length > 0) text += `Other Skills/Libraries: ${s.custom.join(', ')}\n`;
    text += `\n`;
  }
  
  // Experience
  if (resume.experience?.length > 0) {
    text += `WORK EXPERIENCE:\n`;
    resume.experience.forEach(exp => {
      text += `${exp.position || ''} at ${exp.company || ''} (${exp.duration || ''})\n`;
      if (Array.isArray(exp.description)) {
        exp.description.forEach(desc => {
          text += `- ${desc}\n`;
        });
      }
    });
    text += `\n`;
  }

  // Internships
  if (resume.internships?.length > 0) {
    text += `INTERNSHIPS:\n`;
    resume.internships.forEach(intern => {
      text += `${intern.role || ''} at ${intern.company || ''} (${intern.duration || ''})\n`;
      if (Array.isArray(intern.responsibilities)) {
        intern.responsibilities.forEach(resp => {
          text += `- ${resp}\n`;
        });
      }
    });
    text += `\n`;
  }
  
  // Projects
  if (resume.projects?.length > 0) {
    text += `PROJECTS:\n`;
    resume.projects.forEach(proj => {
      text += `${proj.title || ''}\n`;
      if (proj.githubLink) text += `GitHub Link: ${proj.githubLink}\n`;
      if (proj.liveDemoLink) text += `Live Demo Link: ${proj.liveDemoLink}\n`;
      if (proj.technologies?.length > 0) text += `Technologies Used: ${proj.technologies.join(', ')}\n`;
      if (Array.isArray(proj.description)) {
        proj.description.forEach(desc => {
          text += `- ${desc}\n`;
        });
      }
    });
    text += `\n`;
  }
  
  // Education
  if (resume.education?.length > 0) {
    text += `EDUCATION:\n`;
    resume.education.forEach(edu => {
      const duration = edu.isPursuing 
        ? `Expected Graduation: ${edu.expectedGraduation || 'Pursuing'}` 
        : (edu.endDate || '');
      text += `${edu.degree || ''} from ${edu.college || ''} ${edu.university ? `(${edu.university})` : ''} (${edu.startDate || ''} - ${duration})\n`;
      if (!edu.isPursuing && edu.score) text += `Academic Score: ${edu.score}\n`;
    });
    text += `\n`;
  }
  
  // Certifications
  if (resume.certifications?.length > 0) {
    text += `CERTIFICATIONS:\n`;
    resume.certifications.forEach(cert => {
      text += `- ${cert.name || ''} by ${cert.organization || ''} (${cert.date || ''})\n`;
    });
    text += `\n`;
  }
  
  // Achievements
  if (resume.achievements?.length > 0) {
    text += `ACHIEVEMENTS:\n`;
    resume.achievements.forEach(ach => {
      text += `- ${ach.title || ''}: ${ach.description || ''}\n`;
    });
    text += `\n`;
  }
  
  // Languages
  if (resume.languages?.length > 0) {
    text += `LANGUAGES:\n`;
    resume.languages.forEach(lang => {
      text += `- ${lang.language || ''} (${lang.proficiency || ''})\n`;
    });
    text += `\n`;
  }
  
  // Declaration
  if (resume.declaration) {
    text += `DECLARATION:\n${resume.declaration}\n\n`;
  }
  
  return text;
};

const checkIsStructuralQuote = (str, index) => {
  let before = '';
  for (let j = index - 1; j >= 0; j--) {
    if (!/\s/.test(str[j])) {
      before = str[j];
      break;
    }
  }
  let after = '';
  for (let j = index + 1; j < str.length; j++) {
    if (!/\s/.test(str[j])) {
      after = str[j];
      break;
    }
  }
  return (before === '{' || before === '[' || before === ',' || before === ':') ||
         (after === '}' || after === ']' || after === ',' || after === ':');
};

// Robust helper to extract and parse JSON from AI completions
const cleanAndParseJSON = (text) => {
  let cleaned = text.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  
  cleaned = cleaned.trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0].trim();
  } else {
    throw new Error('No valid JSON block found in AI response');
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Standard JSON parse failed, trying custom structural sanitization:', e.message);
    try {
      // Scanner to replace nested unescaped double quotes in JSON string values
      let chars = cleaned.split('');
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] === '"' && chars[i - 1] !== '\\') {
          if (!checkIsStructuralQuote(cleaned, i)) {
            chars[i] = "'";
          }
        }
      }
      const sanitized = chars.join('');
      return JSON.parse(sanitized);
    } catch (innerError) {
      throw new Error('Failed to parse extracted JSON block: ' + innerError.message + '. Original error: ' + e.message);
    }
  }
};

// @desc    Live ATS score evaluation of form data (Resume Builder page)
// @route   POST /api/ats/score-builder
// @access  Private
exports.scoreBuilderResume = async (req, res, next) => {
  try {
    const { resume } = req.body;
    if (!resume) {
      return res.status(400).json({ success: false, message: 'Resume object is required' });
    }

    const resumeText = convertResumeToText(resume);

    // 1. Prepare prompt
    const prompt = `You are an expert Corporate Applicant Tracking System (ATS) auditor. Analyze the following resume text.
Note: Today's date is ${new Date().toDateString()}. Use this as reference when checking dates.

Evaluate the resume objectively using standard corporate ATS heuristics:
- **Score (0-100)**: Calculate an accurate, fair score based on these strict guidelines:
  1. BASELINE SCORE: If all standard sections (contact info, summary, experience/internships, projects, skills, education) are complete and filled, the resume should have a baseline score of at least 80.
  2. DEDUCTIONS: Only deduct points for clear issues:
     - Missing key contact details (no email or no phone): -5 points
     - Summary is completely generic, empty, or missing: -5 points
     - Experience descriptions have no technical details or action verbs: -5 to -10 points
     - Missing standard section (e.g. no skills list or no projects): -10 points
     - Outdated sections (like having a 'Declaration' section): -3 points
  3. If there are no major issues and the resume is professional, the score should range between 85 and 98. Do not give unnecessarily low scores for complete, high-quality resumes.
- **Categories (0-100)**: 
  - *impact*: Use of metrics, action verbs, and business/technical achievements.
  - *brevity*: Concise and focused layout without wordy/fluffy descriptions.
  - *style*: Standard ATS single-column parseable layout.
  - *sections*: Section coverage and standard headers.
- **Missing Keywords**: Standard industry terms, libraries, or methodologies relevant to the candidate's field that are missing from their skills or descriptions.
- **Feedback**: Section-wise actionable feedback points.
  *CRITICAL RULES FOR FEEDBACK*:
  1. ONLY INCLUDE CRITIQUES/CORRECTIONS: The feedback list must contain ONLY constructive criticism of things the candidate needs to fix. Do NOT include positive comments, compliments, or general praise in the feedback. If a section is good and has no issues, leave its feedback array completely empty.
  2. NO FALSE WARNINGS ABOUT LINKS: If text anchors like 'Live Demo', 'GitHub', or 'LinkedIn' exist in the resume, DO NOT warn about unclickable links. Assume they are fully clickable hyperlinks.
  3. NO FALSE WARNINGS ABOUT OTHER FIELDS: If a field (e.g. email, phone, location, LinkedIn, GitHub) is already present, DO NOT suggest adding it. Standard personal email domains (@gmail.com, @yahoo.com, @outlook.com) are 100% acceptable.
  4. OPTIONAL KEYWORDS: Do not deduct points or add warnings for optional testing frameworks (like Jest or Cypress). Only put them in "missingKeywords".
  5. GRADUATION STATUS: If the candidate is a student graduating in the future (e.g. 2027), do not warn about it.
  6. Quoting strings: Use single quotes (') for quotes inside string values. Never use unescaped double quotes inside strings.

Provide a JSON response with exactly the following structure (no markdown formatting, just raw JSON):
{
  "score": <overall ATS match score from 0 to 100>,
  "categories": {
    "impact": <score 0-100>,
    "brevity": <score 0-100>,
    "style": <score 0-100>,
    "sections": <score 0-100>
  },
  "missingKeywords": ["<keyword1>", "<keyword2>", ...],
  "feedback": {
    "personal": ["<actionable feedback on contacts, location, linkedin/github links or empty if optimized>"],
    "summary": ["<actionable feedback on professional summary or empty if optimized>"],
    "skills": ["<actionable feedback on skills list, structure, categories, or empty if optimized>"],
    "education": ["<actionable feedback on academic entries, scores, or empty if optimized>"],
    "experience": ["<actionable feedback on work experiences, metrics, bullet points, or empty if optimized>"],
    "projects": ["<actionable feedback on projects, tech stacks, code links, or empty if optimized>"],
    "additional": ["<actionable feedback on certifications, awards, languages, declaration, or empty if optimized>"]
  }
}

Resume Text:
${resumeText.substring(0, 4000)}
`;

    // 2. Call Nvidia NIM API
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    if (!process.env.NVIDIA_API_KEY) {
       return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured in server' });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const payload = {
      "model": "meta/llama-3.3-70b-instruct",
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 2048,
      "temperature": 0.2,
      "top_p": 0.95,
      "stream": false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const aiContent = response.data.choices[0].message.content;
    const atsResult = cleanAndParseJSON(aiContent);

    res.status(200).json({
      success: true,
      data: atsResult
    });

  } catch (error) {
    console.error('Builder ATS Scoring Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to analyze builder resume. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Generate optimized summary & skills for any custom role using AI
// @route   POST /api/ats/preset
// @access  Private
exports.generateRolePreset = async (req, res, next) => {
  try {
    const { role, customDetails } = req.body;
    if (!role || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role title is required' });
    }

    let prompt = `You are an expert technical resume writer. Generate highly optimized, ATS-compliant resume content for a candidate seeking a job as a: "${role}".`;
    
    if (customDetails && customDetails.trim()) {
      prompt += `\nIntegrate the following candidate custom details/context: "${customDetails}". Ensure the generated summary reflects this information.`;
    }
    
    prompt += `\nProvide a JSON response with exactly the following structure (do not include any markdown formatting like \`\`\`json, just return the raw JSON object). Keep the summary concise (max 300 characters) and include 3-5 highly relevant, modern industry-standard skills for each category.
The generated summary MUST be technically rich, outline concrete engineering projects or specialization areas, use strong action verbs, and completely avoid generic buzzwords (like 'innovative', 'dynamic', 'motivated', 'detail-oriented' unless backed by context) so that it satisfies advanced ATS scorer criteria perfectly:
{
  "summary": "<a tailored, impact-focused, highly technical professional summary for this role>",
  "skills": {
    "programmingLanguages": ["<language1>", "<language2>", ...],
    "frontend": ["<frontendSkill1>", "<frontendSkill2>", ...],
    "backend": ["<backendSkill1>", "<backendSkill2>", ...],
    "database": ["<database1>", "<database2>", ...],
    "tools": ["<tool1>", "<tool2>", ...],
    "custom": ["<otherSkill1>", "<otherSkill2>", ...]
  }
}
`;

    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    if (!process.env.NVIDIA_API_KEY) {
       return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured in server' });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const payload = {
      "model": "meta/llama-3.3-70b-instruct",
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 2048,
      "temperature": 0.5,
      "top_p": 0.95,
      "stream": false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const aiContent = response.data.choices[0].message.content;
    const presetResult = cleanAndParseJSON(aiContent);

    res.status(200).json({
      success: true,
      data: presetResult
    });

  } catch (error) {
    console.error('Role Preset Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate role preset. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Generate structured technical skills categories using AI
// @route   POST /api/ats/generate-skills
// @access  Private
exports.generateSkills = async (req, res, next) => {
  try {
    const { context, currentSkills } = req.body;
    if (!context || !context.trim()) {
      return res.status(400).json({ success: false, message: 'Skills focus context is required' });
    }

    let prompt = `You are an expert technical recruiter. Based on the following user input/prompt and their current skills, generate a highly structured technical skills matrix.`;

    if (currentSkills) {
      const s = currentSkills;
      prompt += `\nExisting skills of the candidate:
- Programming Languages: ${Array.isArray(s.programmingLanguages) ? s.programmingLanguages.join(', ') : ''}
- Frontend Technologies: ${Array.isArray(s.frontend) ? s.frontend.join(', ') : ''}
- Backend Technologies: ${Array.isArray(s.backend) ? s.backend.join(', ') : ''}
- Databases: ${Array.isArray(s.database) ? s.database.join(', ') : ''}
- Developer Tools: ${Array.isArray(s.tools) ? s.tools.join(', ') : ''}
- Other / Libraries: ${Array.isArray(s.custom) ? s.custom.join(', ') : ''}`;
    }

    prompt += `\nUser Prompt/Focus: "${context}"

Provide a JSON response with exactly the following structure (do not include any markdown formatting like \`\`\`json, just return the raw JSON object). For each category, include 3-5 highly relevant, modern industry-standard skills/keywords, incorporating and extending the user's existing skills where appropriate based on their prompt:
{
  "programmingLanguages": ["<language1>", "<language2>", ...],
  "frontend": ["<frontendSkill1>", "<frontendSkill2>", ...],
  "backend": ["<backendSkill1>", "<backendSkill2>", ...],
  "database": ["<database1>", "<database2>", ...],
  "tools": ["<tool1>", "<tool2>", ...],
  "custom": ["<otherSkill1>", "<otherSkill2>", ...]
}
`;

    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    if (!process.env.NVIDIA_API_KEY) {
       return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured in server' });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const payload = {
      "model": "meta/llama-3.3-70b-instruct",
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 2048,
      "temperature": 0.5,
      "top_p": 0.95,
      "stream": false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const aiContent = response.data.choices[0].message.content;
    const skillsResult = cleanAndParseJSON(aiContent);

    res.status(200).json({
      success: true,
      data: skillsResult
    });

  } catch (error) {
    console.error('Skills Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate technical skills. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Generate high-impact resume experience bullet points using AI
// @route   POST /api/ats/generate-bullets
// @access  Private
exports.generateExperienceBullets = async (req, res, next) => {
  try {
    const { role, company, context, type, title, technologies } = req.body;
    if (!context || !context.trim()) {
      return res.status(400).json({ success: false, message: 'Context/description is required' });
    }

    let prompt = '';
    if (type === 'project') {
      prompt = `You are a professional technical resume writer. Refine the following description of a candidate's project into 3-4 high-impact, ATS-compliant resume bullet points.
Each bullet point MUST start with a strong action verb (e.g. "Designed", "Implemented", "Developed", "Optimized", "Integrated") and, where possible, mention engineering achievements or mock performance metrics (e.g., "improving query response by 30%").
Keep them professional and concise.

Project details:
- Project Title: ${title || role || 'Project'}
- Technologies Used: ${technologies || company || ''}
- Candidate Description of what they did: "${context}"

Provide a JSON response with exactly the following structure (do not include any markdown formatting like \`\`\`json, just return the raw JSON object):
{
  "bullets": [
    "<professional bullet point 1>",
    "<professional bullet point 2>",
    ...
  ]
}
`;
    } else {
      prompt = `You are a professional resume writer specializing in tech. Refine the following description of activities done during an internship or job into 3-4 high-impact, ATS-optimized, metrics-oriented resume bullet points.
Each bullet point MUST start with a strong action verb (like "Developed", "Optimized", "Architected", "Spearheaded") and, where possible, mention engineering achievements or standard mock metrics (like "improving performance by 25%" or "reducing API latency by 15%").
Keep them professional and concise.

Job details:
- Role/Designation: ${role || 'Software Engineer'}
- Company: ${company || 'MobiXpress'}
- Candidate Description of what they did: "${context}"

Provide a JSON response with exactly the following structure (do not include any markdown formatting like \`\`\`json, just return the raw JSON object):
{
  "bullets": [
    "<professional bullet point 1>",
    "<professional bullet point 2>",
    ...
  ]
}
`;
    }

    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    if (!process.env.NVIDIA_API_KEY) {
       return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured in server' });
    }

    const headers = {
      "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Accept": "application/json"
    };

    const payload = {
      "model": "meta/llama-3.3-70b-instruct",
      "messages": [{"role":"user","content": prompt}],
      "max_tokens": 2048,
      "temperature": 0.5,
      "top_p": 0.95,
      "stream": false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const aiContent = response.data.choices[0].message.content;
    const bulletsResult = cleanAndParseJSON(aiContent);

    res.status(200).json({
      success: true,
      data: bulletsResult
    });

  } catch (error) {
    console.error('Experience Bullets Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate bullet points. Please try again later.',
      error: error.message
    });
  }
};

// @desc    Chat with AI about resume (context-aware Q&A)
// @route   POST /api/ats/chat
// @access  Private
exports.chatWithResume = async (req, res, next) => {
  try {
    const { resumeText, messages, sector } = req.body;
    const targetSector = sector || 'IT & Software Engineering';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages array is required' });
    }

    if (!process.env.NVIDIA_API_KEY) {
      return res.status(500).json({ success: false, message: 'NVIDIA_API_KEY is not configured' });
    }

    const systemPrompt = resumeText
      ? `You are an expert resume advisor and ATS (Applicant Tracking System) specialist specializing in the "${targetSector}" industry. The user has uploaded their resume. Here is the full resume text:\n\n--- RESUME ---\n${resumeText.substring(0, 3500)}\n--- END RESUME ---\n\nAnswer the user's questions about their resume honestly, specifically, and tailored to the "${targetSector}" industry standards. Give actionable advice. Refer to actual resume content when relevant.`
      : `You are an expert resume advisor and ATS specialist specializing in the "${targetSector}" industry. The user has not uploaded a resume yet. Answer their general resume questions and encourage them to upload their resume for personalized advice.`;

    const invokeUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const headers = {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Accept': 'application/json',
    };

    const payload = {
      model: 'meta/llama-3.3-70b-instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.5,
      top_p: 0.95,
      stream: false,
    };

    const response = await axios.post(invokeUrl, payload, { headers });
    const reply = response.data.choices[0].message.content;

    res.status(200).json({ success: true, data: { reply } });

  } catch (error) {
    console.error('Resume Chat Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response. Please try again.',
      error: error.message,
    });
  }
};

exports.getPublicStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResumes = await Resume.countDocuments();
    
    // Average ATS score calculation from database
    const scoreResult = await Resume.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$atsScore" } } }
    ]);
    const passRatePercent = scoreResult.length > 0 ? Math.round(scoreResult[0].avgScore) : 0;

    res.status(200).json({
      success: true,
      data: {
        developersHelped: totalUsers,
        resumesCreated: totalResumes,
        atsPassRate: `${passRatePercent}%`,
        avgBuildTime: "< 5m",
        userRating: "4.9/5"
      }
    });
  } catch (error) {
    next(error);
  }
};
