import Notes from './Notes';
import PriceChart from './PriceChart';
import { fetchDailySeries, fetchGlobalQuote, fetchOverview } from '@/lib/alphaVantage';

function formatMaybeNumber(n?: string) {
  if (!n) return '—';
  const num = Number(n);
  if (!Number.isFinite(num)) return n;
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(num);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default async function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  let overview: Awaited<ReturnType<typeof fetchOverview>> | null = null;
  let quote: Awaited<ReturnType<typeof fetchGlobalQuote>> | null = null;
  let daily: Awaited<ReturnType<typeof fetchDailySeries>> | null = null;
  let error: string | null = null;

  // Alpha Vantage free tier is very rate-limited. Avoid parallel requests.
  try {
    overview = await fetchOverview(symbol);
    await sleep(1100);
    quote = await fetchGlobalQuote(symbol);
    await sleep(1100);
    daily = await fetchDailySeries(symbol, 90);
  } catch (e: any) {
    error = e?.message ?? 'Failed to load data';
  }

  const lastDaily = daily?.at(-1)?.close;

  return (
    <main>
      <h1>{symbol}</h1>
      <p style={{ color: '#555' }}>{overview?.name ?? symbol}</p>

      {error ? (
        <div style={{ marginTop: 12, padding: 12, border: '1px solid #f3c2c2', background: '#fff5f5', borderRadius: 8 }}>
          <strong>Data error:</strong> {error}
          <div style={{ marginTop: 6, color: '#666' }}>
            Alpha Vantage free tier is strict (roughly 1 req/sec + daily quota). If you just refreshed a few times,
            wait a minute and reload.
          </div>
        </div>
      ) : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
        <Metric label="Price (Global Quote)" value={quote?.price ? `$${Number(quote.price).toFixed(2)}` : '—'} />
        <Metric label="Change" value={quote?.changePercent ?? '—'} />
        <Metric label="Last trading day" value={quote?.latestTradingDay ?? '—'} />
        <Metric label="Market Cap" value={formatMaybeNumber(overview?.marketCap)} />
        <Metric label="P/E" value={overview?.peRatio ?? '—'} />
        <Metric label="Daily last close" value={lastDaily != null ? `$${lastDaily.toFixed(2)}` : '—'} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Price history (Daily)</h2>
        <p style={{ color: '#666', marginTop: 4 }}>
          Free-tier scope: daily closes (no intraday 1D).
        </p>
        <div style={{ marginTop: 10 }}>
          <PriceChart points={daily ?? []} />
        </div>
      </section>

      <Notes ticker={symbol} />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
