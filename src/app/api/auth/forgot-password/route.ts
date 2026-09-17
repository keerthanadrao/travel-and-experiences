import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendOtpEmail } from '@/lib/nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const db = await getDb();
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return NextResponse.json({ error: 'No account registered with this email' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    await db.run(
      `INSERT INTO otp_tokens (id, email, otp_code, attempts, expires_at) VALUES (?, ?, ?, 0, ?)`,
      [`otp-${Date.now()}`, email, otpCode, expiresAt]
    );

    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: 'OTP sent to registered email address', resendCooldown: 60 });
  } catch (error: any) {
    return NextResponse.json({ error: 'OTP request failed' }, { status: 500 });
  }
}
