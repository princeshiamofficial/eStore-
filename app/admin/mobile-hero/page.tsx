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
  Trash,
  Check,
  AlertTriangle,
  UploadCloud,
  FileImage
} from 'lucide-react';

interface Slide {
  id: number;
  image_url: string;
  position?: number;
  created_at?: string;
}

export default function MobileHeroPage() {
  // Slides data state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Selected file and preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Deletion Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; slideId: number | null }>({
    isOpen: false,
    slideId: null
  });

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  // Fetch active slides from the API
  const loadSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to fetch active slider images.' });
      }
    } catch (err) {
      console.error('Error loading slides:', err);
      setSaveStatus({ type: 'error', message: 'Network error occurred while loading slides.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelection(file);
      } else {
        setSaveStatus({ type: 'error', message: 'Only image files are allowed.' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    setSaveStatus({ type: null, message: '' });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Handle Slide Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setSaveStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSaveStatus({ type: 'success', message: 'New slide uploaded successfully!' });
        clearSelection();
        loadSlides();
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        const data = await res.json();
        setSaveStatus({ type: 'error', message: data.error || 'Failed to upload image.' });
      }
    } catch (err) {
      console.error('Error uploading slide:', err);
      setSaveStatus({ type: 'error', message: 'A network error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Trigger Slide Deletion
  const openDeleteModal = (id: number) => {
    setDeleteModal({ isOpen: true, slideId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, slideId: null });
  };

  const confirmDelete = async () => {
    if (deleteModal.slideId === null) return;
    
    setSaveStatus({ type: null, message: '' });
    const idToDelete = deleteModal.slideId;
    closeDeleteModal();

    try {
      const res = await fetch(`/api/hero-slides/${idToDelete}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSaveStatus({ type: 'success', message: 'Slide deleted successfully!' });
        loadSlides();
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to delete selected slide.' });
      }
    } catch (err) {
      console.error('Error deleting slide:', err);
      setSaveStatus({ type: 'error', message: 'A network error occurred.' });
    }
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
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon, active: true },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 md:hidden transition-opacity"
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
            
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Mobile Hero Slides</h1>
                <p className="text-slate-500 font-medium">Manage images for the mobile homepage slider.</p>
              </div>
            </div>

            {/* Content Columns: Upload & Guide | Active slides */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Upload Form & Guide */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Upload Panel */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-4">Add New Slide</h3>
                  
                  <form onSubmit={handleUploadSubmit} className="space-y-6">
                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px]
                        ${isDragOver ? 'border-orange-500 bg-orange-50/50' : 'border-slate-200 hover:border-orange-400 hover:bg-slate-50/30'}
                      `}
                    >
                      <input 
                        type="file" 
                        id="slideImage" 
                        accept="image/*,image/gif"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={!selectedFile}
                      />

                      {previewUrl ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-100 shadow-inner group">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              clearSelection();
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all shadow-md"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-orange-600 hover:underline">Click to upload</span>
                            <span className="text-xs font-semibold text-slate-400 block mt-0.5">or drag and drop your image</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Display file details if selected */}
                    {selectedFile && !previewUrl && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <FileImage className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-600 truncate">{selectedFile.name}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Upload Slide
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Upload Specs Panel */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6">
                  <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600" /> Recommended Specs
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-slate-500 leading-relaxed list-disc list-inside">
                    <li>Size: <strong className="text-slate-900">800x200px</strong> (Wide Landscape)</li>
                    <li>Formats: <strong className="text-slate-900">JPG, PNG, GIF</strong></li>
                    <li>File limit: <strong className="text-slate-900">Max 5MB</strong> per file</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Active Slides Grid */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6">Active Slider Images</h3>
                  
                  {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse bg-slate-50 border border-slate-100 h-44 rounded-2xl" />
                      ))}
                    </div>
                  ) : slides.length === 0 ? (
                    <div className="py-16 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mb-1">No active slides</h4>
                      <p className="text-xs text-slate-400 font-medium">Add a slider image from the upload panel to activate.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {slides.map((slide) => (
                        <div 
                          key={slide.id} 
                          className="group relative rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm aspect-[4/2] bg-slate-950 flex items-center justify-center"
                        >
                          <img 
                            src={slide.image_url} 
                            alt={`Mobile Slide ${slide.id}`} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                          />
                          
                          {/* Image ID Overlay */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 rounded-md text-[10px] font-black text-white/90 backdrop-blur-sm shadow-sm select-none">
                            SLIDE #{slide.id}
                          </div>

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                            <button
                              onClick={() => openDeleteModal(slide.id)}
                              className="w-11 h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                              title="Delete Slide"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Delete Slide Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Delete Slide?
            </h2>
            <p className="text-slate-600 mb-6 font-medium">
              This action cannot be undone. The selected mobile slider image will be permanently removed.
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
