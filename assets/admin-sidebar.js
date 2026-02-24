/**
 * Admin Sidebar Component
 * Centralized sidebar management for all admin pages
 */

function renderAdminSidebar() {
    const currentPage = window.location.pathname;
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    // Sidebar width class
    const widthClass = isCollapsed ? 'w-20' : 'w-64';
    const hideTextClass = isCollapsed ? 'hidden' : 'block';
    const centerIconClass = isCollapsed ? 'justify-center px-0' : 'px-8';
    const paddingClass = isCollapsed ? 'px-4' : 'px-8';

    const sidebarHtml = `
        <div class="h-20 flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-8'} border-b border-slate-100 relative group">
            <img src="/logo.png" alt="Color Hut" class="${isCollapsed ? 'h-6' : 'h-8'} object-contain transition-all duration-300">
            
            <button id="sidebarToggle" class="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm hover:bg-slate-50 text-slate-400 hover:text-orange-500 transition-colors z-50 ${isCollapsed ? '' : 'opacity-0 group-hover:opacity-100'}">
                <svg class="w-3 h-3 ${isCollapsed ? 'rotate-180' : ''} transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>

        <nav class="flex-1 py-6 overflow-y-auto space-y-1 overflow-x-hidden">
            <p class="${paddingClass} text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 whitespace-nowrap ${isCollapsed ? 'text-center' : ''}">
                ${isCollapsed ? '•••' : 'Overview'}
            </p>
            
            <a href="/admin/dashboard" title="Dashboard"
                class="sidebar-link ${currentPage.includes('dashboard') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('dashboard') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Dashboard</span>
            </a>

            <a href="/admin/products" title="Products"
                class="sidebar-link ${currentPage.includes('products') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('products') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Products</span>
            </a>

            <a href="/admin/categories" title="Categories"
                class="sidebar-link ${currentPage.includes('categories') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('categories') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Categories</span>
            </a>

            <a href="/admin/mobile-hero" title="Mobile Hero"
                class="sidebar-link ${currentPage.includes('mobile-hero') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('mobile-hero') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Mobile Hero</span>
            </a>

            <p class="${paddingClass} text-[10px] font-black uppercase tracking-widest text-slate-400 mt-8 mb-4 whitespace-nowrap ${isCollapsed ? 'text-center' : ''}">
                ${isCollapsed ? '•••' : 'Management'}
            </p>

            <a href="/admin/pixel-traffic" title="Pixel & Traffic"
                class="sidebar-link ${currentPage.includes('pixel-traffic') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('pixel-traffic') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Pixel & Traffic</span>
            </a>

            <a href="/admin/meeting-requests" title="Meeting Requests"
                class="sidebar-link ${currentPage.includes('meeting-requests') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('meeting-requests') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Meeting Requests</span>
            </a>

            <a href="/admin/seo" title="SEO Settings"
                class="sidebar-link ${currentPage.includes('seo') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('seo') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">SEO Settings</span>
            </a>

            <a href="/admin/trash" title="Trash"
                class="sidebar-link ${currentPage.includes('trash') ? 'active' : ''} flex items-center ${centerIconClass} py-3 text-sm font-bold ${currentPage.includes('trash') ? 'text-slate-700' : 'text-slate-500 hover:text-orange-500'}">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} ml-3 whitespace-nowrap">Trash</span>
            </a>
        </nav>

        <div class="p-4 border-t border-slate-100">
            <div id="adminUserBadge"
                class="flex items-center ${isCollapsed ? 'justify-center p-2' : 'px-4 py-2 gap-3'} mb-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=f97316&color=fff"
                    class="w-8 h-8 rounded-full flex-shrink-0" alt="Admin">
                <div class="${hideTextClass} text-left">
                    <div class="text-slate-900 text-sm font-bold">Admin User</div>
                    <div class="text-[10px] text-slate-400 uppercase tracking-wider">Studio Manager</div>
                </div>
            </div>
            <a href="/admin/logout" title="Logout"
                class="w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-center gap-2 px-4'} py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="${hideTextClass} whitespace-nowrap">Logout</span>
            </a>
        </div>
    `;

    const sidebarContainer = document.getElementById('admin-sidebar');
    if (sidebarContainer) {
        // Update width classes on the sidebar container itself
        sidebarContainer.className = `bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 hidden md:flex transition-all duration-300 ${widthClass}`;
        sidebarContainer.innerHTML = sidebarHtml;

        // Attach event listener for the toggle button
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            const newState = !isCollapsed;
            localStorage.setItem('sidebarCollapsed', newState);
            renderAdminSidebar(); // Re-render with new state
        });
    }

    // Toggle Mobile Sidebar (if header button exists)
    const mobileMenuBtn = document.querySelector('header button');
    if (mobileMenuBtn) {
        // Remove existing listener if any (simplistic approach, ideally named function reference)
        const newBtn = mobileMenuBtn.cloneNode(true);
        mobileMenuBtn.parentNode.replaceChild(newBtn, mobileMenuBtn);

        newBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('admin-sidebar');
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('fixed');
            sidebar.classList.toggle('inset-0');
            sidebar.classList.toggle('w-full');
            sidebar.classList.toggle('bg-white');

            // Force expand on mobile when opened, or keep current implementation
            // Ideally on mobile it's always full width overlay
        });
    }
}

document.addEventListener('DOMContentLoaded', renderAdminSidebar);
