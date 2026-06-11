import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function POST(request: Request) {
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

    if (decoded.role !== 'agent') {
      return NextResponse.json(
        { message: 'Agent only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const updatedAgent = await User.findByIdAndUpdate(
      decoded.userId,
      { status },
      { new: true }
    );

    if (!updatedAgent) {
      return NextResponse.json(
        { message: 'Agent profile not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAgent);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to update status', error: err.message },
      { status: 500 }
    );
  }
}
