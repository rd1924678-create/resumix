export const calculateAtsScore = (resume) => {
  let score = 0;
  const suggestions = [];

  // 1. Contact Info (max 15 pts)
  const info = resume.personalInfo || {};
  if (info.fullName && info.email && info.phoneNumber && info.location) {
    score += 15;
  } else {
    suggestions.push('Complete your contact information (name, email, phone, location).');
  }

  // 2. LinkedIn Presence (max 10 pts)
  if (info.linkedinUrl && info.linkedinUrl.trim() !== '') {
    score += 10;
  } else {
    suggestions.push('Add your LinkedIn profile link to improve online professional presence.');
  }

  // 3. GitHub Presence (max 10 pts)
  if (info.githubUrl && info.githubUrl.trim() !== '') {
    score += 10;
  } else {
    suggestions.push('Include your GitHub profile link to showcase your code repositories.');
  }

  // 4. Professional Summary (max 15 pts)
  const summaryText = resume.summary || '';
  if (summaryText.length >= 80 && summaryText.length <= 400) {
    score += 15;
  } else if (summaryText.length > 0) {
    score += 8;
    suggestions.push('Refine your professional summary to be between 80 to 400 characters for optimal reading.');
  } else {
    suggestions.push('Write a brief professional summary focusing on your technical goals and key skills.');
  }

  // 5. Education (max 10 pts)
  const eduList = resume.education || [];
  if (eduList.length > 0) {
    score += 10;
  } else {
    suggestions.push('Add at least one education entry.');
  }

  // 6. Technical Skills (max 15 pts)
  const skills = resume.skills || {};
  let totalSkillCount = 0;
  let filledCategories = 0;

  const categories = ['programmingLanguages', 'frontend', 'backend', 'database', 'tools', 'custom'];
  categories.forEach(cat => {
    if (skills[cat] && skills[cat].length > 0) {
      filledCategories++;
      totalSkillCount += skills[cat].length;
    }
  });

  // Points for skill categories filled
  score += Math.min(filledCategories * 2, 10); // up to 10 points
  if (totalSkillCount >= 10) {
    score += 5; // extra 5 points for healthy skill count
  } else {
    suggestions.push('List at least 10 relevant skills across different technical categories.');
  }

  // 7. Projects (max 15 pts)
  const projList = resume.projects || [];
  if (projList.length >= 3) {
    score += 15;
  } else if (projList.length > 0) {
    score += projList.length * 5; // 5 pts per project
    suggestions.push(`Add ${3 - projList.length} more projects to showcase your practical developer skills.`);
  } else {
    suggestions.push('Add at least 2 or 3 hands-on projects with technologies used and repository links.');
  }

  // 8. Experience or Internships (max 10 pts)
  const expList = resume.experience || [];
  const internList = resume.internships || [];
  if (expList.length > 0 || internList.length > 0) {
    score += 10;
  } else {
    suggestions.push('Include internship experience or self-employed developer experience if available.');
  }

  return {
    score: Math.min(score, 100),
    suggestions,
  };
};

// Developer profiles for smart suggestions
export const DEVELOPER_SUGGESTIONS = {
  mern: {
    title: 'MERN Stack Developer',
    skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux Toolkit'],
    summary: 'Motivated MERN Stack Developer with hands-on experience in building full-stack web applications using React.js, Node.js, Express.js, and MongoDB.'
  },
  java: {
    title: 'Java Developer',
    skills: ['Java', 'Spring Boot', 'Spring MVC', 'Hibernate', 'MySQL', 'REST APIs', 'Maven', 'Git', 'Data Structures & Algorithms', 'PostgreSQL'],
    summary: 'Enthusiastic Java Developer specializing in spring framework and relational databases to design, develop, and deploy secure backend systems.'
  },
  python: {
    title: 'Python Developer / Data Analyst',
    skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'NumPy', 'Pandas', 'SQL', 'Git', 'Machine Learning Basics', 'Data Visualization'],
    summary: 'Detail-oriented Python Developer focused on backend engineering and data processing with solid understanding of web routing and API endpoints.'
  },
  software_developer: {
    title: 'Software Developer (General)',
    skills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'Object-Oriented Programming', 'Software Engineering'],
    summary: 'Adaptable Computer Science Graduate with strong foundations in data structures, algorithms, and object-oriented design, seeking entry-level software developer roles.'
  },
  frontend_engineer: {
    title: 'Frontend Engineer',
    skills: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'Vue.js', 'Tailwind CSS', 'Bootstrap', 'Vite', 'Redux', 'Responsive Design'],
    summary: 'Creative Frontend Engineer specialized in developing responsive, accessible, and user-centric web applications with pixel-perfect layouts using React and Tailwind CSS.'
  },
  backend_engineer: {
    title: 'Backend Engineer',
    skills: ['Node.js', 'Express.js', 'Python', 'Django', 'SQL', 'PostgreSQL', 'RESTful APIs', 'Redis', 'Docker', 'System Design'],
    summary: 'Focused Backend Engineer with skills in designing scalable API architectures, managing database models, and building high-performance server logic.'
  },
  devops_engineer: {
    title: 'DevOps Engineer',
    skills: ['Linux', 'Bash', 'Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'GitHub Actions', 'Jenkins', 'Terraform', 'Nginx'],
    summary: 'Ambitious DevOps Engineer candidate experienced in scripting automation systems, containerizing legacy apps, and monitoring cloud networks.'
  },
  data_scientist: {
    title: 'Data Scientist',
    skills: ['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Matplotlib', 'Tableau', 'Machine Learning', 'Data Cleaning'],
    summary: 'Analytical Data Scientist Graduate skilled in cleaning complex datasets, building predictive ML models, and translating insights into business strategies.'
  },
  web_developer: {
    title: 'Web Developer (General)',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'PHP', 'WordPress', 'MySQL', 'Bootstrap', 'jQuery', 'Git', 'SEO Basics'],
    summary: 'Versatile Web Developer with a strong track record of crafting responsive websites, administering content management databases, and optimizing layout performance.'
  },
  fullstack_developer: {
    title: 'Full Stack Developer',
    skills: ['JavaScript', 'HTML5', 'CSS3', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'RESTful APIs', 'Git', 'System Design'],
    summary: 'Resourceful Full Stack Developer candidate specializing in both user-facing interface engineering and robust server architectures to deploy secure, end-to-end web platforms.'
  }
};



