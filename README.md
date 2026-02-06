# AI Asset Research App

A small **Next.js** app for researching publicly traded assets (stocks/ETFs).

## MVP (target: Feb 11)

- **Stock page**: chart placeholder + key metrics + notes
- **Compare view**: compare 2–5 tickers by key metrics

Data is **mocked** right now. Next step is wiring a real market data provider.

## Routes

- `/` – links to examples
- `/stock/[ticker]` – stock page (e.g. `/stock/AAPL`)
- `/compare?tickers=AAPL,MSFT` – compare view

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>

## Lint / Build

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env` and fill in keys once we pick a provider:

```bash
cp .env.example .env
```
