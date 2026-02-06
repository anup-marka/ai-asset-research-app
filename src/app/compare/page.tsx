import { getMockStockSnapshot } from '@/lib/mockData';

function parseTickers(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.tickers;
  const str = Array.isArray(raw) ? raw[0] : raw;
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 5);
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tickers = parseTickers(sp);

  const snaps = tickers.length
    ? tickers.map(getMockStockSnapshot)
    : [getMockStockSnapshot('AAPL'), getMockStockSnapshot('MSFT')];

  const metricLabels = snaps[0].metrics.map((m) => m.label);

  return (
    <main>
      <h1>Compare</h1>
      <p style={{ color: '#666' }}>Tickers: {snaps.map((s) => s.ticker).join(', ')}</p>

      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Metric</th>
              {snaps.map((s) => (
                <th key={s.ticker} style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                  {s.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metricLabels.map((label) => (
              <tr key={label}>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{label}</td>
                {snaps.map((s) => (
                  <td key={s.ticker + label} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                    {s.metrics.find((m) => m.label === label)?.value ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 16, color: '#666' }}>Data is mocked for now—next step is wiring a real provider.</p>
    </main>
  );
}
