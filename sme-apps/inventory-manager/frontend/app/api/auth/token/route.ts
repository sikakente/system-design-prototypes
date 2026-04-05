import { auth0 } from '../../../../lib/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { token: accessToken } = await auth0.getAccessToken();
    return NextResponse.json({ accessToken: accessToken ?? null });
  } catch {
    return NextResponse.json({ accessToken: null });
  }
}
