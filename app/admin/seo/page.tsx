'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Settings, 
  Info, 
  FileText, 
  ExternalLink, 
  Check, 
  Loader2,
  LayoutDashboard,
  Package,
  FolderOpen,
  Image as ImageIcon,
  BarChart3,
  Users,
  Trash2,
  ChevronLeft,
  LogOut,
  Sparkles,
  Menu,
  X,
  Save
} from 'lucide-react';

export default function SeoSettingsPage() {
  // Settings Form State
  const [formData, setFormData] = useState({
    home_title: '',
    site_title_suffix: '',
    home_description: '',
    site_keywords: ''
  });
  const [robotsContent, setRobotsContent] = useState('');
  
  // UI and Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  
  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  // Toggle Sidebar collapsing
  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsResp, robotsResp] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/robots')
        ]);

        if (settingsResp.ok && robotsResp.ok) {
          const settings = await settingsResp.json();
          const robots = await robotsResp.json();

          setFormData({
            home_title: settings.home_title || '',
            site_title_suffix: settings.site_title_suffix || '',
            home_description: settings.home_description || '',
            site_keywords: settings.site_keywords || ''
          });
          setRobotsContent(robots.content || '');
        } else {
          setSaveStatus({ type: 'error', message: 'Failed to load some configurations.' });
        }
      } catch (err) {
        console.error('Error fetching SEO configuration:', err);
        setSaveStatus({ type: 'error', message: 'Network error occurred while loading settings.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save Settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const [settingsResp, robotsResp] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }),
        fetch('/api/admin/robots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: robotsContent })
        })
      ]);

      if (settingsResp.ok && robotsResp.ok) {
        setSaveStatus({ type: 'success', message: 'SEO Settings and robots.txt saved successfully!' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus({ type: 'error', message: 'An unexpected network error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    active?: boolean;
  }

  // Static items for Sidebar
  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings, active: true },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'fixed inset-y-0 left-0 w-64' : 'hidden md:flex'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Brand Logo Header */}
        <div className={`h-20 flex items-center justify-between border-b border-slate-100 relative group px-6 ${isSidebarCollapsed ? 'md:justify-center md:px-2' : ''}`}>
          <a href="/admin/dashboard" className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Color Hut" 
              className={`object-contain transition-all duration-300 ${isSidebarCollapsed ? 'md:h-6' : 'h-8'}`} 
            />
          </a>

          {/* Collapse Trigger (Desktop Only) */}
          <button 
            onClick={toggleSidebar}
            className={`absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-brand-500 hover:border-brand-300 transition-all duration-300 md:block hidden
              ${isSidebarCollapsed ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Close Trigger (Mobile Only) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-1 overflow-x-hidden">
          {/* Overview Section */}
          <div className="mb-6">
            <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 whitespace-nowrap ${isSidebarCollapsed ? 'text-center px-4' : 'px-8'}`}>
              {isSidebarCollapsed ? '•••' : 'Overview'}
            </p>
            {sidebarLinks.overview.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`relative flex items-center py-3 text-sm font-bold transition-all duration-300 group ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-8'
                } ${
                  link.active 
                    ? 'text-orange-600 bg-gradient-to-r from-orange-50/50 to-white border-r-[3px] border-orange-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600 hover:pl-10'
                }`}
                title={link.name}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Management Section */}
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 whitespace-nowrap ${isSidebarCollapsed ? 'text-center px-4' : 'px-8'}`}>
              {isSidebarCollapsed ? '•••' : 'Management'}
            </p>
            {sidebarLinks.management.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`relative flex items-center py-3 text-sm font-bold transition-all duration-300 group ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-8'
                } ${
                  link.active 
                    ? 'text-orange-600 bg-gradient-to-r from-orange-50/50 to-white border-r-[3px] border-orange-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600 hover:pl-10'
                }`}
                title={link.name}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </nav>

        {/* Footer Area with Profile and Logout */}
        <div className="p-4 border-t border-slate-100/80">
          <div className={`flex items-center mb-3 rounded-xl transition-colors hover:bg-slate-50 ${isSidebarCollapsed ? 'md:justify-center md:p-2' : 'px-3 py-2 gap-3'}`}>
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=f97316&color=fff"
              className="w-8 h-8 rounded-full flex-shrink-0" 
              alt="Admin"
            />
            {!isSidebarCollapsed && (
              <div className="text-left overflow-hidden">
                <div className="text-slate-900 text-sm font-extrabold truncate">Admin User</div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Studio Manager</div>
              </div>
            )}
          </div>
          <a 
            href="/admin/logout" 
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'md:px-0' : 'px-4'
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`${isSidebarCollapsed ? 'md:hidden' : 'block'} whitespace-nowrap`}>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
            A
          </div>
        </header>

        {/* Dynamic Status Toast Banner */}
        {saveStatus.message && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 border transition-all duration-300 transform translate-y-0
            ${saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
          `}>
            {saveStatus.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                !
              </div>
            )}
            <p className="text-sm font-semibold">{saveStatus.message}</p>
          </div>
        )}

        {/* Scrollable Layout Context */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Search Engine Optimization</h1>
                <p className="text-slate-500 font-medium">Manage global search metadata, page indexing configurations, and sitemaps.</p>
              </div>
            </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-10 animate-pulse">
              {/* Global Metadata Section Skeleton */}
              <div className="space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/3" />
                    <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl w-full" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/3" />
                    <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/4" />
                    <div className="h-28 bg-slate-50 border border-slate-100 rounded-2xl w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/4" />
                    <div className="h-14 bg-slate-50 border border-slate-100 rounded-2xl w-full" />
                  </div>
                </div>
              </div>

              {/* Section Divider */}
              <div className="border-t-[0.5px] border-slate-200/30" />

              {/* Indexing & Crawling Section Skeleton */}
              <div className="space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-slate-200 rounded-md w-1/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="h-20 bg-slate-50 border border-slate-100 rounded-2xl w-full" />
                  <div className="space-y-2.5">
                    <div className="h-3.5 bg-slate-100 rounded-md w-1/4" />
                    <div className="h-48 bg-slate-900/5 border border-slate-100 rounded-2xl w-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-10">
              {/* Site-wide Metadata Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <Globe className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Global Metadata</h3>
                    <p className="text-xs text-slate-400 font-medium">Define metadata details for the homepage search result listing.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Title Template */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      Home Title Template
                      <span title="The primary title shown for the home page" className="cursor-help inline-flex items-center">
                        <Info className="w-3.5 h-3.5 text-slate-300" />
                      </span>
                    </label>
                    <input 
                      type="text" 
                      name="home_title"
                      value={formData.home_title}
                      onChange={handleInputChange}
                      placeholder="Color Hut Studio | Premium Digital Assets"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all"
                      required
                    />
                  </div>

                  {/* Global Title Suffix */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      Global Title Suffix
                      <span title="Suffix automatically appended to individual product titles" className="cursor-help inline-flex items-center">
                        <Info className="w-3.5 h-3.5 text-slate-300" />
                      </span>
                    </label>
                    <input 
                      type="text" 
                      name="site_title_suffix"
                      value={formData.site_title_suffix}
                      onChange={handleInputChange}
                      placeholder="| Color Hut Studio"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all"
                      required
                    />
                  </div>

                  {/* Home Meta Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Home Meta Description
                    </label>
                    <textarea 
                      name="home_description"
                      value={formData.home_description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Color Hut Studio offers premium digital assets, branding stationery, and luxury corporate identity solutions in Bangladesh."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Default Meta Keywords */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Default Meta Keywords (Comma separated)
                    </label>
                    <input 
                      type="text" 
                      name="site_keywords"
                      value={formData.site_keywords}
                      onChange={handleInputChange}
                      placeholder="Branding, Stationery, Digital Assets, Luxury Corporate Gifts"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg w-full sm:w-auto text-center"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Metadata
                  </button>
                </div>
              </div>

              {/* Section Divider */}
              <div className="border-t border-slate-100" />

              {/* Indexing & Crawling Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-3.5">
                  <span className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                    <Search className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Indexing & Crawling</h3>
                    <p className="text-xs text-slate-400 font-medium">Control sitemap and direct bot accessibility instructions.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Active Sitemap Helper */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3.5">
                      <span className="w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <FileText className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Active Sitemap</h4>
                        <p className="text-xs text-slate-500 font-medium">Dynamic catalog map automatically refreshed.</p>
                      </div>
                    </div>
                    <a 
                      href="/mysitemap.xml" 
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-black text-slate-600 transition-all hover:text-orange-500 shadow-sm w-full sm:w-auto text-center"
                    >
                      /mysitemap.xml
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Robots.txt Content Editor */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      Robots.txt Content
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md italic lowercase select-none">
                        * Edit with caution
                      </span>
                    </label>
                    <textarea 
                      value={robotsContent}
                      onChange={(e) => setRobotsContent(e.target.value)}
                      rows={8}
                      placeholder="User-agent: *&#10;Allow: /"
                      className="w-full px-5 py-4 bg-slate-950 border border-slate-800/40 rounded-2xl focus:ring-2 focus:ring-white/5 focus:outline-none outline-none font-mono text-sm text-slate-300 transition-all resize-none shadow-inner"
                      required
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg w-full sm:w-auto text-center"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Robots Config
                  </button>
                </div>
              </div>
            </form>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
