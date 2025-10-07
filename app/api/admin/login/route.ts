import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin, createAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();

    const isValid = await verifyAdminPin(pin);

    if (isValid) {
      await createAdminSession();
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
