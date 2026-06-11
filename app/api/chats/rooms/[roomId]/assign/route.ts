import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, Conversation, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
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

    if (decoded.role !== 'admin' && decoded.role !== 'agent') {
      return NextResponse.json(
        { message: 'Access denied: Admin or Agent privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { agentId } = body;

    if (decoded.role === 'agent' && decoded.userId !== agentId) {
      return NextResponse.json(
        { message: 'Access denied: Agents can only claim chats for themselves.' },
        { status: 403 }
      );
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return NextResponse.json(
        { message: 'Specialist agent not found.' },
        { status: 404 }
      );
    }

    const updatedConv = await Conversation.findByIdAndUpdate(
      roomId,
      { agent: agentId, status: 'active' },
      { new: true }
    );

    if (!updatedConv) {
      return NextResponse.json(
        { message: 'Conversation not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedConv);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to assign agent.', error: err.message },
      { status: 500 }
    );
  }
}
