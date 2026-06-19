const Resume = require('../models/Resume');

// Helper function to calculate ATS Score & generate suggestions
const calculateAtsScore = (resume) => {
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

// @desc    Get user resumes
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific resume
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    const { score, suggestions } = calculateAtsScore(resume);

    res.json({
      success: true,
      data: resume,
      analysis: {
        score,
        suggestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res, next) => {
  try {
    // Add user to body
    req.body.user = req.user._id;

    // Calculate score
    const tempResume = new Resume(req.body);
    const { score } = calculateAtsScore(tempResume);
    req.body.atsScore = score;

    const resume = await Resume.create(req.body);

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found or user unauthorized');
    }

    // Re-calculate ATS score
    const tempObj = { ...resume.toObject(), ...req.body };
    const { score } = calculateAtsScore(tempObj);
    req.body.atsScore = score;

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found or user unauthorized');
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record download / Increment count
// @route   POST /api/resumes/:id/download
// @access  Private
const recordDownload = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    resume.downloadsCount = (resume.downloadsCount || 0) + 1;
    await resume.save();

    res.json({
      success: true,
      downloadsCount: resume.downloadsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a proper text-based PDF using Puppeteer
// @route   POST /api/resumes/:id/pdf
// @access  Private
const generatePdf = async (req, res, next) => {
  try {
    const { html } = req.body;
    if (!html) {
      res.status(400);
      throw new Error('HTML content is required');
    }

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set HTML content and wait for styling/images to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Print to PDF with exact A4 dimensions
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    await browser.close();

    res.contentType('application/pdf');
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('PDF Generation Error:', error);
    next(error);
  }
};

module.exports = {
  getResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  recordDownload,
  generatePdf,
  calculateAtsScore, // export for testing or other pages
};
