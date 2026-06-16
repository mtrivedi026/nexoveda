import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Conversation } = db as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    await connectDB();
    const room = await Conversation.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    }

    // Passive idle check: Close if inactive for > 30 mins
    if (room.status === 'pending' || room.status === 'active') {
      const lastActivity = new Date(room.lastMessageAt || room.updatedAt || room.createdAt).getTime();
      if (Date.now() - lastActivity > 30 * 60 * 1000) {
        room.status = 'closed';
        if (typeof room.save === 'function') {
          await room.save();
        } else {
          await Conversation.findByIdAndUpdate(roomId, { status: 'closed' });
        }
      }
    }
    
    // Populate agent manually if it is a Mongoose document
    let populatedRoom = room;
    if (typeof room.populate === 'function') {
      populatedRoom = await room.populate('agent');
    }
    
    return NextResponse.json(populatedRoom);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to fetch room', error: err.message },
      { status: 500 }
    );
  }
}
