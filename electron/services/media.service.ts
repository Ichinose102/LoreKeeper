import ytdl from 'ytdl-core';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { getDb } from './db.service';
import { transcriptionChunks, notes } from '../../drizzle/schema';
import { Note } from '../../shared/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranscriptionResult {
  note: Note;
  chunks: Array<{ timestamp_ms: number; text: string }>;
}

export async function transcribeYouTubeVideo(url: string): Promise<TranscriptionResult> {
  const info = await ytdl.getInfo(url);
  const videoDetails = info.videoDetails;

  const audioStream = ytdl(url, {
    quality: 'audioonly',
    filter: 'audioonly',
  });

  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const audioPath = path.join(tempDir, `${videoDetails.videoId}.mp3`);

  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(audioPath);
    audioStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'fr',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  fs.unlinkSync(audioPath);

  const noteId = crypto.randomUUID();
  const now = new Date();

  const fullText = transcription.text || '';

  const noteResult = getDb()
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
    .returning()
    .get();

  const chunks: Array<{ timestamp_ms: number; text: string }> = [];

  const segments = (transcription as any).segments ?? [];
  for (const segment of segments) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: Math.round(segment.start * 1000),
      text: segment.text,
    };
    getDb().insert(transcriptionChunks).values(chunk).run();
    chunks.push({ timestamp_ms: chunk.timestamp_ms, text: chunk.text });
  }

  if (chunks.length === 0) {
    const chunk = {
      id: crypto.randomUUID(),
      note_id: noteId,
      timestamp_ms: 0,
      text: fullText,
    };
    getDb().insert(transcriptionChunks).values(chunk).run();
    chunks.push({ timestamp_ms: 0, text: fullText });
  }

  return {
    note: noteResult as unknown as Note,
    chunks,
  };
}
