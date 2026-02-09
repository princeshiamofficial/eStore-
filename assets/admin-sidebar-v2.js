/**
 * Admin Sidebar Component
 * Centralized sidebar management for all admin pages
 */

function renderAdminSidebar() {
    const currentPage = window.location.pathname;
    const sidebarHtml = `
        <div class="h-20 flex items-center px-8 border-b border-slate-100">
            <img src="/logo.png" alt="Color Hut" class="h-8 object-contain">
        </div>

        <nav class="flex-1 py-6 overflow-y-auto space-y-1">
            <p class="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Overview</p>
            <a href="/admin/dashboard"
                class="sidebar-link ${currentPage.includes('dashboard') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('dashboard') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Dashboard
            </a>
            <a href="/admin/products"
                class="sidebar-link ${currentPage.includes('products') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('products') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Products
            </a>
            <a href="/admin/categories"
                class="sidebar-link ${currentPage.includes('categories') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('categories') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Categories
            </a>
            <a href="/admin/mobile-hero"
                class="sidebar-link ${currentPage.includes('mobile-hero') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('mobile-hero') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Mobile Hero
            </a>

            <p class="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 mt-8 mb-4">Management</p>
            <a href="/admin/pixel-traffic"
                class="sidebar-link ${currentPage.includes('pixel-traffic') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('pixel-traffic') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
                Pixel & Traffic
            </a>
            <a href="/admin/seo"
                class="sidebar-link ${currentPage.includes('seo') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('seo') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                SEO Settings
            </a>

            <a href="/admin/trash"
                class="sidebar-link ${currentPage.includes('trash') ? 'active' : ''} flex items-center gap-3 px-8 py-3 text-sm font-bold ${currentPage.includes('trash') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Trash
            </a>
        </nav>

        <div class="p-4 border-t border-slate-100">
            <div id="adminUserBadge"
                class="flex items-center gap-3 px-4 py-2 mb-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=f97316&color=fff"
                    class="w-8 h-8 rounded-full" alt="Admin">
                <div class="text-left">
                    <div class="text-slate-900 text-sm font-bold">Admin User</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-wider">Studio Manager</div>
                </div>
            </div>
            <a href="/admin/logout"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Logout
            </a>
        </div>
    `;

    const sidebarContainer = document.getElementById('admin-sidebar');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHtml;
    }

    // Toggle Mobile Sidebar (if header button exists)
    const mobileMenuBtn = document.querySelector('header button');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('admin-sidebar');
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-0');
            sidebar.classList.toggle('w-full');
            sidebar.classList.toggle('bg-white');
        });
    }
}

document.addEventListener('DOMContentLoaded', renderAdminSidebar);
