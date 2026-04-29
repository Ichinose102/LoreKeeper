import { NextRequest, NextResponse } from 'next/server';
import { getAllNotes, createNote } from '@/lib/services/db.service';
import { NoteInput } from '@shared/types';

export async function GET() {
  try {
    const notes = await getAllNotes();
    return NextResponse.json({ ok: true, data: notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: NoteInput = {
      title: body.title,
      type: body.type,
      content: body.content ?? '',
      url: body.url ?? null,
      era: body.era ?? null,
    };

    const note = await createNote(input);
    return NextResponse.json({ ok: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create note' }, { status: 500 });
  }
}
