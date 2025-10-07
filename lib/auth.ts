import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_SECRET = 'authenticated';

export async function verifyAdminPin(pin: string): Promise<boolean> {
  return pin === process.env.ADMIN_PIN;
}

export async function createAdminSession() {
  cookies().set(SESSION_COOKIE_NAME, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getAdminSession(): Promise<boolean> {
  const sessionCookie = cookies().get(SESSION_COOKIE_NAME);
  return sessionCookie?.value === SESSION_SECRET;
}

export async function destroyAdminSession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
