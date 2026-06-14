const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP configs are missing, log fallback and return success
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`\n[SMTP FALLBACK] SMTP not fully configured in backend/.env`);
    console.log(`[SMTP FALLBACK] Simulated Email to: ${options.email}`);
    console.log(`[SMTP FALLBACK] Subject: ${options.subject}`);
    console.log(`[SMTP FALLBACK] Message: ${options.message}\n`);
    return { success: true, fallback: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_FROM || '"Resumix" <noreply@resumix.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family: sans-serif; padding: 20px; color: #333;">${options.message}</div>`,
  };

  const info = await transporter.sendMail(message);
  console.log(`[EMAIL] Message sent to ${options.email}: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
