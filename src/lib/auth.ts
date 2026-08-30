import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AdminJWTPayload } from './types';

const JWT_SECRET_RAW =
  process.env.JWT_SECRET || 'fallback_development_secret_must_be_at_least_32_characters_long_12345';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);
const COOKIE_NAME = 'admin_token';
const TOKEN_EXPIRY = '7d';

/**
 * Hash plain password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against stored hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for authenticated admin
 */
export async function signAdminToken(payload: {
  id: string;
  email: string;
  name: string;
  role?: string;
}): Promise<string> {
  return new SignJWT({
    sub: payload.id,
    email: payload.email,
    name: payload.name,
    role: payload.role || 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token string
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as string) || 'admin',
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Helper to set HTTP-only admin session cookie in a NextResponse
 */
export function setAdminCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Helper to clear admin session cookie in a NextResponse
 */
export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Extract and verify admin session from Request headers or cookies
 */
export async function verifyAdminAuth(
  request: Request | NextRequest
): Promise<AdminJWTPayload | null> {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = await verifyAdminToken(token);
    if (payload) return payload;
  }

  // 2. Check HTTP-only cookie in NextRequest or cookies()
  if ('cookies' in request && typeof (request as NextRequest).cookies?.get === 'function') {
    const cookie = (request as NextRequest).cookies.get(COOKIE_NAME);
    if (cookie?.value) {
      return await verifyAdminToken(cookie.value);
    }
  }

  // 3. Fallback: next/headers cookies()
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      return await verifyAdminToken(token);
    }
  } catch {
    // Next.js cookies() may throw outside request lifecycle
  }

  return null;
}
