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

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required.' },
        { status: 403 }
      );
    }

    const agents = await User.find({ role: 'agent' });
    return NextResponse.json(agents);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to list agents.', error: err.message },
      { status: 500 }
    );
  }
}
