import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Product } = db as any;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const { author, location, rating, text } = body;

    if (!author || !rating || !text) {
      return NextResponse.json(
        { message: 'Missing rating, review text or nickname.' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    const newReview = {
      author,
      location: location || 'Global',
      rating: Number(rating),
      text,
      date: new Date().toISOString().split('T')[0]
    };

    const reviews = product.reviews || [];
    reviews.push(newReview);

    // Recalculate average rating & count
    const totalRatingSum = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const avgRating = Number((totalRatingSum / reviews.length).toFixed(1));

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        reviews,
        rating: avgRating,
        reviewCount: reviews.length
      },
      { new: true }
    );

    return NextResponse.json(updatedProduct, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to submit review.', error: err.message },
      { status: 500 }
    );
  }
}
