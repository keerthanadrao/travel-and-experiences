import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isPasswordStrong } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isPasswordStrong(newPassword)) {
      return NextResponse.json({
        error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.'
      }, { status: 400 });
    }

    const db = await getDb();
    const tokenRecord = await db.get(
      `SELECT * FROM otp_tokens WHERE email = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid verification OTP code' }, { status: 400 });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP code has expired. Please request a new code.' }, { status: 400 });
    }

    if (tokenRecord.attempts >= 3) {
      return NextResponse.json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' }, { status: 400 });
    }

    // Update password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.run('UPDATE users SET password_hash = ? WHERE email = ?', [newPasswordHash, email]);

    // Clean up OTP
    await db.run('DELETE FROM otp_tokens WHERE email = ?', [email]);

    return NextResponse.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
