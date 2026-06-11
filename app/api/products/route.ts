import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Product } = db as any;

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to list products.', error: err.message },
      { status: 500 }
    );
  }
}
