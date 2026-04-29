import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/lib/services/search.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const results = await searchService.search(query);
    return NextResponse.json({ ok: true, data: results });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ ok: false, error: 'Search failed' }, { status: 500 });
  }
}
