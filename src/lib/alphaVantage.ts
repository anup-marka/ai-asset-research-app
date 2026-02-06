import { z } from 'zod';

const AV_BASE = 'https://www.alphavantage.co/query';

function getKey() {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) throw new Error('Missing ALPHAVANTAGE_API_KEY');
  return key;
}

export type SeriesPoint = { date: string; close: number };

/**
 * Daily series (free endpoint). Use last N points for a simple chart.
 */
export async function fetchDailySeries(symbolRaw: string, limit = 60): Promise<SeriesPoint[]> {
  const symbol = symbolRaw.toUpperCase();
  const url = new URL(AV_BASE);
  url.searchParams.set('function', 'TIME_SERIES_DAILY');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('outputsize', 'compact');
  url.searchParams.set('apikey', getKey());

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  const json = await res.json();

  if (json?.Note) throw new Error(`Alpha Vantage rate limit: ${json.Note}`);
  if (json?.Information) throw new Error(`Alpha Vantage info: ${json.Information}`);

  const seriesKey = Object.keys(json).find((k) => k.toLowerCase().includes('time series'));
  if (!seriesKey) throw new Error('Alpha Vantage response missing time series');

  const series = json[seriesKey] as Record<string, Record<string, string>>;
  const pointSchema = z.object({ '4. close': z.string() });

  const points: SeriesPoint[] = Object.entries(series)
    .map(([date, v]) => {
      const parsed = pointSchema.safeParse(v);
      if (!parsed.success) return null;
      const close = Number(parsed.data['4. close']);
      if (!Number.isFinite(close)) return null;
      return { date, close };
    })
    .filter((x): x is SeriesPoint => Boolean(x))
    .sort((a, b) => a.date.localeCompare(b.date));

  return points.slice(-limit);
}

export type Quote = {
  symbol: string;
  price?: string;
  change?: string;
  changePercent?: string;
  latestTradingDay?: string;
};

/**
 * Global quote (free). Useful when intraday endpoints are premium.
 */
export async function fetchGlobalQuote(symbolRaw: string): Promise<Quote> {
  const symbol = symbolRaw.toUpperCase();
  const url = new URL(AV_BASE);
  url.searchParams.set('function', 'GLOBAL_QUOTE');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('apikey', getKey());

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  const json = await res.json();

  if (json?.Note) throw new Error(`Alpha Vantage rate limit: ${json.Note}`);
  if (json?.Information) throw new Error(`Alpha Vantage info: ${json.Information}`);

  const q = json?.['Global Quote'] ?? {};
  return {
    symbol,
    price: q?.['05. price'],
    change: q?.['09. change'],
    changePercent: q?.['10. change percent'],
    latestTradingDay: q?.['07. latest trading day'],
  };
}

export type Overview = {
  symbol: string;
  name: string;
  marketCap?: string;
  peRatio?: string;
  weekHigh52?: string;
  weekLow52?: string;
};

export async function fetchOverview(symbolRaw: string): Promise<Overview> {
  const symbol = symbolRaw.toUpperCase();
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
