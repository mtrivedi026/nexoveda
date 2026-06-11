import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Conversation } = db as any;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    await connectDB();
    const updatedConv = await Conversation.findByIdAndUpdate(
      roomId,
      { status: 'closed' },
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
      { message: 'Failed to close conversation.', error: err.message },
      { status: 500 }
    );
  }
}
