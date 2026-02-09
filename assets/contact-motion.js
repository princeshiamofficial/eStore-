/**
 * Contact Motion - Vanilla JS Implementation
 * Replicates the Framer Motion component behavior
 */

(function initContactMotion() {
    // Inject Styles for Animations
    const style = document.createElement('style');
    style.textContent = `
        .contact-motion-wrapper {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
            pointer-events: none; /* Allow clicks to pass through wrapper */
        }
        
        .contact-motion-wrapper > * {
            pointer-events: auto; /* Re-enable pointer events for children */
        }

        .contact-menu {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: flex-end;
            margin-bottom: 8px;
            opacity: 0;
            transform: translateY(20px) scale(0.9);
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .contact-menu.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            visibility: visible;
        }

        .contact-item {
            text-decoration: none;
            display: flex;
            align-items: center;
            background-color: white;
            padding: 6px 6px 6px 16px;
            border-radius: 50px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            cursor: pointer;
            transform: translateY(10px);
            opacity: 0;
            transition: transform 0.2s ease-out, opacity 0.2s ease-out;
        }

        .contact-menu.visible .contact-item {
            transform: translateY(0);
            opacity: 1;
        }

        /* Stagger effect */
        .contact-menu.visible .contact-item:nth-child(1) { transition-delay: 0.05s; }
        .contact-menu.visible .contact-item:nth-child(2) { transition-delay: 0.1s; }
        .contact-menu.visible .contact-item:nth-child(3) { transition-delay: 0.15s; }

        .contact-item:hover {
            transform: scale(1.05) !important;
        }

        .contact-item:active {
            transform: scale(0.95) !important;
        }

        .contact-trigger {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #1e293b;
            color: white;
            border: none;
            outline: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            animation: contact-pulse 2s infinite ease-in-out;
        }

        .contact-trigger:hover {
            transform: scale(1.1);
        }

        .contact-trigger:active {
            transform: scale(0.9);
        }

        .icon-wrapper {
            position: absolute;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .icon-open {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }
        
        .icon-close {
            opacity: 0;
            transform: rotate(-90deg) scale(0);
        }

        .contact-trigger.active .icon-open {
            opacity: 0;
            transform: rotate(90deg) scale(0);
        }

        .contact-trigger.active .icon-close {
            opacity: 1;
            transform: rotate(0deg) scale(1);
        }

        @keyframes contact-pulse {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            50% { transform: scale(1.1); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
            100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        }
        @keyframes contact-pulse {
            0% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            50% { transform: scale(1.1); box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
            100% { transform: scale(1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        }

        .contact-tooltip-container {
            position: absolute;
            bottom: 70px;
            right: 0;
            display: flex;
            align-items: flex-end;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px) scale(0.9);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10000;
        }
        
        .contact-tooltip-container.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }



        .contact-tooltip-bubble {
            background-color: white;
            padding: 10px 16px;
            border-radius: 16px 16px 4px 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            color: #1e293b;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 1px;
        }
    `; document.head.appendChild(style);

    // Create DOM Structure
    const wrapper = document.createElement('div');
    wrapper.className = 'contact-motion-wrapper';

    // Menu Container
    const menu = document.createElement('div');
    menu.className = 'contact-menu';

    // Items Configuration
    const items = [
        {
            label: 'Call Us',
            href: 'tel:+8801919760626',
            color: '#f97316',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`
        },
        {
            label: 'Messenger',
            href: 'https://m.me/100335266150128',
            color: '#3b82f6',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>` // Simplified
        },
        {
            label: 'WhatsApp',
            href: 'https://wa.me/8801989224436',
            color: '#22c55e',
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>` // Using Phone icon for simplicity like in React version
        }
    ];

    items.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = 'contact-item';
        link.target = item.href.startsWith('tel:') ? '_self' : '_blank';
        if (!item.href.startsWith('tel:')) link.rel = 'noopener noreferrer';

        link.innerHTML = `
            <span style="margin-right: 12px; font-weight: 600; color: #1e293b; font-size: 14px; white-space: nowrap;">${item.label}</span>
            <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${item.color}; display: flex; align-items: center; justify-content: center; color: white;">
                ${item.icon}
            </div>
        `;
        menu.appendChild(link);
    });

    wrapper.appendChild(menu);

    // Trigger Button
    const trigger = document.createElement('button');
    trigger.className = 'contact-trigger';
    trigger.innerHTML = `
        <div class="icon-wrapper icon-open">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div class="icon-wrapper icon-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
    `;

    // Interactivity
    let isOpen = false;
    trigger.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
            trigger.classList.add('active');
            menu.classList.add('visible');
        } else {
            trigger.classList.remove('active');
            menu.classList.remove('visible');
        }
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (isOpen && !wrapper.contains(e.target)) {
            isOpen = false;
            trigger.classList.remove('active');
            menu.classList.remove('visible');
        }
    });

    // Help Tooltip
    // Help Tooltip Container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'contact-tooltip-container';



    // Bubble
    const bubble = document.createElement('div');
    bubble.className = 'contact-tooltip-bubble';
    tooltipContainer.appendChild(bubble);

    wrapper.appendChild(tooltipContainer);

    wrapper.appendChild(trigger);
    document.body.appendChild(wrapper);

    // Tooltip Logic
    const typeWriter = (text, element) => {
        element.innerHTML = '';
        element.style.display = 'flex';
        element.style.gap = '2px';

        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.opacity = '0';
            span.style.transition = `opacity 0.05s linear ${index * 0.05}s`;
            element.appendChild(span);

            // Trigger reflow
            void span.offsetWidth;

            setTimeout(() => {
                span.style.opacity = '1';
            }, 50);
        });
    };

    const scheduleTooltip = () => {
        const randomDelay = Math.random() * (20000 - 10000) + 10000; // 10-20 seconds
        setTimeout(() => {
            if (!isOpen) { // Only show if menu is closed
                tooltipContainer.classList.add('visible');
                typeWriter('Hi! Chat with us...', bubble);

                // Hide after 10 seconds
                setTimeout(() => {
                    tooltipContainer.classList.remove('visible');
                    scheduleTooltip(); // Reschedule
                }, 10000);
            } else {
                scheduleTooltip(); // Retry later if open
            }
        }, randomDelay);
    };

    scheduleTooltip();

})();
