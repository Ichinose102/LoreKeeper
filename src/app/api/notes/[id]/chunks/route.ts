import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transcriptionChunks } from '@/../drizzle/schema';
import { eq } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const chunks = await db
      .select()
      .from(transcriptionChunks)
      .where(eq(transcriptionChunks.note_id, id));

    return NextResponse.json({ ok: true, data: chunks });
  } catch (error) {
    console.error('Error fetching chunks:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch chunks' }, { status: 500 });
  }
}
