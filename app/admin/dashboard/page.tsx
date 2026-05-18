'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Package,
  FolderOpen,
  Image as ImageIcon,
  BarChart3,
  Users,
  Settings,
  Trash2,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Loader2,
  Plus,
  TrendingUp,
  FileText,
  Eye,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Download
} from 'lucide-react';

interface RecentProduct {
  id: number;
  name: string;
  status: 'Published' | 'Draft';
  views: number;
  image?: string;
  category_name?: string | null;
}

interface TrendingCategory {
  name: string;
  product_count: number;
}

interface StatsData {
  totalCategories: number;
  totalProducts: number;
  publishedProducts: number;
  unpublishedProducts: number;
  recentProducts: RecentProduct[];
  trendingCategories: TrendingCategory[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load sidebar collapse preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch Dashboard Stats
  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        showToast('Failed to load dashboard metrics.');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      showToast('Network error loading dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExportReport = () => {
    showToast('Preparing PDF Report summary export...');
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Sidebar link configuration
  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    active?: boolean;
  }

  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, active: true },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  const categoryColors = ['bg-orange-500', 'bg-indigo-500', 'bg-pink-500'];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-50 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'fixed inset-y-0 left-0 w-64' : 'hidden md:flex'}
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`h-20 flex items-center justify-between border-b border-slate-100 relative group px-6 ${isSidebarCollapsed ? 'md:justify-center md:px-2' : ''}`}>
          <a href="/admin/dashboard" className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="Color Hut" 
              className={`object-contain transition-all duration-300 ${isSidebarCollapsed ? 'md:h-6' : 'h-8'}`} 
            />
          </a>

          {/* Sidebar Collapse Toggle */}
          <button 
            onClick={toggleSidebar}
            className={`absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-brand-500 hover:border-brand-300 transition-all duration-300 md:block hidden
              ${isSidebarCollapsed ? 'rotate-180' : 'opacity-0 group-hover:opacity-100'}
            `}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Close Sidebar Drawer (Mobile) */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-1 overflow-x-hidden">
          {/* Overview List */}
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

          {/* Management List */}
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

        {/* Sidebar Footer Profile */}
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

      {/* Main Container Context */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header Banner */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
            C
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-xl shadow-slate-950/20 transition-all duration-300">
            <CheckCircle className="w-5 h-5 text-orange-500 animate-bounce" />
            <p className="text-sm font-semibold">{toastMessage}</p>
          </div>
        )}

        {/* Main Dashboard Layout Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Dashboard</h1>
                <p className="text-slate-500 font-medium">Welcome back, here's what's happening at the studio.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportReport}
                  className="bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <a
                  href="/admin/products"
                  className="bg-slate-900 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Plus className="w-4.5 h-4.5" />
                  New Product
                </a>
              </div>
            </div>

            {/* Metrics Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              {/* Total Categories card */}
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Categories</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : stats?.totalCategories ?? 0}
                  </h3>
                </div>
              </div>

              {/* Total Products card */}
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Total Products</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : stats?.totalProducts ?? 0}
                  </h3>
                </div>
              </div>

              {/* Published products card */}
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Published</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : stats?.publishedProducts ?? 0}
                  </h3>
                </div>
              </div>

              {/* Drafts products card */}
              <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 flex items-center gap-4 hover:shadow-2xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Drafts</p>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : stats?.unpublishedProducts ?? 0}
                  </h3>
                </div>
              </div>
            </div>

            {/* Main Content Layout Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1 & 2: Recent Published Products */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Recent Published</h3>
                    <a href="/admin/products" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                          <th className="pb-4 pl-4">Product</th>
                          <th className="pb-4">Category</th>
                          <th className="pb-4 pr-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                          [1, 2, 3].map(i => (
                            <tr key={i}>
                              <td className="py-4 pl-4"><div className="animate-pulse bg-slate-100 h-10 w-44 rounded-xl" /></td>
                              <td className="py-4"><div className="animate-pulse bg-slate-100 h-6 w-24 rounded-lg" /></td>
                              <td className="py-4 pr-4"><div className="animate-pulse bg-slate-100 h-6 w-16 rounded-lg ml-auto" /></td>
                            </tr>
                          ))
                        ) : !stats || stats.recentProducts.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-12 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                              No products published recently.
                            </td>
                          </tr>
                        ) : (
                          stats.recentProducts.map(product => {
                            let images: string[] = [];
                            try {
                              images = product.image ? (product.image.startsWith('[') ? JSON.parse(product.image) : [product.image]) : [];
                            } catch (e) {
                              images = [product.image || ''];
                            }
                            const mainImage = images[0] || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=100&q=80';

                            return (
                              <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-4 pl-4">
                                  <div className="flex items-center gap-4">
                                    <img src={mainImage} className="w-12 h-12 rounded-xl object-cover border border-slate-100" alt="Product" />
                                    <div>
                                      <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{product.name}</div>
                                      <div className="text-xs font-semibold text-slate-400">#PRD-{product.id.toString().padStart(3, '0')}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 font-bold text-slate-600">{product.category_name || 'Uncategorized'}</td>
                                <td className="py-4 pr-4 text-right">
                                  <span className={`font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg border
                                    ${product.status === 'Published' 
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                      : 'bg-amber-50 border-amber-100 text-amber-700'
                                    }
                                  `}>
                                    {product.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Column 3: Trending Categories & Pro Tip */}
              <div className="space-y-8">
                
                {/* Trending Categories card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Trending Categories
                  </h3>

                  <div className="space-y-6">
                    {isLoading ? (
                      [1, 2, 3].map(i => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between"><div className="animate-pulse bg-slate-100 h-4 w-20 rounded-md" /><div className="animate-pulse bg-slate-100 h-4 w-8 rounded-md" /></div>
                          <div className="animate-pulse bg-slate-100 h-3 w-full rounded-full" />
                        </div>
                      ))
                    ) : !stats || stats.trendingCategories.length === 0 ? (
                      <p className="text-center py-6 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                        No trending categories details.
                      </p>
                    ) : (
                      stats.trendingCategories.map((cat, idx) => {
                        const totalProducts = stats.totalProducts || 1;
                        const percentage = Math.round((cat.product_count / totalProducts) * 100);
                        return (
                          <div key={cat.name}>
                            <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                              <span>{cat.name}</span>
                              <span className="text-slate-400 font-black">{percentage}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                              <div 
                                className={`h-full ${categoryColors[idx % categoryColors.length]} rounded-full transition-all duration-500`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Operational Pro Tip card */}
                <div className="p-6 bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl border border-slate-200/40 transition-colors flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-1 uppercase tracking-wider">Pro Tip</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      Update your inventory for the upcoming holiday season to maximize sales and visibility.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
