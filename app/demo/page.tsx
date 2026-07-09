'use client';

import React, { useEffect, useState, useRef } from 'react';
import HomeNavbar from '../HomeNavbar';

// === ICONS ===
const InstagramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const FooterYouTubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);

const PinterestIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.2 0 1.033.394 2.137.884 2.738.097.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.252 7.929-7.252 4.163 0 7.398 2.967 7.398 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" /></svg>
);

const GlobeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-slate-800"><path d="M8 5v14l11-7z" /></svg>
);

const Footer = ({ socialLinks }: { socialLinks: { facebook: string; instagram: string; youtube: string; pinterest: string } }) => {
    return (
        <footer className="store-footer border-t border-slate-100 mt-auto bg-white py-12">
            <div className="store-footer-content max-w-7xl mx-auto px-4 md:px-8">
                <div className="store-footer-grid grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="store-footer-col">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Shop</h3>
                        <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                            <li><a href="#" className="hover:text-slate-800">Gift cards</a></li>
                            <li><a href="#" className="hover:text-slate-800">Sitemap</a></li>
                            <li><a href="#" className="hover:text-slate-800">Registry</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Sell</h3>
                        <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                            <li><a href="#" className="hover:text-slate-800">Sell on Color Hut</a></li>
                            <li><a href="#" className="hover:text-slate-800">Teams</a></li>
                            <li><a href="#" className="hover:text-slate-800">Forums</a></li>
                            <li><a href="#" className="hover:text-slate-800">Affiliates</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">About</h3>
                        <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
                            <li><a href="#" className="hover:text-slate-800">Color Hut, Inc.</a></li>
                            <li><a href="#" className="hover:text-slate-800">Policies</a></li>
                            <li><a href="#" className="hover:text-slate-800">Investors</a></li>
                            <li><a href="#" className="hover:text-slate-800">Careers</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Help</h3>
                        <ul className="space-y-2.5 text-sm text-slate-500 font-medium mb-4">
                            <li><a href="#" className="hover:text-slate-800">Help Center</a></li>
                            <li><a href="#" className="hover:text-slate-800">Privacy settings</a></li>
                            <li><a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-slate-800">Studio Gallery</a></li>
                        </ul>
                        <div className="flex gap-4">
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors"><FacebookIcon /></a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors"><InstagramIcon /></a>
                            <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors"><PinterestIcon /></a>
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 transition-colors"><FooterYouTubeIcon /></a>
                        </div>
                    </div>
                </div>

                <div className="store-footer-bottom mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                        <GlobeIcon />
                        <span>Bangladesh | English (US) | BDT</span>
                    </div>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                        <li>© 2026 Color Hut BD</li>
                        <li><a href="#" className="hover:text-slate-600">Terms</a></li>
                        <li><a href="#" className="hover:text-slate-600">Privacy</a></li>
                        <li><a href="#" className="hover:text-slate-600">Local Shops</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
}

export default function DemoPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState({
        facebook: 'https://facebook.com/colorhutbd',
        instagram: 'https://www.instagram.com/colorhutbd',
        youtube: 'https://www.youtube.com/@colorhut_official',
        pinterest: '#'
    });

    const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
    const [activeVideo, setActiveVideo] = useState<DemoVideo | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoBlobUrls, setVideoBlobUrls] = useState<Record<string, string>>({});
    const [showMainSource, setShowMainSource] = useState(true);
    const [loadedThumbnails, setLoadedThumbnails] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setShowMainSource(true);
        if (activeVideo) {
            document.title = `${activeVideo.title} - Color Hut`;
            const searchParams = new URLSearchParams(window.location.search);
            const idParam = searchParams.get('id') || searchParams.get('v');
            if (idParam !== activeVideo.id) {
                const newUrl = `${window.location.pathname}?id=${activeVideo.id}`;
                window.history.replaceState({ path: newUrl }, '', newUrl);
            }
        } else {
            document.title = 'Color Hut - Demo';
        }
    }, [activeVideo]);

    useEffect(() => {
        setLoadedThumbnails({});
    }, [demoVideos]);

    useEffect(() => {
        if (demoVideos.length === 0) return;

        let active = true;
        const urls: Record<string, string> = {};

        async function loadAllBlobs() {
            const promises = demoVideos.map(async (video) => {
                try {
                    const res = await fetch(video.video_url);
                    const blob = await res.blob();
                    if (active) {
                        const blobUrl = URL.createObjectURL(blob);
                        urls[video.id] = blobUrl;
                    }
                } catch {
                    if (active) {
                        urls[video.id] = video.video_url;
                    }
                }
            });

            await Promise.all(promises);

            if (active) {
                setVideoBlobUrls(urls);
            }
        }

        loadAllBlobs();

        return () => {
            active = false;
            Object.values(urls).forEach((url) => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [demoVideos]);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch('/api/public/categories');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setCategories(data);
                }
            } catch (e) { }
        }
        loadCategories();
    }, []);

    useEffect(() => {
        async function loadAllProducts() {
            try {
                const res = await fetch('/api/public/products?limit=1000');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setAllProducts(data);
                    }
                }
            } catch (e) {
                console.error('Error loading search metadata:', e);
            }
        }
        loadAllProducts();
    }, []);

    useEffect(() => {
        const fetchSocial = async () => {
            try {
                const res = await fetch('/api/public/config');
                if (res.ok) {
                    const data = await res.json();
                    setSocialLinks({
                        facebook: data.social_facebook || 'https://facebook.com/colorhutbd',
                        instagram: data.social_instagram || 'https://www.instagram.com/colorhutbd',
                        youtube: data.social_youtube || 'https://www.youtube.com/@colorhut_official',
                        pinterest: data.social_pinterest || '#'
                    });
                    if (data.demo_videos) {
                        try {
                            const parsed = JSON.parse(data.demo_videos);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                setDemoVideos(parsed);
                                const searchParams = new URLSearchParams(window.location.search);
                                const idParam = searchParams.get('id') || searchParams.get('v');
                                const foundVideo = idParam ? parsed.find((v: DemoVideo) => v.id === idParam) : null;
                                const finalVideo = foundVideo || parsed[0];
                                setActiveVideo(finalVideo);
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}
        };
        fetchSocial();
    }, []);

    const handleVideoSelect = (video: DemoVideo) => {
        setActiveVideo(video);
        const newUrl = `${window.location.pathname}?id=${video.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-between">
            <div>
                {/* --- NAVBAR --- */}
                <HomeNavbar
                    categories={categories}
                    allProducts={allProducts}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    mobileSheetOpen={mobileSheetOpen}
                    onMobileSheetOpen={() => setMobileSheetOpen(true)}
                    onMobileSheetClose={() => setMobileSheetOpen(false)}
                />

                {/* --- PAGE CONTENT (Minimal YouTube Style) --- */}
                <main className="store-container min-h-[70vh] py-12">
                    {activeVideo ? (
                        <div className={demoVideos.length > 1 ? "grid grid-cols-1 lg:grid-cols-3 gap-12" : "w-full space-y-6"}>
                            
                            {/* Main Video (Left Column if grid, else full width) */}
                            <div className={demoVideos.length > 1 ? "lg:col-span-2 space-y-6" : "w-full space-y-6"}>
                                {/* Borderless Player */}
                                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-sm relative">
                                    <video
                                        ref={videoRef}
                                        key={activeVideo.id}
                                        controls
                                        controlsList="nodownload"
                                        autoPlay
                                        className="w-full h-full object-cover"
                                        onContextMenu={(e) => e.preventDefault()}
                                        onLoadedData={() => setShowMainSource(false)}
                                    >
                                        {showMainSource && (
                                            <source src={videoBlobUrls[activeVideo.id] || activeVideo.video_url} type="video/mp4" />
                                        )}
                                    </video>
                                    {/* Transparent overlay covering the main video body to prevent right-clicking and drag-downloading, while keeping controls interactive */}
                                    <div 
                                        className="absolute inset-x-0 top-0 bottom-16 z-10 cursor-pointer"
                                        onClick={() => {
                                            if (videoRef.current) {
                                                if (videoRef.current.paused) {
                                                    videoRef.current.play();
                                                } else {
                                                    videoRef.current.pause();
                                                }
                                            }
                                        }}
                                        onContextMenu={(e) => e.preventDefault()}
                                    />
                                </div>

                                {/* Video Info */}
                                <div className="space-y-4 pt-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                                        {activeVideo.title}
                                    </h1>
                                    <div className="border-t border-slate-100 pt-5 space-y-4">
                                        {(activeVideo.description || '').split('\n\n').map((block: string, i: number) => {
                                            const cleaned = block.split('\n').map(l => l.trim()).join(' ').replace(/\s+/g, ' ').trim();
                                            if (!cleaned) return null;
                                            return (
                                                <p key={i} className="text-sm text-slate-500 font-medium leading-relaxed w-full">
                                                    {cleaned}
                                                </p>
                                            );
                                        })}
                                        {!activeVideo.description && (
                                            <p className="text-sm text-slate-400 italic">No description provided.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Playlist (Right Column) - Only rendered when multiple videos exist */}
                            {demoVideos.length > 1 && (
                                <div className="lg:col-span-1 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-4 shrink-0">
                                        Demo Playlist
                                        <span className="ml-2 text-[10px] font-bold text-slate-400 normal-case tracking-normal">{demoVideos.length} videos</span>
                                    </h3>

                                    {/* Scroll container with fade-out bottom */}
                                    <div className="relative flex-1 min-h-0">
                                        <div
                                            className="h-full overflow-y-auto divide-y divide-slate-100"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                                        >
                                            {demoVideos.map((video) => {
                                                const isActive = video.id === activeVideo.id;
                                                return (
                                                    <div
                                                        key={video.id}
                                                        onClick={() => handleVideoSelect(video)}
                                                        className={`flex gap-4 py-4 cursor-pointer items-start transition-all duration-200 group ${
                                                            isActive ? 'opacity-100' : 'opacity-65 hover:opacity-100'
                                                        }`}
                                                    >
                                                        {/* Mini Thumbnail */}
                                                        <div className="w-28 h-16 bg-slate-900 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm">
                                                            <video 
                                                                className="w-full h-full object-cover opacity-70" 
                                                                muted 
                                                                onLoadedData={() => {
                                                                    setLoadedThumbnails(prev => ({ ...prev, [video.id]: true }));
                                                                }}
                                                            >
                                                                {!loadedThumbnails[video.id] && (
                                                                    <source src={videoBlobUrls[video.id] || video.video_url} type="video/mp4" />
                                                                )}
                                                            </video>
                                                            {isActive ? (
                                                                <div className="absolute inset-0 bg-slate-950/45 flex items-center justify-center">
                                                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                                                </div>
                                                            ) : (
                                                                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors flex items-center justify-center">
                                                                    <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                                                                        <PlayIcon />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`text-xs font-bold leading-snug line-clamp-2 mb-1 transition-colors ${
                                                                isActive ? 'text-orange-500' : 'text-slate-800 group-hover:text-orange-500'
                                                            }`}>
                                                                {video.title}
                                                            </h4>
                                                            <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                                                                {video.description || 'No description.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Bottom fade gradient */}
                                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-white to-transparent" />
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-center py-24 text-slate-400">
                            <svg className="mx-auto h-16 w-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-bold text-slate-700 mb-1">No demo videos available</p>
                            <p className="text-xs text-slate-400">Please check back later for brand demonstrations.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* --- FOOTER --- */}
            <Footer socialLinks={socialLinks} />
        </div>
    );
}
