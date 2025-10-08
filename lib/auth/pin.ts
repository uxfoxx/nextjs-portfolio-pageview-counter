import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PIN = '9984';
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = 'admin_authenticated';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

const attemptStore = new Map<string, { count: number; timestamp: number }>();

export function verifyPin(pin: string): boolean {
  return pin === ADMIN_PIN;
}

export function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const attempt = attemptStore.get(ip);

  if (attempt) {
    if (now - attempt.timestamp > LOCKOUT_DURATION) {
      attemptStore.delete(ip);
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    if (attempt.count >= MAX_ATTEMPTS) {
      return { allowed: false, remainingAttempts: 0 };
    }

    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempt.count };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
}

export function recordAttempt(ip: string): void {
  const now = Date.now();
  const attempt = attemptStore.get(ip);

  if (attempt) {
    if (now - attempt.timestamp > LOCKOUT_DURATION) {
      attemptStore.set(ip, { count: 1, timestamp: now });
    } else {
      attemptStore.set(ip, { count: attempt.count + 1, timestamp: attempt.timestamp });
    }
  } else {
    attemptStore.set(ip, { count: 1, timestamp: now });
  }
}

export function resetAttempts(ip: string): void {
  attemptStore.delete(ip);
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === SESSION_SECRET;
}

export function isAuthenticatedFromRequest(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_COOKIE_NAME);
  return session?.value === SESSION_SECRET;
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}
