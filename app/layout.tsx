import type { Metadata, Viewport } from 'next';
import './globals.css';
import { HuskyWidget } from '@/components/HuskyWidget';
import { GlobalFAB } from '@/components/GlobalFAB';

export const metadata: Metadata = {
  title: 'Agente Daddy',
  description: 'Tu asistente financiero personal inteligente',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Agente Daddy' },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <GlobalFAB />
        <HuskyWidget />
      </body>
    </html>
  );
}
