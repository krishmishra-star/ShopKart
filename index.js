let productsData = [];

async function fetchProducts() {
  try {
    const response = await fetch("https://your-render-url.onrender.com/api/products");
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        productsData = data;
        initSliders();
        return;
      }
    }
  } catch (error) {
    console.log("Error fetching products, falling back to local dataset:", error);
  }
  productsData = window.fallbackProducts || [];
  initSliders();
}
fetchProducts();

window.goToProduct = function (id) {
  const p = productsData.find(p => String(p._id || p.id) === String(id));
  if (!p) return;
  localStorage.setItem('sk_selectedProduct', JSON.stringify(p));
  window.location.href = `product.html?id=${id}`;
};



function renderSlider(id, data) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!data.length) {
    el.innerHTML = `<p class="text-sm text-gray-500 py-10 w-full text-center">No products found.</p>`;
    return;
  }

  el.innerHTML = data.map(p => `
    <div class="w-[240px] flex-shrink-0 snap-start border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div class="h-[240px] bg-gray-100 cursor-pointer" onclick="goToProduct('${p._id || p.id}')">
        <img
          src="${p.image}"
          alt="${p.name}"
          class="w-full h-full object-cover"
          loading="lazy"
        >
      </div>
      <div class="p-4">
        <p class="text-xs text-gray-500 capitalize mb-1">${p.category}</p>
        <h4 class="text-base font-semibold text-gray-800 truncate cursor-pointer" onclick="goToProduct('${p._id || p.id}')">${p.name}</h4>
        <p class="text-sm font-bold text-gray-900 mt-1 mb-3">${fmt(p.price)}</p>
        <div data-cart-btn-for="${p._id || p.id}">
          ${typeof getCartBtnHTML === 'function' ? getCartBtnHTML(p._id || p.id) : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function initSliders() {
  const shuffled = [...productsData].sort(() => 0.5 - Math.random());
  renderSlider('slider1', shuffled.slice(0, 8));
  renderSlider('slider2', [...shuffled].reverse().slice(0, 8));
}

document.addEventListener('DOMContentLoaded', () => {
  initSliders();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        window.location.href = q
          ? `explore.html?q=${encodeURIComponent(q)}`
          : 'explore.html';
      }
    });

    // Add debounced auto-redirect to explore page as the user types
    if (window.debounce) {
      searchInput.addEventListener('input', window.debounce(e => {
        const q = e.target.value.trim();
        if (q.length >= 3) {
          window.location.href = `explore.html?q=${encodeURIComponent(q)}`;
        }
      }, 900));
    }
  }

  const catBtns = document.querySelectorAll('.category-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => {
        b.classList.remove('bg-brand', 'text-white', 'border-brand');
        b.classList.add('bg-white', 'text-gray-500', 'border-gray-200');
      });
      btn.classList.remove('bg-white', 'text-gray-500', 'border-gray-200');
      btn.classList.add('bg-brand', 'text-white', 'border-brand');

      const cat = btn.dataset.category;
      const filtered = cat === 'all' ? productsData : productsData.filter(p => p.category === cat);
      renderSlider('slider1', filtered);
      renderSlider('slider2', [...filtered].reverse());
      document.querySelector('.slider-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
