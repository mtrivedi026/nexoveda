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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    await connectDB();
    const body = await request.json();
    const { sender, senderName, text, attachmentUrl } = body;

    if (!sender || !senderName || !text) {
      return NextResponse.json(
        { message: 'Missing sender, senderName, or text' },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      conversation: roomId,
      sender,
      senderName,
      text,
      attachmentUrl: attachmentUrl || null
    });

    const { Conversation } = db as any;
    if (Conversation) {
      await Conversation.findByIdAndUpdate(roomId, { lastMessageAt: new Date() });
    }

    return NextResponse.json(newMessage, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to send message', error: err.message },
      { status: 500 }
    );
  }
}
