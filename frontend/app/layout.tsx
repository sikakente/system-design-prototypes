import type { Metadata } from 'next';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

export const metadata: Metadata = { title: 'StockFlow' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Auth0Provider>
          <FluentProvider theme={webLightTheme}>
            {children}
          </FluentProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
