'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export type PricePoint = { date: string; close: number };

export default function PriceChart({ points }: { points: PricePoint[] }) {
  if (!points.length) {
    return <div style={{ color: '#666' }}>No price data.</div>;
  }

  const data = points.map((p) => ({
    date: p.date,
    close: p.close,
  }));

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            minTickGap={24}
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            width={60}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(v: any) => [`$${Number(v).toFixed(2)}`, 'Close']}
            labelFormatter={(l: any) => `Date: ${l}`}
          />
          <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
