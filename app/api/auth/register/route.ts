import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, otp } = body;

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { message: 'Please enter name, email, password, and OTP.' },
        { status: 400 }
      );
    }

    const { OtpToken } = db as any;
    const otpRecord = await OtpToken.findOne({ email, purpose: 'register', otp });
    if (!otpRecord) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer'
    });

    const token = jwt.sign(
      { userId: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    if (OtpToken && OtpToken.deleteMany) {
      await OtpToken.deleteMany({ email, purpose: 'register' });
    }

    return NextResponse.json(
      {
        token,
        user: { 
          id: newUser._id, 
          name: newUser.name, 
          email: newUser.email, 
          role: newUser.role,
          loyaltyPoints: 0,
          status: 'offline'
        }
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Server error', error: err.message },
      { status: 500 }
    );
  }
}
