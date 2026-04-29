import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, createTag } from '@/lib/services/db.service';

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ ok: true, data: tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tag = await createTag(body.name);
    return NextResponse.json({ ok: true, data: tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create tag' }, { status: 500 });
  }
}
