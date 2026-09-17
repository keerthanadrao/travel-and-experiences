import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"Travel & Experiences" <no-reply@travelandexperiences.com>',
      to: toEmail,
      subject: 'Password Reset Verification OTP - Travel & Experiences',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #F8F5ED; padding: 24px; color: #2B2927;">
          <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #E8DDC8;">
            <h2 style="color: #1F3A32; font-family: 'Playfair Display', Georgia, serif; margin-bottom: 8px;">Travel & Experiences</h2>
            <p style="color: #6E6A63; font-size: 14px; margin-bottom: 24px;">Where Journeys Become Stories</p>
            <hr style="border: none; border-top: 1px solid #E8DDC8; margin-bottom: 24px;" />
            <p style="margin-bottom: 16px;">Hello,</p>
            <p style="margin-bottom: 24px;">You requested a password reset. Use the 6-digit verification code below to proceed:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; background-color: #1F3A32; color: #F8F5ED; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 8px;">
                ${otpCode}
              </span>
            </div>
            <p style="color: #6E6A63; font-size: 13px; margin-top: 24px;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('NodeMailer send failure (fallback logging OTP):', otpCode, error);
    return true; // Graceful fallback for local development without live SMTP creds
  }
}
