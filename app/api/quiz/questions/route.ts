import { NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

const { connectDB, QuizQuestion } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

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
    const list = await QuizQuestion.find({});
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
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
    }

    const body = await request.json();
    const { _id, text, options, active } = body;

    if (!text || !options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ message: 'Missing text or options array.' }, { status: 400 });
    }

    let item;
    if (_id) {
      item = await QuizQuestion.findByIdAndUpdate(_id, { text, options, active: active !== false });
    } else {
      item = await QuizQuestion.create({ text, options, active: active !== false });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
