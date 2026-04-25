import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Passwords for Gmail
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
  
  await transporter.sendMail({
    from: `"ATM Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your ATM Platform Account',
    html: `<p>Please click the link below to verify your account</p><p><a href="${url}">Verify Account</a></p>`,
  });
};

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: `"ATM Admin" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your ATM Platform Password',
    html: `<p>Please click the link below to reset your password. It is valid for 1 hour.</p><p><a href="${url}">Reset Password</a></p>`,
  });
};
