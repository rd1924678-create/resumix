const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  deleteUser,
  getResumes,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/resumes', getResumes);

module.exports = router;
