'use client';

import { useEffect, useMemo, useState } from 'react';

type Note = { id: string; ticker: string; content: string; updated_at: string };

export default function Notes({ ticker }: { ticker: string }) {
  const symbol = useMemo(() => ticker.toUpperCase(), [ticker]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const res = await fetch(`/api/notes?ticker=${encodeURIComponent(symbol)}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json?.error ?? 'Failed to load notes');
      return;
    }
    setNotes(json.notes ?? []);
  }

  async function addNote() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ticker: symbol, content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'Failed to add note');
      setContent('');
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Notes</h2>
      <p style={{ color: '#666', marginTop: 4 }}>
        MVP implementation uses Supabase (server route). If Supabase env vars aren’t set, this will error.
      </p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Add a note for ${symbol}…`}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button onClick={addNote} disabled={loading} style={{ padding: '10px 14px', borderRadius: 8 }}>
          {loading ? 'Saving…' : 'Add'}
        </button>
      </div>

      {error ? <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div> : null}

      <ul style={{ marginTop: 12, paddingLeft: 18 }}>
        {notes.map((n) => (
          <li key={n.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(n.updated_at).toLocaleString()}</div>
            <div>{n.content}</div>
          </li>
        ))}
      </ul>

      {!notes.length ? <div style={{ marginTop: 8, color: '#666' }}>No notes yet.</div> : null}
    </section>
  );
}
