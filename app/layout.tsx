import React from 'react';
import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'Color Hut - Your Trusted Partner for Branding & Creative Solutions',
    description: 'Shop for unique gifts, restaurant packaging, and custom branding solutions. Color Hut is your dedicated partner for logo design, menu printing, and premium creative work in Bangladesh.',
    keywords: 'Branding, Logo Design, Menu Printing, Packaging, Gift Shop, Bangladesh, Creative Studio',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body suppressHydrationWarning>{children}</body>
        </html>
    )
}
