const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  scoreResume, 
  scoreBuilderResume, 
  generateRolePreset, 
  generateSkills, 
  generateExperienceBullets, 
  chatWithResume,
  getPublicStats 
} = require('../controllers/atsController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.get('/public-stats', getPublicStats);
router.post('/score', protect, upload.single('resume'), scoreResume);
router.post('/score-builder', protect, scoreBuilderResume);
router.post('/preset', protect, generateRolePreset);
router.post('/generate-skills', protect, generateSkills);
router.post('/generate-bullets', protect, generateExperienceBullets);
router.post('/chat', protect, chatWithResume);

module.exports = router;
