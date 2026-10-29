import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'k8s-app',
  description: 'Users and items on k3s',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
