import { NextRequest, NextResponse } from 'next/server';
import { performOCR } from '@/lib/services/media.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'File is required' }, { status: 400 });
    }

    const result = await performOCR(file, file.name);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error('Error performing OCR:', error);
    return NextResponse.json({ ok: false, error: 'Failed to perform OCR' }, { status: 500 });
  }
}
