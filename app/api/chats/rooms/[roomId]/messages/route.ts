import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Message } = db as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    await connectDB();
    const messages = await Message.find({ conversation: roomId });
    return NextResponse.json(messages);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to fetch messages', error: err.message },
      { status: 500 }
    );
  }
}
