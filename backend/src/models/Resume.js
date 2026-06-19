const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'My Resume',
    trim: true,
  },
  templateId: {
    type: String,
    enum: ['classic', 'software-engineer', 'fresh-graduate', 'modern-minimal', 'it-professional'],
    default: 'classic',
  },
  fontSize: {
    type: String,
    // Support both legacy (small/medium/large) and new numeric pt values (9-16)
    enum: ['small', 'medium', 'large', '9', '10', '11', '12', '13', '14', '15', '16'],
    default: '11',
  },
  fontFamily: {
    type: String,
    // Support all standard font options
    enum: ['sans', 'serif', 'mono', 'times', 'arial', 'georgia', 'garamond', 'courier', 'helvetica', 'calibri'],
    default: 'sans',
  },
  themeColor: {
    type: String,
    default: '#1e293b',
  },
  sectionOrder: {
    type: [String],
    default: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements', 'languages', 'declaration'],
  },
  hiddenSections: {
    type: [String],
    default: [],
  },

  personalInfo: {
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phoneNumber: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },
    portfolioUrl: { type: String, trim: true, default: '' },
  },
  summary: {
    type: String,
    default: '',
  },
  declaration: {
    type: String,
    default: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief. I bear full responsibility for the accuracy of the details mentioned herein.',
  },
  education: [
    {
      degree: { type: String, default: '' },
      college: { type: String, default: '' },
      university: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      expectedGraduation: { type: String, default: '' },
      score: { type: String, default: '' },
      isPursuing: { type: Boolean, default: false },
    }
  ],
  skills: {
    programmingLanguages: [{ type: String }],
    frontend: [{ type: String }],
    backend: [{ type: String }],
    database: [{ type: String }],
    tools: [{ type: String }],
    custom: [{ type: String }]
  },
  projects: [
    {
      title: { type: String, default: '' },
      description: [{ type: String }],
      technologies: [{ type: String }],
      githubLink: { type: String, default: '' },
      liveDemoLink: { type: String, default: '' },
    }
  ],
  internships: [
    {
      company: { type: String, default: '' },
      role: { type: String, default: '' },
      duration: { type: String, default: '' },
      responsibilities: [{ type: String }],
    }
  ],
  experience: [
    {
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      duration: { type: String, default: '' },
      description: [{ type: String }],
    }
  ],
  certifications: [
    {
      name: { type: String, default: '' },
      organization: { type: String, default: '' },
      date: { type: String, default: '' },
    }
  ],
  achievements: [
    {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    }
  ],
  languages: [
    {
      language: { type: String, default: '' },
      proficiency: { type: String, default: '' },
    }
  ],
  atsScore: {
    type: Number,
    default: 0,
  },
  downloadsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resume', ResumeSchema);
