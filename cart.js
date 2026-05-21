

(function migrateStorage() {
  try {
    if (!localStorage.getItem('sk_cart') && localStorage.getItem('cart')) {
      localStorage.setItem('sk_cart', localStorage.getItem('cart'));
      localStorage.removeItem('cart');
    }
    if (!localStorage.getItem('sk_currentUser') && localStorage.getItem('currentUser')) {
      localStorage.setItem('sk_currentUser', localStorage.getItem('currentUser'));
      localStorage.removeItem('currentUser');
    }
    if (!localStorage.getItem('sk_users') && localStorage.getItem('users')) {
      localStorage.setItem('sk_users', localStorage.getItem('users'));
      localStorage.removeItem('users');
    }
    if (!localStorage.getItem('sk_selectedProduct') && localStorage.getItem('selectedProduct')) {
      localStorage.setItem('sk_selectedProduct', localStorage.getItem('selectedProduct'));
      localStorage.removeItem('selectedProduct');
    }
  } catch (e) {  }
})();

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('sk_cart')) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('sk_cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => String(item._id || item.id) === String(product._id || product.id));

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartUI();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(id) {
  saveCart(getCart().filter(item => String(item._id || item.id) !== String(id)));
  updateCartUI();
}

function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find(i => String(i._id || i.id) === String(id));
  if (!item) return;

  item.quantity = (item.quantity || 1) + delta;

  if (item.quantity <= 0) {
    saveCart(cart.filter(i => String(i._id || i.id) !== String(id)));
  } else {
    saveCart(cart);
  }

  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? '' : 'none';
  }

  renderCartSidebar(cart);

  if (typeof renderCartPage === 'function') {
    renderCartPage(cart);
  }

  if (typeof refreshCartButtons === 'function') {
    refreshCartButtons();
  }
}

function renderCartSidebar(cart) {
  const items = document.getElementById('cartItems');
  const totalEl = document.getElementById('totalPrice');
  if (!items) return;

  if (!cart.length) {
    items.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full py-16 text-gray-500 gap-3">
        <i class="fa-solid fa-cart-shopping text-3xl text-gray-300"></i>
        <p class="text-sm font-medium">Your cart is empty</p>
        <a href="explore.html" class="mt-2 text-sm text-blue-600 hover:underline">Browse Products</a>
      </div>`;
    if (totalEl) totalEl.textContent = '0';
    return;
  }

  let sum = 0;
  items.innerHTML = cart.map(item => {
    const subtotal = item.price * (item.quantity || 1);
    sum += subtotal;
    return `
      <div class="flex gap-4 items-start py-4 border-b border-gray-200">
        <div class="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800 truncate">${item.name}</p>
          <p class="text-xs text-gray-500 capitalize mt-0.5">${item.category}</p>
          <p class="text-sm font-bold text-gray-900 mt-1">${fmt(item.price)}</p>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button
            onclick="removeFromCart('${item._id || item.id}')"
            class="text-xs text-red-600 hover:underline"
            aria-label="Remove item"
          >
            Remove
          </button>
          <div class="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 bg-white">
            <button
              onclick="updateQuantity('${item._id || item.id}', -1)"
              class="text-gray-600 hover:text-gray-900 leading-none text-sm font-bold"
              aria-label="Decrease quantity"
            >−</button>
            <span class="text-xs font-semibold w-6 text-center">${item.quantity}</span>
            <button
              onclick="updateQuantity('${item._id || item.id}', 1)"
              class="text-gray-600 hover:text-gray-900 leading-none text-sm font-bold"
              aria-label="Increase quantity"
            >+</button>
          </div>
        </div>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = sum.toLocaleString('en-IN');
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.replace('translate-x-full', 'translate-x-0');
  document.getElementById('cartOverlay')?.classList.remove('opacity-0', 'pointer-events-none');
  document.getElementById('cartOverlay')?.classList.add('opacity-100');
  document.body.style.overflow = 'hidden';
}

function closeCartFn() {
  document.getElementById('cartSidebar')?.classList.replace('translate-x-0', 'translate-x-full');
  document.getElementById('cartOverlay')?.classList.add('opacity-0', 'pointer-events-none');
  document.getElementById('cartOverlay')?.classList.remove('opacity-100');
  document.body.style.overflow = '';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('translate-y-[20px]', 'opacity-0');
  t.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.add('translate-y-[20px]', 'opacity-0');
    t.classList.remove('translate-y-0', 'opacity-100');
  }, 2800);
}

function handleCheckout() {
  const cart = getCart();
  if (!cart.length) {
    showToast('Your cart is empty!');
    return;
  }

  const user = getCurrentUser ? getCurrentUser() : JSON.parse(localStorage.getItem('sk_currentUser'));
  if (!user) {
    closeCartFn();
    setTimeout(() => {
      window.location.href = 'login.html?redirect=cart.html';
    }, 300);
    return;
  }

  window.location.href = 'cart.html';
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  document.getElementById('cartBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openCart();
  });

  document.getElementById('closeCart')?.addEventListener('click', closeCartFn);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartFn);

  document.getElementById('checkoutBtn')?.addEventListener('click', handleCheckout);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCartFn();
  });
});

window.getCartBtnHTML = function(id) {
  const cart = getCart();
  const item = cart.find(i => String(i._id || i.id) === String(id));
  if (item && item.quantity > 0) {
    return `
      <div class="flex items-center justify-between border border-blue-600 rounded overflow-hidden h-10 w-full sm:w-32 bg-white">
        <button onclick="triggerUpdateQty(event, '${id}', -1)" class="w-10 h-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors">−</button>
        <span class="flex-1 text-center font-semibold text-gray-900 text-sm h-full flex items-center justify-center">${item.quantity}</span>
        <button onclick="triggerUpdateQty(event, '${id}', 1)" class="w-10 h-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors">+</button>
      </div>
    `;
  }
  return `
    <button
      onclick="triggerAdd(event, '${id}')"
      class="w-full sm:w-auto px-6 h-10 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      Add to Cart
    </button>
  `;
};

window.triggerAdd = function(event, id) {
  if (event) event.stopPropagation();
  const p = typeof productsData !== 'undefined' ? productsData.find(p => String(p._id || p.id) === String(id)) : null;
  if (p) addToCart(p);
};

window.triggerUpdateQty = function(event, id, delta) {
  if (event) event.stopPropagation();
  updateQuantity(id, delta);
};

window.refreshCartButtons = function() {
  document.querySelectorAll('[data-cart-btn-for]').forEach(el => {
    const id = el.getAttribute('data-cart-btn-for');
    if (id) {
      el.innerHTML = getCartBtnHTML(id);
    }
  });
};
