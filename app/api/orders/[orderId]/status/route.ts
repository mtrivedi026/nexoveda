import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const { connectDB, Order } = db as any;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: 'Session expired or invalid' },
        { status: 403 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { message: 'Access denied. Administrator privilege required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid shipment status values.' },
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { message: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to update order shipment status.', error: err.message },
      { status: 500 }
    );
  }
}
