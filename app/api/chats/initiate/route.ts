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

    if (Number(customerAge) < 18) {
      return NextResponse.json(
        { message: 'Consultation is only available for individuals aged 18 and older.' },
        { status: 400 }
      );
    }

    // Match agent directly
    let selectedAgent = null;

    if (preferredSpecialty === 'mental_health') {
      selectedAgent = await User.findOne({ email: 'smita@nexoveda.com' });
    } else {
      if (preferredGender === 'male') {
        selectedAgent = await User.findOne({ email: 'harsh@nexoveda.com' });
      } else if (preferredGender === 'female') {
        selectedAgent = await User.findOne({ email: 'anamika@nexoveda.com' });
      } else {
        const harsh = await User.findOne({ email: 'harsh@nexoveda.com' });
        const anamika = await User.findOne({ email: 'anamika@nexoveda.com' });

        if (harsh && anamika) {
          const harshChats = (await Conversation.find({ agent: harsh._id, status: 'active' })).length;
          const anamikaChats = (await Conversation.find({ agent: anamika._id, status: 'active' })).length;
          selectedAgent = harshChats <= anamikaChats ? harsh : anamika;
        } else {
          selectedAgent = harsh || anamika;
        }
      }
    }

    // Generate unique reference number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referenceNumber = 'NEXO-';
    for (let i = 0; i < 5; i++) {
      referenceNumber += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create conversation
    let newConv = await Conversation.create({
      customerName: 'Anonymous Customer',
      customerAge: Number(customerAge),
      customerGender,
      preferredSpecialty,
      preferredGender,
      referenceNumber,
      agent: selectedAgent ? selectedAgent._id : null,
      status: selectedAgent ? 'active' : 'pending'
    });

    // Trigger email and whatsapp alerts asynchronously
    try {
      const { sendConsultationNotification } = require('@/lib/notification');
      sendConsultationNotification(newConv).catch(console.error);
    } catch (notifErr) {
      console.error('Failed to trigger consultation alert notification:', notifErr);
    }

    return NextResponse.json(newConv, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Routing failed', error: err.message },
      { status: 500 }
    );
  }
}
