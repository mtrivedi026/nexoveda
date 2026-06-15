import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '@/lib/db';

const { connectDB, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function PUT(request: Request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Session expired or invalid' }, { status: 403 });
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required.' }, { status: 403 });
    }

    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json({ message: 'User ID and new password are required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Supports both Mongoose and Mock DB
    if (User.findByIdAndUpdate) {
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
    } else if (User.updateOne) {
      await User.updateOne({ _id: userId }, { password: hashedPassword });
    }

    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to update password.', error: err.message },
      { status: 500 }
    );
  }
}
