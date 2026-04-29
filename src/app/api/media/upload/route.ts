import { NextRequest, NextResponse } from 'next/server';
import { transcribeFile, performOCR } from '@/lib/services/media.service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'File is required' }, { status: 400 });
    }

    if (type === 'ocr') {
      const result = await performOCR(file, file.name);
      return NextResponse.json({ ok: true, data: result });
    } else {
      const result = await transcribeFile(file, file.name);
      return NextResponse.json({ ok: true, data: result });
    }
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process file' }, { status: 500 });
  }
}
