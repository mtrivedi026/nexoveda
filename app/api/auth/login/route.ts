import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, User } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password.' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email });
    if (!user) {
      try {
        const { syncAgents } = db as any;
        if (syncAgents) {
          await syncAgents(db);
          user = await User.findOne({ email });
        }
      } catch (syncErr) {
        console.warn('Self-healing sync failed:', syncErr);
      }
      
      if (!user) {
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 400 }
        );
      }
    }

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      try {
        const { syncAgents } = db as any;
        if (syncAgents) {
          await syncAgents(db);
          const retriedUser = await User.findOne({ email });
          if (retriedUser) {
            user = retriedUser;
            isMatch = await bcrypt.compare(password, user.password);
          }
        }
      } catch (syncErr) {
        console.warn('Self-healing sync failed:', syncErr);
      }

      if (!isMatch) {
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 400 }
        );
      }
    }

    // If user is support staff, set status to online upon login
    if (user.role === 'agent') {
      await User.findByIdAndUpdate(user._id, { status: 'online' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        gender: user.gender
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        gender: user.gender,
        status: user.status || 'offline',
        avatarUrl: user.avatarUrl,
        loyaltyPoints: user.loyaltyPoints || 0
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Server error', error: err.message },
      { status: 500 }
    );
  }
}
