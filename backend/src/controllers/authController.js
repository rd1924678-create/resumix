const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

// Helper for sending OTP email template
const sendOtpEmail = async (email, otp) => {
  try {
    await sendEmail({
      email: email,
      subject: 'Your Resumix Verification Code',
      message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">Resumix</h2>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Your Premium Resume Platform</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Use the one-time verification code below to sign in or complete your registration on Resumix:</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; margin: 25px 0; border: 1px solid #f1f5f9;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 6px; color: #0f172a; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This code will remain active for 10 minutes. For security reasons, please do not share this code with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">If you did not request this verification, you can safely ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to deliver OTP email to ${email}: ${error.message}`);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists and is not verified, regenerate OTP
      if (!userExists.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        userExists.otp = otp;
        userExists.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await userExists.save();

        console.log(`[OTP] Registration OTP for ${email}: ${otp}`);
        await sendOtpEmail(email, otp);

        return res.status(200).json({
          success: true,
          message: 'OTP sent to email (unverified user updated)'
        });
      }
      res.status(400);
      throw new Error('User already exists');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      isVerified: false
    });

    if (user) {
      console.log(`[OTP] Registration OTP for ${email}: ${otp}`);
      await sendOtpEmail(email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token or send OTP
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'rd@resumix.com';

    // Check if it's the admin
    if (email === adminEmail) {
      if (!password) {
        res.status(400);
        throw new Error('Password is required for admin login');
      }
      const user = await User.findOne({ email }).select('+password');
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(401);
        throw new Error('Invalid admin email or password');
      }
    }

    // For regular users, password is not allowed
    if (password) {
      res.status(400);
      throw new Error('Password login is only allowed for the admin');
    }

    // Regular user login (OTP based)
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found. Please register first.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    console.log(`[OTP] Login OTP for ${email}: ${otp}`);
    await sendOtpEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check OTP
    if (!user.otp || user.otp !== otp || new Date() > user.otpExpires) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Mark verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if entered text is the admin secret code
// @route   POST /api/auth/check-secret-code
// @access  Public
const checkSecretCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const adminSecret = process.env.ADMIN_SECRET_CODE || 'resumixadmin123';
    
    if (code && code.trim().toLowerCase() === adminSecret.trim().toLowerCase()) {
      return res.json({
        success: true,
        matched: true,
        adminEmail: process.env.ADMIN_EMAIL || 'rd@resumix.com'
      });
    }
    
    res.json({
      success: true,
      matched: false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found with that email');
    }

    res.json({
      success: true,
      message: 'Password reset instructions sent to email',
      resetToken: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400);
      throw new Error('Token and password are required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  checkSecretCode,
  getUserProfile,
  forgotPassword,
  resetPassword,
};
