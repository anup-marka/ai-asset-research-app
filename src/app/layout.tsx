import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI Asset Research App',
  description: 'Stock research tool MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        <div style={{ padding: 16, maxWidth: 1000, margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
