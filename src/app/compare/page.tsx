import Link from 'next/link';
import { fetchOverview, type Overview } from '@/lib/alphaVantage';

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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function formatMaybeNumber(n?: string) {
  if (!n) return '—';
  const num = Number(n);
  if (!Number.isFinite(num)) return n;
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
}

async function fetchOverviewsThrottled(symbols: string[]) {
  const out: Array<{ symbol: string; overview: Overview } | { symbol: string; error: string }> = [];
  for (let i = 0; i < symbols.length; i++) {
    const s = symbols[i];
    try {
      const overview = await fetchOverview(s);
      out.push({ symbol: s, overview });
    } catch (e: any) {
      out.push({ symbol: s, error: e?.message ?? 'Failed' });
    }
    if (i < symbols.length - 1) await sleep(1100);
  }
  return out;
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const tickers = parseTickers(sp);
  const symbols = tickers.length ? tickers : ['AAPL', 'MSFT'];

  const results = await fetchOverviewsThrottled(symbols);

  const rows: Array<{ label: string; value: (r: (typeof results)[number]) => string }> = [
    {
      label: 'Company',
      value: (r) => ('overview' in r ? r.overview.name : '—'),
    },
    {
      label: 'Market Cap',
      value: (r) => ('overview' in r ? formatMaybeNumber(r.overview.marketCap) : '—'),
    },
    {
      label: 'P/E',
      value: (r) => ('overview' in r ? r.overview.peRatio ?? '—' : '—'),
    },
    {
      label: '52W High',
      value: (r) => ('overview' in r ? (r.overview.weekHigh52 ? `$${r.overview.weekHigh52}` : '—') : '—'),
    },
    {
      label: '52W Low',
      value: (r) => ('overview' in r ? (r.overview.weekLow52 ? `$${r.overview.weekLow52}` : '—') : '—'),
    },
  ];

  const anyErrors = results.filter((r) => 'error' in r);

  return (
    <main>
      <h1>Compare</h1>
      <p style={{ color: '#666', marginTop: 6 }}>
        Tip: edit the URL like <code>?tickers=AAPL,MSFT,GOOGL</code> (max 5).
      </p>

      {anyErrors.length ? (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #f3c2c2', background: '#fff5f5', borderRadius: 8 }}>
          <strong>Some data failed to load:</strong>
          <ul style={{ marginTop: 8 }}>
            {anyErrors.map((e) => (
              <li key={e.symbol}>
                {e.symbol}: {e.error}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8, color: '#666' }}>
            Alpha Vantage free tier is strict (roughly 1 req/sec + daily quota). If you refreshed a few times, wait a minute and reload.
          </div>
        </div>
      ) : null}

      <div style={{ overflowX: 'auto', marginTop: 16, border: '1px solid #eee', borderRadius: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={thStyle}>Metric</th>
              {results.map((r) => (
                <th key={r.symbol} style={thStyle}>
                  <Link href={`/stock/${r.symbol}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {r.symbol}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={tdStyleMuted}>{row.label}</td>
                {results.map((r) => (
                  <td key={r.symbol + row.label} style={tdStyle}>
                    {row.value(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, color: '#666' }}>
        Next improvements: show price + daily performance once we pick a free endpoint strategy that won’t trip limits.
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #eee',
  padding: '10px 12px',
  fontSize: 13,
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #f3f3f3',
  padding: '10px 12px',
  fontSize: 14,
  verticalAlign: 'top',
};

const tdStyleMuted: React.CSSProperties = {
  ...tdStyle,
  color: '#666',
  width: 160,
};
