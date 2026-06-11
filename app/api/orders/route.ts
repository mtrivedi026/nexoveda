import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Order, User } = db as any;

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      suburb,
      state,
      postcode,
      items,
      subtotal,
      shippingCost,
      total,
      redeemedPoints,
      customerId
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !suburb || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required shipping or items parameters.' },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      suburb,
      state,
      postcode,
      items,
      subtotal: Number(subtotal),
      shippingCost: Number(shippingCost),
      total: Number(total),
      status: 'pending'
    });

    // Deduct loyalty points and credit new points
    if (customerId) {
      const user = await User.findById(customerId);
      if (user) {
        let points = user.loyaltyPoints || 0;
        const redeemed = Number(redeemedPoints) || 0;
        if (redeemed > 0) {
          points = Math.max(0, points - redeemed);
        }
        // Earn 5% credit on current purchase total
        const pointsEarned = Number(total) * 0.05;
        const finalPoints = Number((points + pointsEarned).toFixed(2));
        await User.findByIdAndUpdate(customerId, { loyaltyPoints: finalPoints });
      }
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to place order.', error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({});
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to list orders.', error: err.message },
      { status: 500 }
    );
  }
}
