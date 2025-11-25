const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    throw new Error('Email could not be sent');
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to MediChain! 🏥</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering with MediChain. Your account has been created successfully.</p>
      <p>You can now start uploading your medical reports and prescriptions securely.</p>
      <p>Best regards,<br>The MediChain Team</p>
    </div>
  `,
  
  doctorVerification: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Account Verified! ✅</h2>
      <p>Hi Dr. ${name},</p>
      <p>Your doctor account has been verified by our admin team.</p>
      <p>You can now access patient records using share codes.</p>
      <p>Best regards,<br>The MediChain Team</p>
    </div>
  `,
  
  medicineReminder: (name, medicineName, dosage, time) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Medicine Reminder 💊</h2>
      <p>Hi ${name},</p>
      <p>This is a reminder to take your medicine:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Medicine:</strong> ${medicineName}</p>
        <p><strong>Dosage:</strong> ${dosage}</p>
        <p><strong>Time:</strong> ${time}</p>
      </div>
      <p>Take care of your health!</p>
      <p>Best regards,<br>The MediChain Team</p>
    </div>
  `,
  
  reportShared: (doctorName, patientName, shareCode) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Report Access Request 📋</h2>
      <p>Hi ${patientName},</p>
      <p>Dr. ${doctorName} has accessed your medical reports using share code: <strong>${shareCode}</strong></p>
      <p>If you did not authorize this access, please contact support immediately.</p>
      <p>Best regards,<br>The MediChain Team</p>
    </div>
  `,
  
  passwordReset: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Password Reset Request 🔐</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0;">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The MediChain Team</p>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };