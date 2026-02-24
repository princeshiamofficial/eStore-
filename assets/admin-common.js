/**
 * Admin Common Functionality
 * Handles admin profile updates and shared UI components
 */

// Function to open the profile update modal
async function openAdminProfileModal() {
    try {
        const response = await fetch('/api/admin/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const admin = await response.json();

        // Populate modal fields
        document.getElementById('editAdminEmail').value = admin.email;
        document.getElementById('editAdminPassword').value = ''; // Keep password empty

        // Show modal
        const modal = document.getElementById('adminProfileModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Focus first input
        setTimeout(() => document.getElementById('editAdminEmail').focus(), 100);
    } catch (error) {
        console.error('Error:', error);
        alert('Could not load profile information.');
    }
}

// Function to close the modal
function closeAdminProfileModal() {
    const modal = document.getElementById('adminProfileModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Handle profile form submission
async function handleAdminProfileUpdate(event) {
    event.preventDefault();

    const email = document.getElementById('editAdminEmail').value;
    const password = document.getElementById('editAdminPassword').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Updating...</span>
    `;

    try {
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const result = await response.json();
            // Success feedback
            closeAdminProfileModal();

            // Show success toast or alert
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 border border-slate-800';
            toast.innerHTML = `
                <div class="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <span class="font-bold">${result.message || 'Profile updated successfully'}</span>
            `;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.classList.remove('translate-y-20', 'opacity-0');
            }, 100);

            // If credentials were changed, redirect to login
            if (result.logout) {
                setTimeout(() => {
                    window.location.href = '/admin/login';
                }, 2000);
            } else {
                setTimeout(() => {
                    toast.classList.add('translate-y-20', 'opacity-0');
                    setTimeout(() => toast.remove(), 500);
                }, 3000);
            }

        } else {
            const result = await response.json();
            alert(result.error || 'Update failed');
        }
    } catch (error) {
        console.error('Update error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

/**
 * Modern Custom Dropdown Component
 * Replaces standard <select> with a premium UI
 */
function createModernDropdown(selectId, options = {}) {
    const select = document.getElementById(selectId);
    if (!select) return;

    // Hide original select
    select.style.display = 'none';

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'modern-dropdown-wrapper relative w-full';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Create Trigger
    const trigger = document.createElement('div');
    trigger.className = 'modern-dropdown-trigger w-full bg-white border border-slate-100 rounded-2xl py-3 px-5 flex items-center justify-between cursor-pointer hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden';

    const selectedText = document.createElement('span');
    selectedText.className = 'text-sm font-bold text-slate-800 pointer-events-none truncate flex-1 mr-3 tracking-tight';
    selectedText.innerHTML = select.options[select.selectedIndex]?.text || 'Select...';

    const icon = document.createElement('div');
    icon.className = 'text-slate-300 group-hover:text-orange-500 transition-all duration-300 pointer-events-none flex-shrink-0';
    icon.innerHTML = `<svg class="w-4 h-4 transition-transform duration-500 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>`;

    trigger.appendChild(selectedText);
    trigger.appendChild(icon);
    wrapper.appendChild(trigger);

    // Create Menu
    const menu = document.createElement('div');
    menu.className = 'modern-dropdown-menu hidden absolute top-[calc(100%+8px)] left-0 min-w-full w-max max-w-[400px] bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] flex flex-col max-h-[320px] overflow-hidden origin-top scale-95 opacity-0 transition-all duration-300 ease-out';

    // Search Input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'p-4 border-b border-slate-50/50 bg-white/50';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Type to filter...';
    searchInput.className = 'w-full bg-slate-100/50 border-none rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400';
    searchContainer.appendChild(searchInput);
    menu.appendChild(searchContainer);

    const optionsList = document.createElement('div');
    optionsList.className = 'overflow-y-auto flex-1 py-1';
    menu.appendChild(optionsList);

    function renderOptions(filter = '') {
        optionsList.innerHTML = '';
        const searchTerms = filter.toLowerCase().trim();
        let hasResults = false;

        Array.from(select.options).forEach(opt => {
            if (searchTerms && !opt.text.toLowerCase().includes(searchTerms)) return;

            hasResults = true;
            const item = document.createElement('div');
            item.className = `px-6 py-3 text-xs font-black uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap mx-2 my-1 rounded-xl ${opt.selected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600'}`;
            item.innerHTML = opt.text;
            item.onclick = (e) => {
                e.stopPropagation();
                select.value = opt.value;
                selectedText.innerHTML = opt.text;
                select.dispatchEvent(new Event('change'));
                closeMenu();
            };
            optionsList.appendChild(item);
        });

        if (!hasResults) {
            const noRes = document.createElement('div');
            noRes.className = 'px-5 py-4 text-xs font-bold text-slate-400 text-center uppercase tracking-widest';
            noRes.textContent = 'No matches found';
            optionsList.appendChild(noRes);
        }
    }

    wrapper.appendChild(menu);

    // Toggle Logic
    let isOpen = false;

    function openMenu() {
        searchInput.value = '';
        renderOptions();
        menu.classList.remove('hidden');
        setTimeout(() => {
            menu.classList.remove('scale-95', 'opacity-0');
            icon.querySelector('svg').classList.add('rotate-180');
            searchInput.focus();
        }, 10);
        isOpen = true;
    }

    function closeMenu() {
        menu.classList.add('scale-95', 'opacity-0');
        icon.querySelector('svg').classList.remove('rotate-180');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 300);
        isOpen = false;
    }

    searchInput.onclick = (e) => e.stopPropagation();
    searchInput.oninput = (e) => renderOptions(e.target.value);

    trigger.onclick = (e) => {
        e.stopPropagation();
        // Close all other dropdowns
        document.querySelectorAll('.modern-dropdown-menu').forEach(m => {
            if (m !== menu) {
                const parent = m.closest('.modern-dropdown-wrapper');
                const pIcon = parent.querySelector('.modern-dropdown-trigger svg');
                m.classList.add('scale-95', 'opacity-0', 'hidden');
                if (pIcon) pIcon.classList.remove('rotate-180');
            }
        });

        if (isOpen) closeMenu();
        else openMenu();
    };

    // Close on outside click
    document.addEventListener('click', () => {
        if (isOpen) closeMenu();
    });

    // Handle dynamic updates to the select
    const observer = new MutationObserver(() => {
        selectedText.textContent = select.options[select.selectedIndex]?.text || 'Select...';
        renderOptions(searchInput.value); // Re-render the menu items
    });
    observer.observe(select, { childList: true, subtree: true, attributes: true });

    // Sync if value is changed via JS
    const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(select, 'value', {
        set: function (v) {
            descriptor.set.call(this, v);
            selectedText.innerHTML = this.options[this.selectedIndex]?.text || 'Select...';
        },
        get: function () {
            return descriptor.get.call(this);
        }
    });

    select.addEventListener('change', () => {
        selectedText.innerHTML = select.options[select.selectedIndex]?.text || 'Select...';
    });

    return { wrapper, trigger, menu };
}

// Global initialization of shared components
// Initialize Admin Common Elements
function initAdminCommon() {
    // Inject Modern Dropdown Styles
    const style = document.createElement('style');
    style.textContent = `
        .modern-dropdown-menu::-webkit-scrollbar {
            width: 4px;
        }
        .modern-dropdown-menu::-webkit-scrollbar-track {
            background: transparent;
        }
        .modern-dropdown-menu::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
        }
        .modern-dropdown-menu::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
        }
        @keyframes dropdownScaleIn {
            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modern-dropdown-menu:not(.hidden) {
            animation: dropdownScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modern-dropdown-menu div {
            white-space: nowrap !important;
        }
    `;
    document.head.appendChild(style);

    // 1. Create and inject the modal HTML if it doesn't exist
    if (!document.getElementById('adminProfileModal')) {
        const modalHtml = `
            <div id="adminProfileModal" class="hidden fixed inset-0 z-[60] p-4 flex items-center justify-center">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onclick="closeAdminProfileModal()"></div>
                
                <!-- Modal Content -->
                <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden transform transition-all border border-slate-100 animate-in fade-in zoom-in duration-300">
                    <!-- Top Gradient Accent -->
                    <div class="h-2 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300"></div>
                    
                    <div class="p-8 md:p-10">
                        <div class="flex items-center gap-5 mb-8">
                            <div class="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-900 leading-tight">Admin Settings</h3>
                                <p class="text-slate-500 font-medium text-sm">Update your account credentials</p>
                            </div>
                        </div>
                        
                        <form id="adminProfileForm" onsubmit="handleAdminProfileUpdate(event)" class="space-y-6">
                            <!-- Email Input -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                                <div class="relative group">
                                    <input type="email" id="editAdminEmail" required
                                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-bold transition-all placeholder:text-slate-300"
                                        placeholder="admin@colorhut.com">
                                    <div class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a5.5 5.5 0 11-5.5-5.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Password Input -->
                            <div class="space-y-2">
                                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Password</label>
                                <div class="relative group">
                                    <input type="password" id="editAdminPassword"
                                        class="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-bold transition-all placeholder:text-slate-300"
                                        placeholder="••••••••">
                                    <div class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1 mt-2">Leave blank to keep your current password</p>
                            </div>
                            
                            <!-- Actions -->
                            <div class="flex gap-4 pt-4">
                                <button type="button" onclick="closeAdminProfileModal()"
                                    class="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">
                                    Cancel
                                </button>
                                <button type="submit"
                                    class="flex-[1.5] bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <span>Save Changes</span>
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <!-- Decorative Background Element -->
                    <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-50 rounded-full -z-10 opacity-50 blur-3xl"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 2. Attach click listeners to admin card(s)
    const adminProfiles = document.querySelectorAll('aside .flex.items-center.gap-3.px-4.py-2.mb-2');
    adminProfiles.forEach(card => {
        // Add pointer cursor and hover effects if not already there
        if (!card.classList.contains('cursor-pointer')) {
            card.classList.add('cursor-pointer', 'hover:bg-slate-50', 'rounded-xl', 'transition-colors');
        }

        // Remove existing onclick if any and add the new one
        card.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openAdminProfileModal();
        };
    });

    initMobileMenu();
}

function initMobileMenu() {
    const sidebar = document.querySelector('aside');
    const toggleBtn = document.querySelector('header button.text-slate-500'); // Mobile header button

    if (!sidebar || !toggleBtn) return;

    // Transform sidebar for mobile drawer support
    sidebar.classList.remove('hidden');
    sidebar.classList.add(
        'fixed', 'inset-y-0', 'left-0', 'z-50',
        'transition-transform', 'duration-300',
        '-translate-x-full', // Hidden by default on mobile
        'md:translate-x-0', 'md:static', // Visible/Static on desktop
        'shadow-2xl', 'md:shadow-none'
    );

    // Create Backdrop
    let backdrop = document.getElementById('mobileMenuBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'mobileMenuBackdrop';
        backdrop.className = 'fixed inset-0 bg-slate-900/50 z-40 hidden backdrop-blur-sm transition-opacity duration-300 opacity-0 md:hidden';
        document.body.appendChild(backdrop);
    }

    const toggleMenu = (forceClose = false) => {
        const isClosed = sidebar.classList.contains('-translate-x-full');

        if (forceClose || !isClosed) {
            // Close
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('opacity-0');
            setTimeout(() => backdrop.classList.add('hidden'), 300);
        } else {
            // Open
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
            // Force reflow
            void backdrop.offsetWidth;
            backdrop.classList.remove('opacity-0');
        }
    };

    // Remove existing listeners to prevent duplicates if re-init
    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);

    newBtn.onclick = (e) => {
        e.stopPropagation();
        toggleMenu();
    };

    backdrop.onclick = () => toggleMenu(true);

    // Close on any sidebar link click (for mobile UX)
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // md breakpoint
                toggleMenu(true);
            }
        });
    });
}

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminCommon);
} else {
    initAdminCommon();
}
