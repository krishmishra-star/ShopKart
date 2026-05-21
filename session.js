

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('sk_currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('sk_currentUser');
  window.location.replace('index.html');
}

function requireAuth() {
  if (!getCurrentUser()) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace('login.html?redirect=' + redirect);
  }
}

function updateNavbar() {
  const authContainer = document.getElementById('authContainer');
  if (!authContainer) return;

  const user = getCurrentUser();

  if (user) {
    const initial = user.name.charAt(0).toUpperCase();
    const firstName = user.name.split(' ')[0];

    authContainer.innerHTML = `
      <div class="relative group">
        <button
          class="flex items-center gap-2.5 px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors duration-200"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span class="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold select-none">
            ${initial}
          </span>
          <span>${firstName}</span>
          <i class="fa-solid fa-chevron-down text-[9px] text-gray-400 transition-transform duration-200 group-hover:rotate-180"></i>
        </button>

        <!-- Dropdown -->
        <div
          class="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right scale-95 group-hover:scale-100 z-[300]"
          role="menu"
        >
          <div class="px-4 py-3.5 border-b border-gray-100">
            <p class="text-sm font-bold text-gray-900 truncate">${user.name}</p>
            <p class="text-xs text-gray-400 truncate mt-0.5">${user.email}</p>
          </div>
          <div class="p-2">
            <a href="#" class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" role="menuitem">
              <i class="fa-regular fa-clock-rotate-left w-4 text-gray-400 text-xs"></i>
              My Orders
            </a>
            <a href="#" class="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors" role="menuitem">
              <i class="fa-regular fa-gear w-4 text-gray-400 text-xs"></i>
              Settings
            </a>
            <hr class="my-1 border-gray-100">
            <button
              onclick="logout()"
              class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
              role="menuitem"
            >
              <i class="fa-regular fa-right-from-bracket w-4 text-xs"></i>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    authContainer.innerHTML = `
      <a
        href="login.html"
        class="px-6 py-2.5 bg-brand text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-300 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
      >
        Sign In
      </a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', updateNavbar);
