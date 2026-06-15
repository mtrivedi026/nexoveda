import { NextResponse } from 'next/server';
import db from '@/lib/db';

const { connectDB, Product } = db as any;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const productId = (await params).id;
    
    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully', id: productId }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Failed to delete product.', error: err.message },
      { status: 500 }
    );
  }
}
