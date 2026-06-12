import React from 'react';

// Format bullet points cleanly
const RenderBullets = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-800">
      {items.map((bullet, idx) => (
        <li key={idx} className="leading-relaxed">
          {bullet}
        </li>
      ))}
    </ul>
  );
};

// Format technologies badge text
const RenderTechBadge = ({ techList }) => {
  if (!techList || techList.length === 0) return null;
  return (
    <span className="text-xs font-semibold text-slate-700 italic block mt-0.5">
      Technologies: {techList.join(', ')}
    </span>
  );
};

// Helper for dynamic font family styles
const getFontFamilyStyle = (fontFamily) => {
  switch (fontFamily) {
    case 'times':
      return { fontFamily: '"Times New Roman", Times, serif' };
    case 'arial':
      return { fontFamily: 'Arial, Helvetica, sans-serif' };
    case 'georgia':
      return { fontFamily: 'Georgia, serif' };
    case 'garamond':
      return { fontFamily: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' };
    case 'courier':
      return { fontFamily: '"Courier New", Courier, monospace' };
    case 'helvetica':
      return { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' };
    case 'calibri':
      return { fontFamily: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' };
    case 'serif':
      return { fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' };
    case 'mono':
      return { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' };
    case 'sans':
    default:
      return { fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' };
  }
};

// Helper for dynamic font size styles
const getFontSizeStyle = (fontSize) => {
  switch (fontSize) {
    case '9':
      return { fontSize: '9pt' };
    case '10':
      return { fontSize: '10pt' };
    case '11':
      return { fontSize: '11pt' };
    case '12':
      return { fontSize: '12pt' };
    case '13':
      return { fontSize: '13pt' };
    case '14':
      return { fontSize: '14pt' };
    case '15':
      return { fontSize: '15pt' };
    case '16':
      return { fontSize: '16pt' };
    // legacy support
    case 'small':
      return { fontSize: '10pt' };
    case 'large':
      return { fontSize: '12pt' };
    case 'medium':
    default:
      return { fontSize: '11pt' };
  }
};

const defaultSectionOrder = [
  'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'languages', 'declaration'
];

// -------------------------------------------------------------
// TEMPLATE 1: CLASSIC PROFESSIONAL
// Center aligned name, horizontal dividers
// -------------------------------------------------------------
export const ClassicProfessional = ({ data }) => {
  const { 
    personalInfo = {}, summary, education = [], skills = {}, 
    projects = [], internships = [], experience = [], certifications = [], 
    languages = [], achievements = [], declaration, sectionOrder, fontSize = 'medium', fontFamily = 'sans', themeColor = '#1e293b' 
  } = data;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const sizeStyle = getFontSizeStyle(fontSize);

  const sectionMap = {
    summary: summary && (
      <div className="mt-4" key="summary">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Professional Summary
        </h2>
        <p className="text-slate-800 mt-1.5 leading-relaxed">{summary}</p>
      </div>
    ),
    skills: (skills.programmingLanguages?.length > 0 || skills.frontend?.length > 0 || skills.backend?.length > 0 || skills.database?.length > 0 || skills.tools?.length > 0 || skills.custom?.length > 0) && (
      <div className="mt-4" key="skills">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Technical Skills
        </h2>
        <div className="mt-1.5 space-y-1 text-slate-800">
          {skills.programmingLanguages?.length > 0 && (
            <p><strong>Languages:</strong> {skills.programmingLanguages.join(', ')}</p>
          )}
          {skills.frontend?.length > 0 && (
            <p><strong>Frontend:</strong> {skills.frontend.join(', ')}</p>
          )}
          {skills.backend?.length > 0 && (
            <p><strong>Backend:</strong> {skills.backend.join(', ')}</p>
          )}
          {skills.database?.length > 0 && (
            <p><strong>Databases:</strong> {skills.database.join(', ')}</p>
          )}
          {skills.tools?.length > 0 && (
            <p><strong>Tools:</strong> {skills.tools.join(', ')}</p>
          )}
          {skills.custom?.length > 0 && (
            <p><strong>Others:</strong> {skills.custom.join(', ')}</p>
          )}
        </div>
      </div>
    ),
    experience: (experience?.length > 0 || internships?.length > 0) && (
      <div className="mt-4" key="experience">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Experience & Internships
        </h2>
        <div className="mt-2 space-y-3">
          {internships?.map((intern, idx) => (
            <div key={`intern-${idx}`}>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{intern.role} – {intern.company}</span>
                <span className="font-normal text-slate-600 text-xs">{intern.duration}</span>
              </div>
              <RenderBullets items={intern.responsibilities} />
            </div>
          ))}
          {experience?.map((exp, idx) => (
            <div key={`exp-${idx}`}>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{exp.position} – {exp.company}</span>
                <span className="font-normal text-slate-600 text-xs">{exp.duration}</span>
              </div>
              <RenderBullets items={exp.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    projects: projects?.length > 0 && (
      <div className="mt-4" key="projects">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Projects
        </h2>
        <div className="mt-2 space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>
                  {proj.title}
                  {proj.githubLink && <a href={proj.githubLink} className="ml-2 text-xs font-normal underline text-blue-600">GitHub</a>}
                  {proj.liveDemoLink && <a href={proj.liveDemoLink} className="ml-2 text-xs font-normal underline text-blue-600">Live Demo</a>}
                </span>
              </div>
              <RenderTechBadge techList={proj.technologies} />
              <RenderBullets items={proj.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    education: education?.length > 0 && (
      <div className="mt-4" key="education">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Education
        </h2>
        <div className="mt-2 space-y-2">
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between text-slate-800">
              <div>
                <strong className="text-slate-950">{edu.degree}</strong> – {edu.college} {edu.university && `(${edu.university})`}
              </div>
              <div className="text-right">
                <span className="block text-slate-600 text-xs">
                  {edu.startDate} - {edu.isPursuing ? 'Pursuing' : edu.endDate}
                </span>
                {!edu.isPursuing && edu.score && (
                  <span className="block font-semibold text-xs text-slate-800">Score: {edu.score}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    certifications: certifications?.length > 0 && (
      <div className="mt-4" key="certifications">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Certifications
        </h2>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-slate-800">
          {certifications.map((cert, idx) => (
            <li key={idx}>
              <strong>{cert.name}</strong> – {cert.organization} ({cert.date})
            </li>
          ))}
        </ul>
      </div>
    ),
    achievements: achievements?.length > 0 && (
      <div className="mt-4" key="achievements">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Achievements
        </h2>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-slate-800">
          {achievements.map((ach, idx) => (
            <li key={idx}>
              <strong>{ach.title}</strong>: {ach.description}
            </li>
          ))}
        </ul>
      </div>
    ),
    languages: languages?.length > 0 && (
      <div className="mt-4" key="languages">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Languages
        </h2>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-slate-800">
          {languages.map((lang, idx) => (
            <li key={idx}>
              {lang.language} ({lang.proficiency})
            </li>
          ))}
        </ul>
      </div>
    ),
    declaration: declaration && (
      <div className="mt-4 pt-3 border-t border-slate-200" key="declaration">
        <h2 className="font-bold uppercase tracking-wider text-xs" style={{ color: themeColor }}>
          Declaration
        </h2>
        <p className="text-slate-800 text-xs mt-1.5 leading-relaxed">{declaration}</p>
      </div>
    )
  };

  const finalOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultSectionOrder;

  return (
    <div className="text-slate-900 bg-white" style={{ ...fontStyle, ...sizeStyle }}>
      {/* Header */}
      <div className="text-center pb-4 border-b-2" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ color: themeColor }}>
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-slate-700 mt-1.5 space-x-2">
          <span>{personalInfo.email}</span>
          <span>•</span>
          <span>{personalInfo.phoneNumber}</span>
          <span>•</span>
          <span>{personalInfo.location}</span>
        </div>
        <div className="text-xs text-slate-600 mt-1 flex justify-center space-x-3">
          {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="underline hover:text-blue-600">{personalInfo.linkedinUrl}</a>}
          {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="underline hover:text-blue-600">{personalInfo.githubUrl}</a>}
          {personalInfo.portfolioUrl && <a href={personalInfo.portfolioUrl} className="underline hover:text-blue-600">{personalInfo.portfolioUrl}</a>}
        </div>
      </div>

      {/* Render Dynamic Content Sections */}
      {finalOrder.map(key => sectionMap[key] || null)}
    </div>
  );
};

// -------------------------------------------------------------
// TEMPLATE 2: SOFTWARE ENGINEER ATS
// Left aligned name, skills at top
// -------------------------------------------------------------
export const SoftwareEngineerATS = ({ data }) => {
  const { 
    personalInfo = {}, summary, education = [], skills = {}, 
    projects = [], internships = [], experience = [], certifications = [], 
    languages = [], declaration, sectionOrder, fontSize = 'medium', fontFamily = 'sans', themeColor = '#1e293b' 
  } = data;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const sizeStyle = getFontSizeStyle(fontSize);

  const sectionMap = {
    summary: summary && (
      <div className="mt-4" key="summary">
        <h2 className="font-bold uppercase tracking-wider text-xs" style={{ color: themeColor }}>Professional Summary</h2>
        <p className="text-slate-800 mt-1 leading-relaxed">{summary}</p>
      </div>
    ),
    skills: (skills.programmingLanguages?.length > 0 || skills.frontend?.length > 0 || skills.backend?.length > 0 || skills.database?.length > 0 || skills.tools?.length > 0 || skills.custom?.length > 0) && (
      <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200" key="skills">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Technical Skill Matrix
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-800">
          {skills.programmingLanguages?.length > 0 && (
            <p><strong>Languages:</strong> {skills.programmingLanguages.join(', ')}</p>
          )}
          {skills.frontend?.length > 0 && (
            <p><strong>Frontend:</strong> {skills.frontend.join(', ')}</p>
          )}
          {skills.backend?.length > 0 && (
            <p><strong>Backend:</strong> {skills.backend.join(', ')}</p>
          )}
          {skills.database?.length > 0 && (
            <p><strong>Databases:</strong> {skills.database.join(', ')}</p>
          )}
          {skills.tools?.length > 0 && (
            <p><strong>Developer Tools:</strong> {skills.tools.join(', ')}</p>
          )}
          {skills.custom?.length > 0 && (
            <p><strong>Libraries/Other:</strong> {skills.custom.join(', ')}</p>
          )}
        </div>
      </div>
    ),
    experience: (experience?.length > 0 || internships?.length > 0) && (
      <div className="mt-4" key="experience">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Professional Experience
        </h2>
        <div className="mt-2 space-y-3">
          {internships?.map((intern, idx) => (
            <div key={`intern-${idx}`}>
              <div className="flex justify-between font-bold text-slate-900">
                <span>{intern.role} – {intern.company} (Intern)</span>
                <span className="font-normal text-slate-600 text-xs">{intern.duration}</span>
              </div>
              <RenderBullets items={intern.responsibilities} />
            </div>
          ))}
          {experience?.map((exp, idx) => (
            <div key={`exp-${idx}`}>
              <div className="flex justify-between font-bold text-slate-900">
                <span>{exp.position} – {exp.company}</span>
                <span className="font-normal text-slate-600 text-xs">{exp.duration}</span>
              </div>
              <RenderBullets items={exp.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    projects: projects?.length > 0 && (
      <div className="mt-4" key="projects">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Projects
        </h2>
        <div className="mt-2 space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-900">
                <span>
                  {proj.title}
                  {proj.githubLink && <a href={proj.githubLink} className="ml-2 text-xs font-normal underline text-blue-600">Repo</a>}
                  {proj.liveDemoLink && <a href={proj.liveDemoLink} className="ml-2 text-xs font-normal underline text-blue-600">Live</a>}
                </span>
              </div>
              <RenderTechBadge techList={proj.technologies} />
              <RenderBullets items={proj.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    education: education?.length > 0 && (
      <div className="mt-4" key="education">
        <h2 className="font-bold uppercase tracking-wider border-b pb-0.5 text-xs" style={{ color: themeColor, borderColor: `${themeColor}40` }}>
          Education
        </h2>
        <div className="mt-2 space-y-2">
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between text-slate-800">
              <div>
                <strong className="text-slate-950">{edu.degree}</strong> – {edu.college} {edu.university && `(${edu.university})`}
              </div>
              <div className="text-right text-xs text-slate-600">
                <span>{edu.startDate} - {edu.isPursuing ? 'Pursuing' : edu.endDate}</span>
                {!edu.isPursuing && edu.score && <span className="block font-semibold text-slate-800">CGPA/Percentage: {edu.score}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    certifications: certifications?.length > 0 && (
      <div className="mt-4" key="certifications">
        <h3 className="text-xs font-bold uppercase text-slate-950">Certifications</h3>
        <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-800">
          {certifications.map((cert, idx) => (
            <li key={idx}>
              {cert.name} – {cert.organization} ({cert.date})
            </li>
          ))}
        </ul>
      </div>
    ),
    languages: languages?.length > 0 && (
      <div className="mt-4" key="languages">
        <h3 className="text-xs font-bold uppercase text-slate-950">Languages</h3>
        <p className="text-xs text-slate-800 mt-1">
          {languages.map(l => `${l.language} (${l.proficiency})`).join(', ')}
        </p>
      </div>
    ),
    declaration: declaration && (
      <div className="mt-4 pt-3 border-t border-slate-200" key="declaration">
        <h2 className="font-bold uppercase tracking-wider text-xs" style={{ color: themeColor }}>
          Declaration
        </h2>
        <p className="text-slate-800 text-xs mt-1.5 leading-relaxed">{declaration}</p>
      </div>
    )
  };

  const finalOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultSectionOrder;

  return (
    <div className="text-slate-900 bg-white" style={{ ...fontStyle, ...sizeStyle }}>
      {/* Header Left Aligned */}
      <div className="pb-3 border-b-2 flex flex-col md:flex-row justify-between items-start md:items-end" style={{ borderColor: themeColor }}>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 leading-none">{personalInfo.fullName || 'Your Name'}</h1>
          <p className="font-semibold mt-1 text-xs" style={{ color: themeColor }}>Software Engineer Graduate</p>
        </div>
        <div className="text-right text-xs text-slate-700 mt-2 md:mt-0 space-y-0.5">
          <p>{personalInfo.email} | {personalInfo.phoneNumber} | {personalInfo.location}</p>
          <div className="flex flex-wrap md:justify-end gap-2 text-slate-600">
            {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="underline hover:text-blue-600">GitHub</a>}
            {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="underline hover:text-blue-600">LinkedIn</a>}
            {personalInfo.portfolioUrl && <a href={personalInfo.portfolioUrl} className="underline hover:text-blue-600">Portfolio</a>}
          </div>
        </div>
      </div>

      {/* Render Dynamic Content Sections */}
      {finalOrder.map(key => sectionMap[key] || null)}
    </div>
  );
};

// -------------------------------------------------------------
// TEMPLATE 3: FRESH GRADUATE ATS
// Education section at top, focuses on academic records
// -------------------------------------------------------------
export const FreshGraduateATS = ({ data }) => {
  const { 
    personalInfo = {}, summary, education = [], skills = {}, 
    projects = [], internships = [], certifications = [], declaration, sectionOrder,
    fontSize = 'medium', fontFamily = 'sans', themeColor = '#1e293b'
  } = data;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const sizeStyle = getFontSizeStyle(fontSize);

  const sectionMap = {
    summary: summary && (
      <div className="mt-3.5" key="summary">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Objective & Profile
        </h2>
        <p className="text-slate-800 mt-1.5 leading-relaxed">{summary}</p>
      </div>
    ),
    education: education?.length > 0 && (
      <div className="mt-3.5" key="education">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Education
        </h2>
        <div className="mt-2 space-y-2">
          {education.map((edu, idx) => (
            <div key={idx} className="text-slate-800">
              <div className="flex justify-between font-bold text-slate-950">
                <span>{edu.degree}</span>
                <span className="font-normal text-slate-600 text-xs">{edu.startDate} – {edu.isPursuing ? 'Pursuing' : edu.endDate}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700 mt-0.5">
                <span>{edu.college} {edu.university && `| ${edu.university}`}</span>
                {!edu.isPursuing && edu.score && <span className="font-semibold">Score: {edu.score}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    skills: (skills.programmingLanguages?.length > 0 || skills.frontend?.length > 0 || skills.backend?.length > 0 || skills.database?.length > 0 || skills.tools?.length > 0) && (
      <div className="mt-3.5" key="skills">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Technical Capabilities
        </h2>
        <ul className="mt-2 space-y-1 text-slate-800 pl-2 text-xs">
          {skills.programmingLanguages?.length > 0 && (
            <li><strong>Programming Languages:</strong> {skills.programmingLanguages.join(', ')}</li>
          )}
          {skills.frontend?.length > 0 && (
            <li><strong>Web Development / UI:</strong> {skills.frontend.join(', ')}</li>
          )}
          {skills.backend?.length > 0 && (
            <li><strong>Backend Engines:</strong> {skills.backend.join(', ')}</li>
          )}
          {skills.database?.length > 0 && (
            <li><strong>Databases:</strong> {skills.database.join(', ')}</li>
          )}
          {skills.tools?.length > 0 && (
            <li><strong>Tools & Platforms:</strong> {skills.tools.join(', ')}</li>
          )}
        </ul>
      </div>
    ),
    projects: projects?.length > 0 && (
      <div className="mt-3.5" key="projects">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Academic & Personal Projects
        </h2>
        <div className="mt-2 space-y-3">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-950">
                <span>
                  {proj.title}
                  {proj.githubLink && <a href={proj.githubLink} className="ml-2 text-xs font-normal underline text-blue-600">Code Link</a>}
                </span>
              </div>
              <RenderTechBadge techList={proj.technologies} />
              <RenderBullets items={proj.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    experience: internships?.length > 0 && (
      <div className="mt-3.5" key="experience">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Work & Internships
        </h2>
        <div className="mt-2 space-y-2.5">
          {internships.map((intern, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-950">
                <span>{intern.role} – {intern.company}</span>
                <span className="font-normal text-slate-600 text-xs">{intern.duration}</span>
              </div>
              <RenderBullets items={intern.responsibilities} />
            </div>
          ))}
        </div>
      </div>
    ),
    certifications: certifications?.length > 0 && (
      <div className="mt-3.5" key="certifications">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Certifications & Achievements
        </h2>
        <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-slate-800 text-xs">
          {certifications.map((cert, idx) => (
            <li key={idx}>
              {cert.name} – {cert.organization} ({cert.date})
            </li>
          ))}
        </ul>
      </div>
    ),
    declaration: declaration && (
      <div className="mt-3.5" key="declaration">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white py-0.5 px-2" style={{ backgroundColor: themeColor }}>
          Declaration
        </h2>
        <p className="text-slate-800 text-xs mt-1.5 leading-relaxed">{declaration}</p>
      </div>
    )
  };

  // FreshGraduate usually defaults education to the top
  const graduateDefaultOrder = [
    'education', 'summary', 'skills', 'projects', 'experience', 'certifications', 'declaration'
  ];
  const finalOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : graduateDefaultOrder;

  return (
    <div className="text-slate-900 bg-white" style={{ ...fontStyle, ...sizeStyle }}>
      {/* Centered Minimal Header */}
      <div className="text-center pb-3 border-b-2" style={{ borderColor: themeColor }}>
        <h1 className="text-2xl font-bold text-slate-950 tracking-normal">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-slate-700 mt-1 text-xs">
          {personalInfo.email} | {personalInfo.phoneNumber} | {personalInfo.location}
        </p>
        <div className="flex justify-center space-x-3 text-xs text-slate-600 mt-1">
          {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="underline">GitHub</a>}
          {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="underline">LinkedIn</a>}
          {personalInfo.portfolioUrl && <a href={personalInfo.portfolioUrl} className="underline">Portfolio</a>}
        </div>
      </div>

      {/* Render Dynamic Content Sections */}
      {finalOrder.map(key => sectionMap[key] || null)}
    </div>
  );
};

// -------------------------------------------------------------
// TEMPLATE 4: MODERN MINIMAL ATS
// Serif headers, zero decoration lines, clean margins, high text density
// -------------------------------------------------------------
export const ModernMinimalATS = ({ data }) => {
  const { 
    personalInfo = {}, summary, education = [], skills = {}, 
    projects = [], experience = [], certifications = [], declaration, sectionOrder,
    fontSize = 'medium', fontFamily = 'serif', themeColor = '#1e293b'
  } = data;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const sizeStyle = getFontSizeStyle(fontSize);

  const sectionMap = {
    summary: summary && (
      <div className="mt-3.5" key="summary">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Profile</h2>
        <p className="text-slate-800 mt-1 leading-relaxed font-sans">{summary}</p>
      </div>
    ),
    skills: (skills.programmingLanguages?.length > 0 || skills.frontend?.length > 0 || skills.backend?.length > 0 || skills.database?.length > 0 || skills.tools?.length > 0) && (
      <div className="mt-3.5" key="skills">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Skills Matrix</h2>
        <div className="mt-1 font-sans text-slate-800 space-y-0.5 text-xs">
          {skills.programmingLanguages?.length > 0 && <p><strong>Languages:</strong> {skills.programmingLanguages.join(', ')}</p>}
          {skills.frontend?.length > 0 && <p><strong>Frontend:</strong> {skills.frontend.join(', ')}</p>}
          {skills.backend?.length > 0 && <p><strong>Backend:</strong> {skills.backend.join(', ')}</p>}
          {skills.database?.length > 0 && <p><strong>Database:</strong> {skills.database.join(', ')}</p>}
          {skills.tools?.length > 0 && <p><strong>Tools:</strong> {skills.tools.join(', ')}</p>}
        </div>
      </div>
    ),
    experience: experience?.length > 0 && (
      <div className="mt-3.5" key="experience">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Experience</h2>
        <div className="mt-1.5 space-y-2">
          {experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-950">
                <span>{exp.position} – {exp.company}</span>
                <span className="font-normal text-slate-600 font-sans text-xs">{exp.duration}</span>
              </div>
              <RenderBullets items={exp.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    projects: projects?.length > 0 && (
      <div className="mt-3.5" key="projects">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Projects</h2>
        <div className="mt-1.5 space-y-2">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-950">
                <span>{proj.title}</span>
                <div className="font-sans text-xs space-x-2">
                  {proj.githubLink && <a href={proj.githubLink} className="underline">Code</a>}
                  {proj.liveDemoLink && <a href={proj.liveDemoLink} className="underline">Demo</a>}
                </div>
              </div>
              <RenderTechBadge techList={proj.technologies} />
              <RenderBullets items={proj.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    education: education?.length > 0 && (
      <div className="mt-3.5" key="education">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Education</h2>
        <div className="mt-1.5 space-y-2">
          {education.map((edu, idx) => (
            <div key={idx} className="">
              <div className="flex justify-between text-slate-950 font-bold">
                <span>{edu.degree}</span>
                <span className="text-slate-600 text-xs font-sans font-normal">
                  {edu.startDate} - {edu.isPursuing ? 'Pursuing' : edu.endDate}
                </span>
              </div>
              <p className="text-slate-700 text-xs mt-0.5 font-sans">
                {edu.college} {edu.university && `(${edu.university})`}
                {!edu.isPursuing && edu.score && ` \u00a0•\u00a0 Score: ${edu.score}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
    certifications: certifications?.length > 0 && (
      <div className="mt-3.5" key="certifications">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Certifications</h2>
        <p className="text-xs text-slate-800 mt-1 font-sans">
          {certifications.map(c => `${c.name} (${c.organization})`).join(' • ')}
        </p>
      </div>
    ),
    declaration: declaration && (
      <div className="mt-3.5" key="declaration">
        <h2 className="text-xs font-bold tracking-widest uppercase border-b pb-0.5" style={{ color: themeColor, borderColor: `${themeColor}20` }}>Declaration</h2>
        <p className="text-slate-800 text-xs mt-1 leading-relaxed font-sans">{declaration}</p>
      </div>
    )
  };

  const finalOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultSectionOrder;

  return (
    <div className="text-slate-955 bg-white font-serif" style={{ ...fontStyle, ...sizeStyle }}>
      {/* Compact Header */}
      <div className="pb-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: themeColor }}>{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-xs font-sans text-slate-700 mt-1">
          {personalInfo.email} &nbsp;|&nbsp; {personalInfo.phoneNumber} &nbsp;|&nbsp; {personalInfo.location}
        </p>
        <div className="flex justify-center font-sans space-x-3 text-xs text-slate-600 mt-1">
          {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="hover:underline">LinkedIn</a>}
          {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="hover:underline">GitHub</a>}
          {personalInfo.portfolioUrl && <a href={personalInfo.portfolioUrl} className="hover:underline">Portfolio</a>}
        </div>
      </div>

      {/* Render Dynamic Content Sections */}
      {finalOrder.map(key => sectionMap[key] || null)}
    </div>
  );
};

// -------------------------------------------------------------
// TEMPLATE 5: IT PROFESSIONAL ATS
// Highly structured sections, explicit technical tags
// -------------------------------------------------------------
export const ITProfessionalATS = ({ data }) => {
  const { 
    personalInfo = {}, summary, education = [], skills = {}, 
    projects = [], experience = [], certifications = [], languages = [], declaration, sectionOrder,
    fontSize = 'medium', fontFamily = 'sans', themeColor = '#1e293b'
  } = data;

  const fontStyle = getFontFamilyStyle(fontFamily);
  const sizeStyle = getFontSizeStyle(fontSize);

  const sectionMap = {
    summary: summary && (
      <div className="mt-3.5" key="summary">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Executive Summary</h2>
        <p className="text-slate-800 mt-1 leading-relaxed">{summary}</p>
      </div>
    ),
    skills: (skills.programmingLanguages?.length > 0 || skills.frontend?.length > 0 || skills.backend?.length > 0 || skills.database?.length > 0 || skills.tools?.length > 0) && (
      <div className="mt-3.5" key="skills">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Core Competencies</h2>
        <div className="mt-1.5 grid grid-cols-1 gap-1 text-slate-800 text-xs">
          {skills.programmingLanguages?.length > 0 && <p><strong>Development Languages:</strong> {skills.programmingLanguages.join(', ')}</p>}
          {skills.frontend?.length > 0 && <p><strong>Frontend Technologies:</strong> {skills.frontend.join(', ')}</p>}
          {skills.backend?.length > 0 && <p><strong>Backend Stacks:</strong> {skills.backend.join(', ')}</p>}
          {skills.database?.length > 0 && <p><strong>Relational / NoSQL:</strong> {skills.database.join(', ')}</p>}
          {skills.tools?.length > 0 && <p><strong>DevOps & Engineering Tools:</strong> {skills.tools.join(', ')}</p>}
        </div>
      </div>
    ),
    projects: projects?.length > 0 && (
      <div className="mt-3.5" key="projects">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Technical Systems & Projects</h2>
        <div className="mt-1.5 space-y-2">
          {projects.map((proj, idx) => (
            <div key={idx}>
              <p className="font-bold text-slate-950 text-xs">
                {proj.title} {proj.githubLink && <span className="text-xs font-normal text-slate-500">({proj.githubLink})</span>}
              </p>
              <RenderTechBadge techList={proj.technologies} />
              <RenderBullets items={proj.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    experience: experience?.length > 0 && (
      <div className="mt-3.5" key="experience">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Professional Experience</h2>
        <div className="mt-1.5 space-y-2">
          {experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between font-bold text-slate-950">
                <span>{exp.position} – {exp.company}</span>
                <span className="font-normal text-slate-600 text-xs">{exp.duration}</span>
              </div>
              <RenderBullets items={exp.description} />
            </div>
          ))}
        </div>
      </div>
    ),
    education: education?.length > 0 && (
      <div className="mt-3.5" key="education">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Education</h2>
        <div className="mt-1.5 space-y-1">
          {education.map((edu, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <div>
                <strong>{edu.degree}</strong> – {edu.college}
              </div>
              <span className="text-slate-600 text-xs">
                {edu.startDate} - {edu.isPursuing ? 'Pursuing' : edu.endDate}
                {!edu.isPursuing && edu.score && ` (Score: ${edu.score})`}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    certifications: certifications?.length > 0 && (
      <div className="mt-3.5" key="certifications">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>IT Credentials</h2>
        <ul className="list-disc pl-5 mt-1 text-xs text-slate-800">
          {certifications.map((cert, idx) => (
            <li key={idx}>
              <strong>{cert.name}</strong> – Issued by {cert.organization} ({cert.date})
            </li>
          ))}
        </ul>
      </div>
    ),
    declaration: declaration && (
      <div className="mt-3.5" key="declaration">
        <h2 className="text-xs font-bold uppercase border-l-4 pl-2" style={{ color: themeColor, borderColor: themeColor }}>Declaration</h2>
        <p className="text-slate-800 text-xs mt-1.5 leading-relaxed">{declaration}</p>
      </div>
    )
  };

  const finalOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultSectionOrder;

  return (
    <div className="text-slate-900 bg-white" style={{ ...fontStyle, ...sizeStyle }}>
      {/* Compact header grid style but plain text */}
      <div className="border-b-4 pb-2" style={{ borderColor: themeColor }}>
        <h1 className="text-3xl font-black text-slate-950 leading-none">{personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-xs text-slate-600 uppercase tracking-widest mt-1 font-bold">IT Infrastructure & Software Systems</p>
        <p className="text-xs text-slate-800 mt-2 font-medium">
          Email: {personalInfo.email} | Tel: {personalInfo.phoneNumber} | Location: {personalInfo.location}
        </p>
        <div className="text-xs font-semibold space-x-4 mt-1">
          {personalInfo.githubUrl && <a href={personalInfo.githubUrl} className="hover:underline" style={{ color: themeColor }}>github: {personalInfo.githubUrl.replace('https://', '')}</a>}
          {personalInfo.linkedinUrl && <a href={personalInfo.linkedinUrl} className="hover:underline" style={{ color: themeColor }}>linkedin: {personalInfo.linkedinUrl.replace('https://', '')}</a>}
        </div>
      </div>

      {/* Render Dynamic Content Sections */}
      {finalOrder.map(key => sectionMap[key] || null)}
    </div>
  );
};

// Global template mapper helper
export const getTemplateComponent = (templateId) => {
  switch (templateId) {
    case 'software-engineer':
      return SoftwareEngineerATS;
    case 'fresh-graduate':
      return FreshGraduateATS;
    case 'modern-minimal':
      return ModernMinimalATS;
    case 'it-professional':
      return ITProfessionalATS;
    case 'classic':
    default:
      return ClassicProfessional;
  }
};
