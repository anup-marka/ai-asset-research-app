import { z } from 'zod';

const AV_BASE = 'https://www.alphavantage.co/query';

function getKey() {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) throw new Error('Missing ALPHAVANTAGE_API_KEY');
  return key;
}

export type IntradayPoint = { time: string; close: number };

/**
 * 1D intraday series (5min). Alpha Vantage has rate limits; keep calls minimal.
 */
export async function fetchIntraday1D(ticker: string): Promise<IntradayPoint[]> {
  const symbol = ticker.toUpperCase();
  const url = new URL(AV_BASE);
  url.searchParams.set('function', 'TIME_SERIES_INTRADAY');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', '5min');
  url.searchParams.set('outputsize', 'compact');
  url.searchParams.set('apikey', getKey());

  const res = await fetch(url.toString(), {
    // cache lightly to reduce rate limits during dev
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  const json = await res.json();

  if (json?.Note) throw new Error(`Alpha Vantage rate limit: ${json.Note}`);
  if (json?.Error) throw new Error(`Alpha Vantage error: ${json.Error}`);

  const seriesKey = Object.keys(json).find((k) => k.toLowerCase().includes('time series'));
  if (!seriesKey) throw new Error('Alpha Vantage response missing time series');

  const series = json[seriesKey] as Record<string, Record<string, string>>;

  const pointSchema = z.object({
    '4. close': z.string(),
  });

  const points: IntradayPoint[] = Object.entries(series)
    .map(([time, v]) => {
      const parsed = pointSchema.safeParse(v);
      if (!parsed.success) return null;
      const close = Number(parsed.data['4. close']);
      if (!Number.isFinite(close)) return null;
      return { time, close };
    })
    .filter((x): x is IntradayPoint => Boolean(x))
    .sort((a, b) => a.time.localeCompare(b.time));

  return points;
}

export type Overview = {
  symbol: string;
  name: string;
  marketCap?: string;
  peRatio?: string;
  weekHigh52?: string;
  weekLow52?: string;
};

export async function fetchOverview(ticker: string): Promise<Overview> {
  const symbol = ticker.toUpperCase();
  const url = new URL(AV_BASE);
  url.searchParams.set('function', 'OVERVIEW');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', getKey());

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  const json = await res.json();

  if (json?.Note) throw new Error(`Alpha Vantage rate limit: ${json.Note}`);
  if (!json?.Symbol) {
    // Often empty object for unknown symbol.
    return { symbol, name: symbol };
  }

  return {
    symbol,
    name: json.Name ?? symbol,
    marketCap: json.MarketCapitalization,
    peRatio: json.PERatio,
    weekHigh52: json['52WeekHigh'],
    weekLow52: json['52WeekLow'],
  };
}
