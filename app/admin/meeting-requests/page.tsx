'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Settings, 
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
  Menu,
  X,
  Eye,
  Calendar,
  MessageSquare,
  Building2,
  Store,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface MeetingRequest {
  id: number;
  business_type: 'restaurant' | 'parlor';
  business_name?: string;
  full_name: string;
  designation: string;
  whatsapp_number: string;
  menu_type: 'new' | 'update';
  address: string;
  created_at: string;
}

export default function MeetingRequestsPage() {
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Sidebar collapsibility
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modal target states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MeetingRequest | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Sidebar local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch meeting requests from API
  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/meeting-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to load meeting requests.' });
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setSaveStatus({ type: 'error', message: 'Network error loading requests.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // OPEN DETAILS MODAL
  const openDetailsModal = (req: MeetingRequest) => {
    setSelectedRequest(req);
    setIsDetailsOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
    setIsDetailsOpen(false);
  };

  // OPEN DELETE MODAL
  const openDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setIsDeleteOpen(false);
  };

  // CONFIRM DELETE
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const response = await fetch(`/api/admin/meeting-requests/${deleteTargetId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Meeting request deleted successfully!' });
        fetchRequests();
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to delete request.' });
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      setSaveStatus({ type: 'error', message: 'Network error executing delete.' });
    } finally {
      closeDeleteModal();
    }
  };

  // DATE FORMATTER
  const formatDate = (dateInput: string) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    active?: boolean;
  }

  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users, active: true },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Meeting Requests</h1>
                <p className="text-slate-500 font-medium">Review and manage user-submitted meeting requests.</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-6 animate-pulse">
                {/* Table Headers Skeleton */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/12" />
                </div>
                {/* Rows Skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-6 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-4 w-1/4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-150 rounded w-1/6" />
                    <div className="h-4 bg-slate-150 rounded w-1/6" />
                    <div className="h-4 bg-slate-150 rounded w-1/6" />
                    <div className="flex items-center gap-3 w-1/12 justify-end">
                      <div className="h-4 bg-slate-200 rounded w-8" />
                      <div className="h-4 bg-slate-200 rounded w-8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-12 md:p-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">No meeting requests</h3>
                <p className="text-xs text-slate-400 font-medium">Requests submitted by clients will be listed here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="py-6 pl-8">Business Info</th>
                        <th className="py-6">Contact Person</th>
                        <th className="py-6">WhatsApp</th>
                        <th className="py-6">Menu Type</th>
                        <th className="py-6 pr-8 text-right">Date</th>
                        <th className="py-6 pr-8 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {requests.map((req) => {
                        const date = formatDate(req.created_at);
                        return (
                          <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-5 pl-8">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-50/70 border border-orange-100/40 flex items-center justify-center text-orange-500 font-bold">
                                  {req.business_type === 'restaurant' ? (
                                    <Store className="w-5 h-5 text-orange-500" />
                                  ) : (
                                    <Sparkles className="w-5 h-5 text-orange-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm capitalize">
                                    {req.business_type === 'restaurant' ? 'Restaurant' : 'Parlor'}
                                  </div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Inquiry
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5">
                              <div className="font-extrabold text-slate-900 text-sm">{req.full_name}</div>
                              <div className="text-xs font-bold text-slate-400 mt-0.5">{req.designation}</div>
                            </td>
                            <td className="py-5">
                              <a 
                                href={`https://wa.me/${req.whatsapp_number.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-extrabold text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1 rounded-[1px] border border-emerald-100 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {req.whatsapp_number}
                              </a>
                            </td>
                            <td className="py-5">
                              <span className={`inline-block px-2.5 py-1 rounded-[1px] text-[10px] font-black uppercase tracking-wider ${
                                req.menu_type === 'new' 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                  : 'bg-purple-50 text-purple-600 border border-purple-100'
                              }`}>
                                {req.menu_type === 'new' ? 'New Menu' : 'Update Existing'}
                              </span>
                            </td>
                            <td className="py-5 pr-8 text-right font-bold text-xs text-slate-500">
                              {date}
                            </td>
                            <td className="py-5 pr-8 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button 
                                  onClick={() => openDetailsModal(req)} 
                                  className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-[1px] border-[0.5px] border-transparent hover:border-orange-200/30 transition-all"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(req.id)} 
                                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-[1px] border-[0.5px] border-transparent hover:border-rose-200/30 transition-all"
                                  title="Delete Request"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeDetailsModal}
              className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                {selectedRequest.business_type === 'restaurant' ? (
                  <Store className="w-6 h-6" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Request Details</h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5 capitalize">
                  {selectedRequest.business_type} Inquiry • ID #{selectedRequest.id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Business Name */}
              {selectedRequest.business_name && (
                <div className="col-span-2 bg-slate-50/50 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Business Name
                  </div>
                  <div className="text-slate-900 font-extrabold text-base">{selectedRequest.business_name}</div>
                </div>
              )}

              {/* Full Name */}
              <div className="bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Full Name
                </div>
                <div className="text-slate-900 font-extrabold text-sm">{selectedRequest.full_name}</div>
              </div>

              {/* Designation */}
              <div className="bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Designation
                </div>
                <div className="text-slate-900 font-extrabold text-sm">{selectedRequest.designation}</div>
              </div>

              {/* WhatsApp Number */}
              <div className="bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  WhatsApp Number
                </div>
                <div className="mt-1">
                  <a 
                    href={`https://wa.me/${selectedRequest.whatsapp_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-extrabold text-sm group"
                  >
                    {selectedRequest.whatsapp_number}
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              {/* Menu Type */}
              <div className="bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Menu Type
                </div>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-1 rounded-[1px] text-[10px] font-black uppercase tracking-wider ${
                    selectedRequest.menu_type === 'new' 
                      ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                      : 'bg-purple-50 text-purple-600 border border-purple-100'
                  }`}>
                    {selectedRequest.menu_type === 'new' ? 'New Menu' : 'Update Existing'}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="col-span-2 bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Address
                </div>
                <div className="text-slate-900 font-bold text-xs leading-relaxed">{selectedRequest.address || 'N/A'}</div>
              </div>

              {/* Submitted On */}
              <div className="col-span-2 bg-slate-50/50 rounded-2xl p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Submitted On
                </div>
                <div className="text-slate-700 font-bold text-xs">{formatDate(selectedRequest.created_at)}</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={closeDetailsModal}
                className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Delete Request?
            </h2>
            <p className="text-slate-600 mb-6 font-medium">
              This action cannot be undone. This meeting request will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
