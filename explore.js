

let productsData = [];

window.goToProduct = function(id) {
  const p = productsData.find(p => String(p._id || p.id) === String(id));
  if (!p) return;
  localStorage.setItem("sk_selectedProduct", JSON.stringify(p));
  window.location.href = `product.html?id=${id}`;
};



function renderGrid(data) {
  const grid = document.getElementById("exploreGrid");
  if (!grid) return;

  if (!data.length) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
        <i class="fa-solid fa-box-open text-5xl mb-4 text-gray-300"></i>
        <h3 class="text-xl font-bold text-gray-600 mb-2">No products found</h3>
        <p class="text-sm">Try adjusting your search or category filter.</p>
        <button onclick="window.location.href='explore.html'" class="mt-6 px-6 py-2 border border-gray-300 rounded-full text-gray-900 hover:bg-gray-50 transition-colors text-sm font-semibold">Clear Filters</button>
      </div>`;
    return;
  }

  grid.innerHTML = data.map(p => `
    <div class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow-md transition-shadow">
      <div class="h-[260px] bg-gray-100 cursor-pointer" onclick="goToProduct('${p._id || p.id}')">
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
        <p class="text-sm font-bold text-gray-900 mt-1 mb-4">${fmt(p.price)}</p>
        <div data-cart-btn-for="${p._id || p.id}">
          ${typeof getCartBtnHTML === 'function' ? getCartBtnHTML(p._id || p.id) : ''}
        </div>
      </div>
    </div>
  `).join("");
}

function filterProducts() {
  const q = document.getElementById("exploreSearch")?.value.trim() || "";
  const cat = document.getElementById("categorySelect")?.value || "all";

  let filtered = productsData;
  let aiInsightsHTML = "";

  if (q) {
    const searchRes = window.applyAISearch(productsData, q);
    filtered = searchRes.filtered;
    const criteria = searchRes.criteria;

    document.getElementById("exploreTitle").textContent = `Search results for "${q}"`;
    document.getElementById("exploreSubtitle").textContent = `Found ${filtered.length} products`;

    // Render beautiful real-time AI Insights visual indicators
    if (criteria && (criteria.priceFilter || criteria.brands.length > 0 || criteria.categories.length > 0 || criteria.keywords.length > 0)) {
      let pills = [];
      if (criteria.brands.length > 0) {
        pills.push(`
          <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-sm capitalize">
            <i class="fa-solid fa-copyright text-blue-500"></i> Brand: ${criteria.brands.join(', ')}
          </span>
        `);
      }
      if (criteria.categories.length > 0) {
        pills.push(`
          <span class="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 shadow-sm capitalize">
            <i class="fa-solid fa-folder-open text-purple-500"></i> Category: ${criteria.categories.join(', ')}
          </span>
        `);
      }
      if (criteria.priceFilter) {
        const priceText = criteria.priceFilter.type === "less" ? `Under ₹${criteria.priceFilter.val}` : `Above ₹${criteria.priceFilter.val}`;
        pills.push(`
          <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm">
            <i class="fa-solid fa-indian-rupee-sign text-emerald-500"></i> Price: ${priceText}
          </span>
        `);
      }
      if (criteria.keywords.length > 0) {
        pills.push(`
          <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 shadow-sm">
            <i class="fa-solid fa-magnifying-glass text-amber-500"></i> Keywords: ${criteria.keywords.join(', ')}
          </span>
        `);
      }

      aiInsightsHTML = `
        <div class="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-slate-800/60 dark:to-slate-800/30 border border-blue-100 dark:border-slate-700/50 rounded-xl flex flex-col md:flex-row md:items-center gap-3 animate-fade-in shadow-sm w-full">
          <span class="text-xs font-extrabold text-blue-600 dark:text-blue-400 tracking-wider uppercase flex items-center gap-1.5 shrink-0">
            <i class="fa-solid fa-wand-magic-sparkles animate-pulse"></i> AI Smart Filters:
          </span>
          <div class="flex flex-wrap gap-2">
            ${pills.join('')}
          </div>
        </div>
      `;
    }
  } else {
    document.getElementById("exploreTitle").textContent = "Explore All Products";
    document.getElementById("exploreSubtitle").textContent = "Find what you love.";
  }

  if (cat !== "all") {
    filtered = filtered.filter(p => p.category === cat);
  }

  // Inject AI Insights block below search input container
  let insightsContainer = document.getElementById("aiInsightsContainer");
  if (!insightsContainer) {
    insightsContainer = document.createElement("div");
    insightsContainer.id = "aiInsightsContainer";
    insightsContainer.className = "w-full mb-6";
    const headerElement = document.getElementById("exploreTitle")?.parentElement?.parentElement;
    if (headerElement) {
      headerElement.parentNode.insertBefore(insightsContainer, headerElement.nextSibling);
    }
  }
  insightsContainer.innerHTML = aiInsightsHTML;

  renderGrid(filtered);
}

async function fetchAllProducts() {
  try {
    const response = await fetch("https://your-render-url.onrender.com/api/products");
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        productsData = data;
        return;
      }
    }
  } catch (error) {
    console.error("Error fetching products, falling back to local dataset:", error);
  }
  productsData = window.fallbackProducts || [];
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAllProducts();

  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('q');

  const searchInput = document.getElementById("exploreSearch");
  if (q && searchInput) {
    searchInput.value = q;
  }

  filterProducts();

  // Integrated debounce input listener
  searchInput?.addEventListener("input", window.debounce ? window.debounce(filterProducts, 300) : filterProducts);
  document.getElementById("categorySelect")?.addEventListener("change", filterProducts);
});
