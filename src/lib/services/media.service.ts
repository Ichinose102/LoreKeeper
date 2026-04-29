import ytdl from 'ytdl-core';
import OpenAI from 'openai';
import { db } from '../lib/db';
import { transcriptionChunks, notes } from '../../../drizzle/schema';
import { Note } from '../../../shared/types';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptionResult {
  note: Note;
  chunks: Array<{ timestamp_ms: number; text: string }>;
}

interface OCRResult {
  note: Note;
  text: string;
}

export async function transcribeYouTubeVideo(url: string): Promise<TranscriptionResult> {
  const info = await ytdl.getInfo(url);
  const videoDetails = info.videoDetails;

  const audioStream = ytdl(url, {
    quality: 'audioonly',
    filter: 'audioonly',
  });

  // Collect audio data in memory instead of writing to disk
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('end', () => resolve());
    audioStream.on('error', reject);
  });

  const audioBuffer = Buffer.concat(chunks);
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const file = new File([audioBlob], `${videoDetails.videoId}.mp3`, { type: 'audio/mpeg' });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'fr',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  const noteId = crypto.randomUUID();
  const now = new Date();

  const fullText = transcription.text || '';

  const [noteResult] = await db
    .insert(notes)
    .values({
      id: noteId,
      title: videoDetails.title || 'Vidéo YouTube',
      type: 'video',
      content: fullText,
      url: url,
      era: null,
      created_at: now,
      updated_at: now,
    })
    .returning();

  const segmentChunks: Array<{ timestamp_ms: number; text: string }> = [];

  const segments = (transcription as any).segments ?? [];
  for (const segment of segments) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: Math.round(segment.start * 1000),
      text: segment.text,
    };
    await db.insert(transcriptionChunks).values(chunk);
    segmentChunks.push({ timestamp_ms: chunk.timestamp_ms, text: chunk.text });
  }

  if (segmentChunks.length === 0) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: 0,
      text: fullText,
    };
    await db.insert(transcriptionChunks).values(chunk);
    segmentChunks.push({ timestamp_ms: 0, text: fullText });
  }

  return {
    note: noteResult as unknown as Note,
    chunks: segmentChunks,
  };
}

export async function transcribeFile(file: File, fileName: string): Promise<TranscriptionResult> {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'fr',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  const noteId = crypto.randomUUID();
  const now = new Date();

  const fullText = transcription.text || '';

  const [noteResult] = await db
    .insert(notes)
    .values({
      id: noteId,
      title: fileName.replace(/\.[^/.]+$/, ''),
      type: 'video',
      content: fullText,
      url: null,
      era: null,
      created_at: now,
      updated_at: now,
    })
    .returning();

  const segmentChunks: Array<{ timestamp_ms: number; text: string }> = [];

  const segments = (transcription as any).segments ?? [];
  for (const segment of segments) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: Math.round(segment.start * 1000),
      text: segment.text,
    };
    await db.insert(transcriptionChunks).values(chunk);
    segmentChunks.push({ timestamp_ms: chunk.timestamp_ms, text: chunk.text });
  }

  if (segmentChunks.length === 0) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: 0,
      text: fullText,
    };
    await db.insert(transcriptionChunks).values(chunk);
    segmentChunks.push({ timestamp_ms: 0, text: fullText });
  }

  return {
    note: noteResult as unknown as Note,
    chunks: segmentChunks,
  };
}

export async function performOCR(file: File, fileName: string): Promise<OCRResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64Image = buffer.toString('base64');
  const ext = fileName.split('.').pop() || 'png';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extrais tout le texte visible dans cette image. Retourne uniquement le texte extrait, sans commentaires.' },
          { type: 'image_url', image_url: { url: `data:image/${ext};base64,${base64Image}` } },
        ],
      },
    ],
    max_tokens: 2000,
  });

  const extractedText = response.choices[0]?.message?.content || 'Aucun texte détecté';

  const noteId = crypto.randomUUID();
  const now = new Date();

  const [noteResult] = await db
    .insert(notes)
    .values({
      id: noteId,
      title: fileName.replace(/\.[^/.]+$/, ''),
      type: 'ocr',
      content: extractedText,
      url: null,
      era: null,
      created_at: now,
      updated_at: now,
    })
    .returning();

  return {
    note: noteResult as unknown as Note,
    text: extractedText,
  };
}
