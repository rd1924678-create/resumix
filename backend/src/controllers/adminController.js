const User = require('../models/User');
const Resume = require('../models/Resume');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResumes = await Resume.countDocuments();
    
    // Sum total downloads
    const downloadsResult = await Resume.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadsCount" } } }
    ]);
    const totalDownloads = downloadsResult.length > 0 ? downloadsResult[0].total : 0;

    // Calculate average score
    const scoreResult = await Resume.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$atsScore" } } }
    ]);
    const averageScore = scoreResult.length > 0 ? Math.round(scoreResult[0].avgScore) : 0;

    // Find templates distribution
    const templateStats = await Resume.aggregate([
      { $group: { _id: "$templateId", count: { $sum: 1 } } }
    ]);

    // Get last updated resume
    const lastResume = await Resume.findOne().sort({ updatedAt: -1 }).populate('user', 'name email');

    res.json({
      success: true,
      data: {
        totalUsers,
        totalResumes,
        totalDownloads,
        averageScore,
        templateStats,
        lastUpdatedResume: lastResume ? {
          title: lastResume.title,
          updatedAt: lastResume.updatedAt,
          score: lastResume.atsScore,
          userName: lastResume.user ? lastResume.user.name : 'Unknown User',
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin account');
    }

    // Delete all user's resumes first
    await Resume.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and their resumes deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resumes
// @route   GET /api/admin/resumes
// @access  Private/Admin
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find().populate('user', 'name email').sort({ updatedAt: -1 });
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  deleteUser,
  getResumes,
};
