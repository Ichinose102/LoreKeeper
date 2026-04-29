import { NextRequest, NextResponse } from 'next/server';
import { transcribeYouTubeVideo } from '@/lib/services/media.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ ok: false, error: 'URL is required' }, { status: 400 });
    }

    const result = await transcribeYouTubeVideo(url);
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error('Error transcribing YouTube video:', error);
    return NextResponse.json({ ok: false, error: 'Failed to transcribe video' }, { status: 500 });
  }
}
