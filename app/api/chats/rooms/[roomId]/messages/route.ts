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
    const jsonMessages = messages.map((m: any) => m.toJSON ? m.toJSON() : m);
    return NextResponse.json(jsonMessages);
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

    const jsonNewMessage = newMessage.toJSON ? newMessage.toJSON() : newMessage;
    return NextResponse.json(jsonNewMessage, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to send message', error: err.message },
      { status: 500 }
    );
  }
}
