import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendOtpEmail } from '@/lib/notification';

const { connectDB, User, OtpToken } = db as any;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, purpose } = body;

    if (!email || !purpose) {
      return NextResponse.json({ message: 'Missing email or purpose.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (purpose === 'register' && existingUser) {
      return NextResponse.json({ message: 'Email already registered.' }, { status: 400 });
    }
    if (purpose === 'forgot_password' && !existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (OtpToken && OtpToken.deleteMany) {
      await OtpToken.deleteMany({ email, purpose });
    }

    await OtpToken.create({ email, otp, purpose });
    await sendOtpEmail(email, otp, purpose);

    return NextResponse.json({ message: 'OTP sent successfully.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Failed to send OTP.', error: err.message }, { status: 500 });
  }
}
