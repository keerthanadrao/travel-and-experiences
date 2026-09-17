import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'travel_and_experiences_secret_key_2026';

export interface UserSession {
  userId: string;
  name: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export function generateToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function isPasswordStrong(password: string): boolean {
  // Requires >= 8 chars, 1 uppercase, 1 number, 1 special char
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_-])[A-Za-z\d@$!%*?&#^()_-]{8,}$/;
  return regex.test(password);
}
