import { NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';

export async function POST() {
  try {
    await destroyAdminSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
