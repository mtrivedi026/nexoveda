import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, Conversation, User } = db as any;
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

    const { role, userId } = decoded;
    let rooms: any[] = [];

    if (role === 'admin') {
      rooms = await Conversation.find({ status: { $in: ['pending', 'active'] } });
    } else if (role === 'agent') {
      const agentProfile = await User.findById(userId);
      if (agentProfile) {
        rooms = await Conversation.find({
          $or: [
            { agent: userId, status: 'active' },
            { status: 'pending', preferredSpecialty: agentProfile.specialty }
          ]
        });
      }
    } else {
      rooms = await Conversation.find({ customer: userId });
    }

    return NextResponse.json(rooms);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to fetch rooms', error: err.message },
      { status: 500 }
    );
  }
}
