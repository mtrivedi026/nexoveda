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

    // Create conversation
    let newConv = await Conversation.create({
      customerName: 'Anonymous Customer',
      customerAge: Number(customerAge),
      customerGender,
      preferredSpecialty,
      preferredGender,
      status: 'pending'
    });

    // Matching algorithm: Select strictly from our two allowed consultants
    const query: any = {
      role: 'agent',
      email: { $in: ['anamika@nexoveda.com', 'anil@nexoveda.com'] }
    };
    if (preferredGender === 'male') {
      query.gender = 'male';
    } else if (preferredGender === 'female') {
      query.gender = 'female';
    }

    const onlineAgents = await User.find(query);

    if (onlineAgents.length > 0) {
      let selectedAgent = null;
      let minActiveChats = Infinity;

      // Choose agent with least active conversations
      for (const agent of onlineAgents) {
        const activeChats = await Conversation.find({
          agent: agent._id,
          status: 'active'
        });
        if (activeChats.length < minActiveChats) {
          minActiveChats = activeChats.length;
          selectedAgent = agent;
        }
      }

      if (selectedAgent) {
        newConv = await Conversation.findByIdAndUpdate(
          newConv._id,
          { agent: selectedAgent._id, status: 'active' },
          { new: true }
        );
      }
    }

    return NextResponse.json(newConv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Routing failed', error: err.message },
      { status: 500 }
    );
  }
}
