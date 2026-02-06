export function getMockStockSnapshot(ticker: string) {
  const t = ticker.toUpperCase();
  const companyName =
    t === 'AAPL' ? 'Apple Inc.' :
    t === 'MSFT' ? 'Microsoft Corp.' :
    t === 'GOOGL' ? 'Alphabet Inc.' :
    `${t} (mock)`;

  return {
    ticker: t,
    companyName,
    metrics: [
      { label: 'Price', value: `$${(100 + t.length * 7).toFixed(2)}` },
      { label: 'Market Cap', value: `${(500 + t.length * 111).toFixed(0)}B` },
      { label: 'P/E', value: `${(12 + t.length * 2).toFixed(1)}` },
      { label: '52W High', value: `$${(140 + t.length * 9).toFixed(2)}` },
      { label: '52W Low', value: `$${(80 + t.length * 5).toFixed(2)}` },
      { label: 'Notes', value: '—' }
    ],
  };
}
