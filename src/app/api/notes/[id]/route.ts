import { NextRequest, NextResponse } from 'next/server';
import { getNoteById, updateNote, deleteNote } from '@/lib/services/db.service';
import { NoteInput } from '@shared/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const note = await getNoteById(id);

    if (!note) {
      return NextResponse.json({ ok: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const patch: Partial<NoteInput> = {
      title: body.title,
      type: body.type,
      content: body.content,
      url: body.url,
      era: body.era,
    };

    const note = await updateNote(id, patch);

    if (!note) {
      return NextResponse.json({ ok: false, error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteNote(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
