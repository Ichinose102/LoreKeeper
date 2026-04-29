import ytdl from 'ytdl-core';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { getDb } from './db.service';
import { transcriptionChunks, notes } from '../../drizzle/schema';
import { Note } from '../../shared/types';
import { randomUUID } from 'crypto';

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

interface FileData {
  name: string;
  type: string;
  buffer: ArrayBuffer;
}

export async function transcribeFile(fileData: FileData): Promise<TranscriptionResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const buffer = Buffer.from(fileData.buffer);
  const ext = path.extname(fileData.name).toLowerCase();
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
  const videoExtensions = ['.mp4', '.webm', '.avi', '.mov'];

  let audioPath: string;

  if (audioExtensions.includes(ext)) {
    audioPath = path.join(tempDir, `${randomUUID()}${ext}`);
    fs.writeFileSync(audioPath, buffer);
  } else if (videoExtensions.includes(ext)) {
    // OpenAI Whisper API accepts video files directly
    const videoId = randomUUID();
    audioPath = path.join(tempDir, `${videoId}${ext}`);
    fs.writeFileSync(audioPath, buffer);
  } else {
    throw new Error(`Format audio non supporté : ${ext}`);
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'fr',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    fs.unlinkSync(audioPath);

    const noteId = randomUUID();
    const now = new Date();

    const fullText = transcription.text || '';

    const noteResult = getDb()
      .insert(notes)
      .values({
        id: noteId,
        title: file.name.replace(ext, ''),
        type: 'video',
        content: fullText,
        url: null,
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
        id: randomUUID(),
        note_id: noteId,
        timestamp_ms: Math.round(segment.start * 1000),
        text: segment.text,
      };
      getDb().insert(transcriptionChunks).values(chunk).run();
      chunks.push({ timestamp_ms: chunk.timestamp_ms, text: chunk.text });
    }

    if (chunks.length === 0) {
      const chunk = {
        id: randomUUID(),
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
  } catch (error) {
    fs.unlinkSync(audioPath);
    throw error;
  }
}

export async function performOCR(fileData: FileData): Promise<OCRResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const buffer = Buffer.from(fileData.buffer);
  const base64Image = buffer.toString('base64');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extrais tout le texte visible dans cette image. Retourne uniquement le texte extrait, sans commentaires.' },
          { type: 'image_url', image_url: { url: `data:image/${path.extname(file.name).slice(1)};base64,${base64Image}` } },
        ],
      },
    ],
    max_tokens: 2000,
  });

  const extractedText = response.choices[0]?.message?.content || 'Aucun texte détecté';

  const noteId = randomUUID();
  const now = new Date();

  const noteResult = getDb()
    .insert(notes)
    .values({
      id: noteId,
      title: file.name.replace(path.extname(file.name), ''),
      type: 'ocr',
      content: extractedText,
      url: null,
      era: null,
      created_at: now,
      updated_at: now,
    })
    .returning()
    .get();

  return {
    note: noteResult as unknown as Note,
    text: extractedText,
  };
}
