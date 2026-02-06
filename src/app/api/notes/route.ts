import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const NoteSchema = z.object({
  ticker: z.string().min(1).max(10),
  content: z.string().min(0).max(5000),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = (searchParams.get('ticker') ?? '').trim().toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });

  const sb = supabaseServer();
  const { data, error } = await sb
    .from('notes')
    .select('id,ticker,content,updated_at')
    .eq('ticker', ticker)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = NoteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid payload' }, { status: 400 });

  const sb = supabaseServer();
  const row = {
    ticker: parsed.data.ticker.trim().toUpperCase(),
    content: parsed.data.content,
  };

  const { data, error } = await sb
    .from('notes')
    .insert(row)
    .select('id,ticker,content,updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
