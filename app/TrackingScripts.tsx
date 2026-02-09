'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function TrackingHead() {
    const [config, setConfig] = useState<{
        pixel_id: string;
        pixel_enabled: boolean;
        gtm_id: string;
        gtm_enabled: boolean;
    } | null>(null);

    useEffect(() => {
        fetch('/api/public/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load tracking config:', err));
    }, []);

    if (!config) return null;

    return (
        <>
            {/* Meta Pixel */}
            {config.pixel_enabled && config.pixel_id && (
                <Script id="fb-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${config.pixel_id}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}

            {/* Google Tag Manager */}
            {config.gtm_enabled && config.gtm_id && (
                <Script id="gtm" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${config.gtm_id}');
                    `}
                </Script>
            )}
        </>
    );
}

export function TrackingBody() {
    const [config, setConfig] = useState<{
        pixel_id: string;
        pixel_enabled: boolean;
        gtm_id: string;
        gtm_enabled: boolean;
    } | null>(null);

    useEffect(() => {
        fetch('/api/public/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load tracking config:', err));
    }, []);

    if (!config) return null;

    return (
        <>
            {/* Meta Pixel Noscript */}
            {config.pixel_enabled && config.pixel_id && (
                <noscript>
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=${config.pixel_id}&ev=PageView&noscript=1`}
                    />
                </noscript>
            )}

            {/* GTM Noscript */}
            {config.gtm_enabled && config.gtm_id && (
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${config.gtm_id}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
            )}
        </>
    );
}
