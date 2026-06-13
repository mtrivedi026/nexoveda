import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

const { connectDB, Specialist } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

// Helper to check admin role
async function checkAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === 'admin') {
      return decoded;
    }
  } catch (err) {}
  return null;
}

export async function GET() {
  try {
    await connectDB();
    const list = await Specialist.find({});
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized. Admin permissions required.' }, { status: 403 });
    }

    const body = await request.json();
    const { _id, name, timing, active } = body;

    if (!name || !timing) {
      return NextResponse.json({ message: 'Missing name or timing.' }, { status: 400 });
    }

    let item;
    if (_id) {
      item = await Specialist.findByIdAndUpdate(_id, { name, timing, active: active !== false });
    } else {
      item = await Specialist.create({ name, timing, active: active !== false });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
