

async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function switchForm(formId) {
  ['loginForm', 'signupForm', 'forgotForm'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === formId) {
      el.classList.remove('hidden-form');
      el.classList.add('active-form');
    } else {
      el.classList.remove('active-form');
      el.classList.add('hidden-form');
    }
  });
}

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('i');
      if (!input || !icon) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    });
  });
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const text = document.getElementById('toastMessage');
  if (!toast || !text) return;

  text.textContent = message;

  const base = 'fixed bottom-6 right-6 lg:bottom-10 lg:right-10 text-white px-6 py-4 rounded-xl text-sm font-medium z-[999] shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 flex items-center gap-3';
  const colors = { error: 'bg-red-600', success: 'bg-green-600', info: 'bg-gray-900' };
  const icons = { error: 'fa-solid fa-circle-exclamation', success: 'fa-solid fa-circle-check', info: 'fa-solid fa-circle-info' };

  toast.className = `${base} ${colors[type] || colors.info}`;
  if (icon) icon.className = icons[type] || icons.info;

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3000);
}

function setButtonLoading(btn, loading, originalText) {
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>${originalText}`;
  } else {
    btn.textContent = btn.dataset.originalText || originalText;
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem('sk_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('sk_users', JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem('sk_currentUser', JSON.stringify(user));
}

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || 'index.html';
}

if (localStorage.getItem('sk_currentUser')) {
  window.location.replace(getRedirectUrl());
}

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggles();

  document.querySelectorAll('[data-switch-to]').forEach(btn => {
    btn.addEventListener('click', () => switchForm(btn.dataset.switchTo));
  });

  document.getElementById('formSignup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('signupName')?.value.trim();
    const email    = document.getElementById('signupEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('signupPassword')?.value;
    const btn      = e.target.querySelector('button[type="submit"]');

    if (!name || !email || !password) return;

    setButtonLoading(btn, true, 'Creating account…');

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      showToast('An account with this email already exists.', 'error');
      setButtonLoading(btn, false, 'Create Account');
      return;
    }

    const hashed = await hashPassword(password);
    const newUser = { name, email, password: hashed };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ name, email });

    showToast('Account created — welcome aboard!', 'success');
    setTimeout(() => window.location.replace(getRedirectUrl()), 1000);
  });

  document.getElementById('formLogin')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const password = document.getElementById('loginPassword')?.value;
    const btn      = e.target.querySelector('button[type="submit"]');

    if (!email || !password) return;

    setButtonLoading(btn, true, 'Signing in…');

    const hashed = await hashPassword(password);
    const users  = getUsers();
    const user   = users.find(u => u.email === email && u.password === hashed);

    if (user) {
      setCurrentUser({ name: user.name, email: user.email });
      showToast('Welcome back!', 'success');
      setTimeout(() => window.location.replace(getRedirectUrl()), 900);
    } else {
      showToast('Wrong email or password.', 'error');
      setButtonLoading(btn, false, 'Access Account');
    }
  });

  document.getElementById('formForgot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email       = document.getElementById('forgotEmail')?.value.trim().toLowerCase();
    const newPassword = document.getElementById('forgotPassword')?.value;
    const btn         = e.target.querySelector('button[type="submit"]');

    if (!email || !newPassword) return;

    setButtonLoading(btn, true, 'Resetting…');

    const hashed = await hashPassword(newPassword);
    const users  = getUsers();
    const idx    = users.findIndex(u => u.email === email);

    if (idx !== -1) {
      users[idx].password = hashed;
      saveUsers(users);
      showToast('Password reset! You can now sign in.', 'success');
      setTimeout(() => {
        switchForm('loginForm');
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) loginEmail.value = email;
      }, 1400);
    } else {
      showToast('No account found with that email.', 'error');
    }

    setButtonLoading(btn, false, 'Reset Password');
  });
});
