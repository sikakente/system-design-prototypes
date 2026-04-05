import type { Metadata } from 'next';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { FluentWrapper } from '../components/FluentWrapper';

export const metadata: Metadata = { title: 'StockFlow' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Auth0Provider>
          <FluentWrapper>
            {children}
          </FluentWrapper>
        </Auth0Provider>
      </body>
    </html>
  );
}
