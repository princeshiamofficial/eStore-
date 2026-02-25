import React from 'react';
import './globals.css';
import { Metadata, Viewport } from 'next';

import ContactMotion from './ContactMotion';
import { TrackingHead, TrackingBody } from './TrackingScripts';

export const metadata: Metadata = {
    metadataBase: new URL('https://store.colorhutbd.xyz'),
    title: 'Color Hut - Your Trusted Partner for Branding & Creative Solutions',
    description: 'Shop for unique gifts, restaurant packaging, and custom branding solutions. Color Hut is your dedicated partner for logo design, menu printing, and premium creative work in Bangladesh.',
    keywords: 'Branding, Logo Design, Menu Printing, Packaging, Gift Shop, Bangladesh, Creative Studio',
    alternates: {
        canonical: '/',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Color Hut - Branding & Creative Solutions',
        description: 'Premium creative agency in Bangladesh specializing in logo design and branding.',
        url: '/',
        siteName: 'Color Hut',
        images: [
            {
                url: 'https://store.colorhutbd.xyz/preview.png',
                width: 1200,
                height: 630,
                alt: 'Color Hut Preview',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Color Hut - Branding & Creative Solutions',
        description: 'Premium creative agency in Bangladesh specializing in logo design and branding.',
        images: ['https://store.colorhutbd.xyz/preview.png'],
    },
    other: {
        'fb:app_id': '966242223397117',
    },
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
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Color Hut",
        "url": "https://store.colorhutbd.xyz/",
        "logo": "https://store.colorhutbd.xyz/image/logo.png",
        "description": "Premium creative agency in Bangladesh specializing in logo design, menu printing, and custom branding solutions.",
        "sameAs": [
            "https://www.facebook.com/colorhutbd",
            "https://www.instagram.com/colorhutbd"
        ]
    };

    return (
        <html lang="en" prefix="og: http://ogp.me/ns# website: http://ogp.me/ns/website#" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <TrackingHead />
            </head>
            <body itemScope itemType="http://schema.org/WebPage" vocab="http://schema.org/" typeof="WebPage" suppressHydrationWarning>
                <TrackingBody />
                {children}
                <ContactMotion />
            </body>
        </html>
    )
}
