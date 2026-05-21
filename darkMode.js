/**
 * Global Dark Mode Controller for ShopKart
 */

// 1. Configure Tailwind Play CDN to support class-based dark mode
if (typeof window !== 'undefined') {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          brand: '#2563eb', // standard blue brand color
        }
      }
    }
  };
}

// 2. Immediate theme initialization to prevent flash of light theme
(function initTheme() {
  const isDark = localStorage.getItem('sk_dark_mode') === 'true';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

// 3. Inject global CSS overrides for elements that don't have explicit Tailwind dark: classes
(function injectDarkStyles() {
  const css = `
    /* Premium Smooth Mode Transitions */
    body, nav, section, div, p, span, a, input, select, textarea, button, h1, h2, h3, h4, h5, h6, table, tr, td, th {
      transition: background-color 0.25s ease, border-color 0.25s ease, color 0.15s ease;
    }

    /* Core Dark Mode Overrides */
    .dark body {
      background-color: #0f172a !important; /* slate-900 */
      color: #f1f5f9 !important; /* slate-100 */
    }

    .dark nav, 
    .dark footer,
    .dark #cartSidebar,
    .dark #orderSummary,
    .dark #checkoutForm,
    .dark .bg-white,
    .dark .slider-section,
    .dark .slider-section > div {
      background-color: #1e293b !important; /* slate-800 */
      border-color: #334155 !important; /* slate-700 */
      color: #f1f5f9 !important;
    }

    .dark .category-btn:not(.active) {
      background-color: #334155 !important;
      border-color: #475569 !important;
      color: #cbd5e1 !important;
    }
    
    .dark .category-btn:not(.active):hover {
      background-color: #475569 !important;
      color: #ffffff !important;
    }

    .dark input, 
    .dark select, 
    .dark textarea {
      background-color: #0f172a !important;
      border-color: #475569 !important;
      color: #ffffff !important;
    }

    .dark input::placeholder, 
    .dark textarea::placeholder {
      color: #64748b !important; /* slate-500 */
    }

    .dark input:focus, 
    .dark select:focus, 
    .dark textarea:focus {
      border-color: #3b82f6 !important; /* blue-500 */
      box-shadow: 0 0 0 1px #3b82f6 !important;
    }

    /* Text Color Enhancements */
    .dark .text-gray-900,
    .dark .text-gray-800,
    .dark h1, .dark h2, .dark h3, .dark h4 {
      color: #ffffff !important;
    }

    .dark .text-gray-600,
    .dark .text-gray-500,
    .dark .text-gray-400 {
      color: #94a3b8 !important; /* slate-400 */
    }

    .dark .border-gray-200,
    .dark .border-gray-300,
    .dark .divide-gray-100 > * {
      border-color: #334155 !important;
    }

    /* Cards & UI elements */
    .dark .border,
    .dark .divide-y > * {
      border-color: #334155 !important;
    }
    
    .dark .bg-gray-50,
    .dark .bg-gray-100 {
      background-color: #0f172a !important;
    }
    
    .dark .bg-gray-200 {
      background-color: #334155 !important;
      color: #f1f5f9 !important;
    }

    .dark .divide-y > :not([hidden]) ~ :not([hidden]) {
      border-color: #334155 !important;
    }

    /* Sidebar Shopping Cart Overrides */
    .dark #cartSidebar {
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4) !important;
    }
    
    .dark #cartItems div {
      border-color: #334155 !important;
    }

    .dark .text-gray-700 {
      color: #cbd5e1 !important;
    }

    /* Order details & Shipment status line */
    .dark #ordersContainer .bg-gray-50 {
      background-color: #1e293b !important;
    }

    .dark #ordersContainer .bg-gradient-to-r {
      background-image: linear-gradient(to right, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.8)) !important;
    }

    .dark .relative.z-10 .bg-gray-200 {
      background-color: #334155 !important;
    }

    /* Razorpay simulated modal */
    .dark #razorpayGatewayModal .bg-\[\#f4f5f7\] {
      background-color: #0f172a !important;
      border-color: #334155 !important;
    }
    
    .dark #razorpayGatewayModal .bg-white {
      background-color: #1e293b !important;
      border-color: #334155 !important;
      color: #ffffff !important;
    }
    
    .dark #razorpayGatewayModal .text-gray-800 {
      color: #ffffff !important;
    }

    .dark #razorpayGatewayModal .bg-gray-100 {
      background-color: #1e293b !important;
    }
    
    .dark #razorpayGatewayModal .border-gray-200 {
      border-color: #334155 !important;
    }

    .dark #razorpayGatewayModal button:not(.bg-blue-600) {
      background-color: #1e293b !important;
      border-color: #334155 !important;
      color: #ffffff !important;
    }
    
    .dark #razorpayGatewayModal button:hover:not(.bg-blue-600) {
      background-color: #334155 !important;
    }

    .dark #successModal .bg-white {
      background-color: #1e293b !important;
      border-color: #334155 !important;
      color: #ffffff !important;
    }

    /* Custom dark scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  `;

  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
})();

/**
 * Toggles the global dark mode state
 */
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('sk_dark_mode', isDark ? 'true' : 'false');
  updateToggleIcons(isDark);
}

/**
 * Updates all toggle icons in the viewport to match the dark/light state
 */
function updateToggleIcons(isDark) {
  const icons = document.querySelectorAll('.dark-mode-toggle-icon');
  icons.forEach(icon => {
    if (isDark) {
      icon.className = 'fa-solid fa-sun text-yellow-400 text-lg transition-transform duration-300 rotate-[360deg] dark-mode-toggle-icon';
    } else {
      icon.className = 'fa-solid fa-moon text-slate-600 text-lg transition-transform duration-300 dark-mode-toggle-icon';
    }
  });
}

// 4. Injects the dark mode toggle button on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  const isDark = localStorage.getItem('sk_dark_mode') === 'true';

  // Inject a toggle into header bars or float on the screen
  const navContainer = document.querySelector('.flex.items-center.gap-6') || document.querySelector('nav .flex.items-center');
  
  if (navContainer) {
    // 1. Navbar Placement (Beautiful matching design)
    const toggleLi = document.createElement('a');
    toggleLi.href = '#';
    toggleLi.className = 'relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm cursor-pointer';
    toggleLi.id = 'skDarkModeToggle';
    toggleLi.title = 'Toggle Theme';
    toggleLi.setAttribute('aria-label', 'Toggle theme');
    toggleLi.innerHTML = `<i class="dark-mode-toggle-icon ${isDark ? 'fa-solid fa-sun text-yellow-400' : 'fa-solid fa-moon text-slate-600'} text-lg"></i>`;
    
    // Insert toggle button before the cart button or explore links if they exist
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      navContainer.insertBefore(toggleLi, cartBtn);
    } else {
      navContainer.appendChild(toggleLi);
    }

    toggleLi.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDarkMode();
    });
  } else {
    // 2. Floating Placement (For login.html or pages without navigation headers)
    const floatBtn = document.createElement('button');
    floatBtn.id = 'skDarkModeToggle';
    floatBtn.title = 'Toggle Theme';
    floatBtn.setAttribute('aria-label', 'Toggle theme');
    floatBtn.className = 'fixed top-5 right-5 z-[100] w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer';
    floatBtn.innerHTML = `<i class="dark-mode-toggle-icon ${isDark ? 'fa-solid fa-sun text-yellow-400' : 'fa-solid fa-moon text-slate-600'} text-lg"></i>`;
    
    document.body.appendChild(floatBtn);

    floatBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDarkMode();
    });
  }

  // Force icon states consistency
  updateToggleIcons(isDark);
});
