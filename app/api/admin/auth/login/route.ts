import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, createSession, checkRateLimit, recordAttempt, resetAttempts, getClientIp } from '@/lib/auth/pin';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const clientIp = getClientIp(request);

    const { allowed, remainingAttempts } = checkRateLimit(clientIp);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    if (verifyPin(pin)) {
      resetAttempts(clientIp);
      await createSession();

      return NextResponse.json(
        { success: true, message: 'Authentication successful' },
        { status: 200 }
      );
    } else {
      recordAttempt(clientIp);
      const newRemainingAttempts = remainingAttempts - 1;

      return NextResponse.json(
        {
          error: 'Invalid PIN',
          remainingAttempts: newRemainingAttempts
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}
