import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>AI Asset Research App</h1>
      <p>MVP: stock page + compare view. Data source TBD.</p>
      <ul>
        <li>
          <Link href="/stock/AAPL">Example: /stock/AAPL</Link>
        </li>
        <li>
          <Link href="/compare?tickers=AAPL,MSFT">Example: compare AAPL vs MSFT</Link>
        </li>
      </ul>
    </main>
  );
}
