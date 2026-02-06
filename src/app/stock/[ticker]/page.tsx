import { getMockStockSnapshot } from '@/lib/mockData';

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const snap = getMockStockSnapshot(ticker);

  return (
    <main>
      <h1>{snap.ticker}</h1>
      <p style={{ color: '#555' }}>{snap.companyName}</p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        {snap.metrics.map((m) => (
          <div key={m.label} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{m.value}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Notes</h2>
        <p style={{ color: '#666' }}>
          Notes storage TBD (local storage for MVP or a simple DB). For now, this is a placeholder.
        </p>
      </section>
    </main>
  );
}
