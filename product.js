let productsData = [];

function loadProduct(product) {

  document.getElementById("productDetail").innerHTML = `
    <div class="flex flex-col lg:flex-row gap-8 px-6 max-w-6xl mx-auto pb-16">

      <div class="w-full lg:w-1/2">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="w-full h-auto object-cover rounded-md border border-gray-200 bg-white"
        >
      </div>

      <div class="w-full lg:w-1/2 flex flex-col justify-start">

        <p class="text-sm text-gray-500 capitalize mb-2">
          ${product.category}
        </p>

        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          ${product.name}
        </h1>

        <p class="text-2xl font-bold text-gray-900 mb-6">
          ${fmt(product.price)}
        </p>

        <p class="text-gray-600 mb-8">
          A high-quality ${product.category} item designed for everyday use.
        </p>

        <div 
          class="mb-8 border-b border-gray-200 pb-8" 
          data-cart-btn-for="${product._id}"
        >
          ${typeof getCartBtnHTML === 'function' 
            ? getCartBtnHTML(product._id) 
            : ''}
        </div>

        <div class="space-y-2 text-sm text-gray-600">
          <p>
            <i class="fa-solid fa-truck text-gray-400 mr-2"></i>
            Free shipping over ₹10,000
          </p>

          <p>
            <i class="fa-solid fa-arrow-rotate-left text-gray-400 mr-2"></i>
            30-day returns
          </p>
        </div>

      </div>
    </div>

    <div class="px-6 max-w-6xl mx-auto border-t border-gray-200 pt-12 pb-24">

      <h2 class="text-xl font-bold text-gray-900 mb-6">
        Related Products
      </h2>

      <div 
        class="grid grid-cols-2 lg:grid-cols-4 gap-6" 
        id="relatedGrid"
      ></div>

    </div>
  `;

  const related = productsData
    .filter(
      p =>
        p.category === product.category &&
        String(p._id) !== String(product._id)
    )
    .slice(0, 4);

  const grid = document.getElementById("relatedGrid");

  grid.innerHTML = related.length
    ? related.map(p => `
        <div 
          class="border border-gray-200 rounded-md overflow-hidden bg-white hover:shadow-md transition-shadow cursor-pointer"
          onclick="switchProduct('${p._id}')"
        >

          <div class="h-[200px] bg-gray-100">
            <img 
              src="${p.image}" 
              alt="${p.name}" 
              class="w-full h-full object-cover"
            >
          </div>

          <div class="p-4">
            <p class="text-base font-semibold text-gray-800 truncate">
              ${p.name}
            </p>

            <p class="text-sm font-bold text-gray-900 mt-1">
              ${fmt(p.price)}
            </p>
          </div>

        </div>
      `).join("")
    : `
      <p class="text-sm text-gray-500 col-span-full">
        No related items available.
      </p>
    `;
}

async function fetchProduct() {

  try {

    const params = new URLSearchParams(window.location.search);

    const productId = params.get("id");

    const response = await fetch(
      `https://your-render-url.onrender.com/api/products/${productId}`
    );

    const product = await response.json();

    loadProduct(product);

  } catch (error) {

    console.log("Error fetching product:", error);

  }
}

async function fetchAllProducts() {

  try {

    const response = await fetch(
      "https://shopkart-10.onrender.com/api/products"
    );

    const data = await response.json();

    productsData = data;

  } catch (error) {

    console.log(error);

  }
}

window.switchProduct = function(id) {

  window.location.href = `product.html?id=${id}`;

};

document.addEventListener("DOMContentLoaded", async () => {

  await fetchAllProducts();

  await fetchProduct();

});