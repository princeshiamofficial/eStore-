'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function TrafficTrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const utm = searchParams.get('utm') || '';

    // Perform campaign configuration and analytics tracking silently before instant redirect
    const trackAndRedirect = async () => {
      try {
        if (utm) {
          const configResponse = await fetch(`/api/public/campaign-url?utm=${encodeURIComponent(utm)}`);
          if (configResponse.ok && configResponse.headers.get('content-type')?.includes('application/json')) {
            try {
              const config = await configResponse.json();
              if (config && (config.meeting === 'show' || config.meeting === 'hide')) {
                const days = parseInt(config.days, 10);
                const expirationTime = days === 0 ? 0 : Date.now() + days * 24 * 60 * 60 * 1000;
                localStorage.setItem('meeting_override', config.meeting);
                localStorage.setItem('meeting_override_expires', String(expirationTime));
              }
            } catch (e) {}
          }
        }

        await fetch('/api/public/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: utm || 'Direct / None',
            path: utm ? `/traffic?utm=${utm}` : '/traffic'
          }),
          keepalive: true // Keep request alive during instant unmount/navigation
        });
      } catch (err) {
        console.error('Failed to log UTM traffic:', err);
      } finally {
        // Redirect to storefront immediately after fetch dispatching
        router.replace('/');
      }
    };

    trackAndRedirect();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 max-w-sm text-center">
        <div className="w-12 h-12 border-4 border-[#F1641E] border-t-transparent rounded-full animate-spin"></div>
        <div>
          <h3 className="text-base font-black text-slate-800 tracking-tight">Entering Storefront</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Applying campaign settings...</p>
        </div>
      </div>
    </div>
  );
}

export default function TrafficPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 max-w-sm text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Loading Storefront</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <TrafficTrackerContent />
    </Suspense>
  );
}
