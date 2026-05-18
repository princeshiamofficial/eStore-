import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin Login | Color Hut Studio',
  description: 'Secure portal to manage Color Hut branding and creative solutions.',
  icons: { icon: '/logo.png' },
  openGraph: {
    title: 'Admin Login | Color Hut Studio',
    description: 'Secure portal to manage Color Hut branding and creative solutions.',
    images: ['https://store.colorhutbd.xyz/preview.png'],
    url: 'https://store.colorhutbd.xyz/admin/login',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Login | Color Hut Studio',
    description: 'Secure portal to manage Color Hut branding and creative solutions.',
    images: ['https://store.colorhutbd.xyz/preview.png'],
  },
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return children;
}
