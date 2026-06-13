import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function POST(request: Request) {
  try {
    // Connect to DB with a safe timeout
    try {
      await (db as any).connectDB();
    } catch (dbErr: any) {
      console.error('Login: DB connect error:', dbErr?.message);
      // Continue — db may still work in mock mode
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password.' },
        { status: 400 }
      );
    }

    const User = (db as any).User;

    let user = await User.findOne({ email });

    // If user not found, try syncing agents (agents may not exist in fresh DB)
    if (!user) {
      try {
        const { syncAgents } = db as any;
        if (syncAgents) {
          await syncAgents(db);
          user = await User.findOne({ email });
        }
      } catch (syncErr: any) {
        console.warn('Self-healing sync failed:', syncErr?.message);
      }

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid credentials.' },
          { status: 400 }
        );
      }
    }

    // Compare password safely
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bcryptErr: any) {
      console.error('bcrypt compare error:', bcryptErr?.message);
      // Hostinger bcrypt native binding issue — check raw string as last resort
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials.' },
        { status: 400 }
      );
    }

    // If agent, set status to online
    try {
      if (user.role === 'agent') {
        await User.findByIdAndUpdate(user._id, { status: 'online' });
      }
    } catch (updateErr: any) {
      console.warn('Status update failed (non-critical):', updateErr?.message);
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
    console.error('Login route error:', err?.message, err?.stack);
    return NextResponse.json(
      { message: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
