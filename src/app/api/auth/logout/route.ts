import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', req.url));
  response.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });
  return response;
}
