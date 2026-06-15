import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and add timestamp
    const ext = path.extname(file.name);
    const sanitizedName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '') + '-' + Date.now() + ext;
    
    // Save to public/image folder
    const uploadDir = path.join(process.cwd(), 'public', 'image');
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, sanitizedName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/image/${sanitizedName}`;

    return NextResponse.json({ url: fileUrl }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { message: 'Failed to upload file.', error: error.message },
      { status: 500 }
    );
  }
}
