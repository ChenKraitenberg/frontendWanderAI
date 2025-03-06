// services/emailService.ts
import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  // Configure your email transporter
  const transporter = nodemailer.createTransport({
    // Your email service configuration
    // e.g., SMTP settings, SendGrid, etc.
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password</p>
        <p>This link will expire in 1 hour</p>
      `,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};
