import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Promo code is required.' },
        { status: 400 }
      );
    }

    const activeCode = code.trim().toUpperCase();
    let discountPercent = 0;

    if (activeCode === 'NEXO10') {
      discountPercent = 10;
    } else if (activeCode === 'WELCOME15') {
      discountPercent = 15;
    } else {
      return NextResponse.json(
        { message: 'Invalid coupon code.' },
        { status: 400 }
      );
    }

    const sub = Number(subtotal) || 0;
    const discountValue = Number((sub * (discountPercent / 100)).toFixed(2));

    return NextResponse.json({
      code: activeCode,
      discountPercent,
      discountValue
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Server error', error: err.message },
      { status: 500 }
    );
  }
}
