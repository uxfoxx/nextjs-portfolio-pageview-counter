import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/pin';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();

    return NextResponse.json(
      { authenticated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
