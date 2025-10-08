import { cookies } from 'next/headers';
import { getAdminSupabaseClient } from './supabase/server';

const SESSION_COOKIE_NAME = 'admin-session';
const SESSION_SECRET = 'authenticated';

export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const supabase = getAdminSupabaseClient();

    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'admin_pin')
      .maybeSingle();

    if (error) {
      console.error('[Auth Error] Failed to fetch admin PIN from database:', error);
      const fallbackPin = process.env.ADMIN_PIN;
      if (fallbackPin) {
        console.log('[Auth] Using fallback PIN from environment variable');
        return pin === fallbackPin;
      }
      return false;
    }

    if (!data) {
      console.error('[Auth Error] Admin PIN not found in database');
      const fallbackPin = process.env.ADMIN_PIN;
      if (fallbackPin) {
        console.log('[Auth] Using fallback PIN from environment variable');
        return pin === fallbackPin;
      }
      return false;
    }

    return pin === data.value;
  } catch (error) {
    console.error('[Auth Error] Exception during PIN verification:', error);
    const fallbackPin = process.env.ADMIN_PIN;
    if (fallbackPin) {
      console.log('[Auth] Using fallback PIN from environment variable');
      return pin === fallbackPin;
    }
    return false;
  }
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
