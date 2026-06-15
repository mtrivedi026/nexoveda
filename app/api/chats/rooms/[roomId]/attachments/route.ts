import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const body = await request.json();
    const { filename } = body;
    return NextResponse.json({
      uploadUrl: `/api/upload/mock`,
      fileUrl: `/symptom_report.pdf`
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Attachment simulation failed.', error: err.message },
      { status: 500 }
    );
  }
}
