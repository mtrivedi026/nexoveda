import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function GET(request: Request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: 'Session expired or invalid' },
        { status: 403 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: 'Profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: user.specialty,
      gender: user.gender,
      status: user.status,
      avatarUrl: user.avatarUrl,
      loyaltyPoints: user.loyaltyPoints || 0
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Server error', error: err.message },
      { status: 500 }
    );
  }
}
