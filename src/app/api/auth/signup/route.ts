import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateToken, isPasswordStrong } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password, confirmPassword } = await req.json();

    if (!name || !username || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (!isPasswordStrong(password)) {
      return NextResponse.json({
        error: 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.'
      }, { status: 400 });
    }

    const db = await getDb();
    const existingUser = await db.get('SELECT 1 FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or username already exists' }, { status: 400 });
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await db.run(
      `INSERT INTO users (id, name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'USER')`,
      [userId, name, username, email, passwordHash]
    );

    const token = generateToken({
      userId,
      name,
      username,
      email,
      role: 'USER'
    });

    const response = NextResponse.json({ message: 'Account created successfully' }, { status: 201 });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
