import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

const { connectDB, User, OtpToken } = db as any;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: 'Please provide email, OTP, and new password.' }, { status: 400 });
    }

    const otpRecord = await OtpToken.findOne({ email, purpose: 'forgot_password', otp });
    if (!otpRecord) {
      return NextResponse.json({ message: 'Invalid or expired OTP.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await User.findByIdAndUpdate(user._id || user.id, { password: hashedPassword });

    if (OtpToken && OtpToken.deleteMany) {
      await OtpToken.deleteMany({ email, purpose: 'forgot_password' });
    }

    return NextResponse.json({ message: 'Password reset successfully.' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
  }
}
