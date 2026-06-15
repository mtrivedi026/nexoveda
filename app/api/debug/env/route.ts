import { NextResponse } from 'next/server';

export async function GET() {
  const hasUser = !!process.env.SMTP_USER;
  const hasPass = !!process.env.SMTP_PASS;
  
  return NextResponse.json({
    status: 'Debug Endpoint',
    SMTP_USER_CONFIGURED: hasUser,
    SMTP_PASS_CONFIGURED: hasPass,
    USER_PREVIEW: (hasUser && process.env.SMTP_USER) ? process.env.SMTP_USER.substring(0, 3) + '...' : 'NONE'
  });
}
