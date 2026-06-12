import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Conversation, User, isMock } = db as any;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerAge, customerGender, preferredSpecialty, preferredGender } = body;

    if (!customerAge || !customerGender || !preferredSpecialty || !preferredGender) {
      return NextResponse.json(
        { message: 'Please specify age, gender, specialist type, and gender preference.' },
        { status: 400 }
      );
    }

    // Match agent directly
    let selectedAgent = null;

    if (preferredGender === 'male') {
      selectedAgent = await User.findOne({ email: 'anil@nexoveda.com' });
    } else if (preferredGender === 'female') {
      selectedAgent = await User.findOne({ email: 'anamika@nexoveda.com' });
    } else {
      const anil = await User.findOne({ email: 'anil@nexoveda.com' });
      const anamika = await User.findOne({ email: 'anamika@nexoveda.com' });

      if (anil && anamika) {
        const anilChats = (await Conversation.find({ agent: anil._id, status: 'active' })).length;
        const anamikaChats = (await Conversation.find({ agent: anamika._id, status: 'active' })).length;
        selectedAgent = anilChats <= anamikaChats ? anil : anamika;
      } else {
        selectedAgent = anil || anamika;
      }
    }

    // Create conversation
    let newConv = await Conversation.create({
      customerName: 'Anonymous Customer',
      customerAge: Number(customerAge),
      customerGender,
      preferredSpecialty,
      preferredGender,
      agent: selectedAgent ? selectedAgent._id : null,
      status: selectedAgent ? 'active' : 'pending'
    });

    return NextResponse.json(newConv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Routing failed', error: err.message },
      { status: 500 }
    );
  }
}
