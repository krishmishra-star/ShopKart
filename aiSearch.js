/**
 * AI Search & NLP Query Parser Engine for ShopKart
 */

// Global mock product fallback database containing the correct brand owners.
// This ensures full functionality even if the local Express/MongoDB server is down.
const fallbackProducts = [
  { _id: "f1", id: "f1", name: "Running Sneaker",   price: 1999, image: "shoes/1.jpg",    category: "shoes", owner: "Nike" },
  { _id: "f2", id: "f2", name: "Classic Sneaker",   price: 2499, image: "shoes/2.jpg",    category: "shoes", owner: "Adidas" },
  { _id: "f3", id: "f3", name: "Premium Watch",     price: 2999, image: "watches/1.jpg",  category: "watches", owner: "Rolex" },
  { _id: "f4", id: "f4", name: "Classic Watch",     price: 1999, image: "watches/2.jpg",  category: "watches", owner: "Titan" },
  { _id: "f5", id: "f5", name: "Casual Jacket",     price: 3999, image: "men wear/1.jpg", category: "fashion", owner: "Zara" },
  { _id: "f6", id: "f6", name: "Formal Shirt",      price: 1299, image: "men wear/2.jpg", category: "fashion", owner: "Levi's" },
  { _id: "f7", id: "f7", name: "Mechanical Keyboard", price: 4599, image: "keyboard/1.jpg", category: "electronics", owner: "Logitech" },
  { _id: "f8", id: "f8", name: "Gaming Keyboard",   price: 3999, image: "keyboard/2.jpg", category: "electronics", owner: "Razer" },
  { _id: "f9", id: "f9", name: "Premium Purse",     price: 3499, image: "purse/1.jpg", category: "fashion", owner: "Gucci" },
  { _id: "f10", id: "f10", name: "Everyday Purse",   price: 1499, image: "purse/2.jpg", category: "fashion", owner: "Fossil" },
  { _id: "f11", id: "f11", name: "Smart Watch",      price: 4999, image: "watches/3.jpg", category: "watches", owner: "Apple" },
  { _id: "f12", id: "f12", name: "Sports Shoe",      price: 2499, image: "shoes/3.jpg",    category: "shoes", owner: "Puma" }
];

// Defined standard lists for NLP query parsing
const knownBrands = ["nike", "adidas", "puma", "rolex", "titan", "apple", "zara", "gucci", "fossil", "logitech", "razer", "levi's", "levis"];
const categoryMap = {
  "shoes": ["shoes", "shoe", "footwear", "sneaker", "sneakers"],
  "watches": ["watches", "watch", "smartwatch", "smartwatches"],
  "fashion": ["fashion", "apparel", "clothing", "jacket", "shirt", "purse", "purses", "wear"],
  "electronics": ["electronics", "keyboard", "keyboards", "gadget", "gadgets"]
};

/**
 * Standard debounce helper function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Parses natural language search queries to extract semantic search criteria.
 * Supports patterns like:
 * - "under 1000", "less than 600", "below ₹3000"
 * - "above 1500", "over 2000", "greater than 1200"
 * - Brand matching ("nike", "rolex", etc.)
 * - Category matching/synonyms ("footwear", "clothing", etc.)
 */
function parseAISearchQuery(query) {
  if (!query) {
    return { priceFilter: null, brands: [], categories: [], keywords: [] };
  }

  const cleanQuery = query.toLowerCase().trim();
  let remainingText = cleanQuery;

  // 1. Parse Price Criteria
  let priceFilter = null;
  
  // Regex for "under/less than/below X"
  const underRegex = /(?:under|below|less than|under\s*₹|below\s*₹|less than\s*₹|max|maximum)\s*(\d+)/i;
  const underMatch = cleanQuery.match(underRegex);
  if (underMatch) {
    priceFilter = { type: "less", val: parseInt(underMatch[1], 10) };
    remainingText = remainingText.replace(underMatch[0], "");
  }

  // Regex for "above/over/greater than X"
  const aboveRegex = /(?:above|over|greater than|more than|above\s*₹|over\s*₹|greater than\s*₹|more than\s*₹|min|minimum)\s*(\d+)/i;
  const aboveMatch = cleanQuery.match(aboveRegex);
  if (aboveMatch) {
    priceFilter = { type: "greater", val: parseInt(aboveMatch[1], 10) };
    remainingText = remainingText.replace(aboveMatch[0], "");
  }

  // 2. Parse Brands
  const brands = [];
  knownBrands.forEach(brand => {
    // Word boundary check to avoid partial matching (e.g. "zara" in "zaragoza")
    const brandRegex = new RegExp(`\\b${brand}\\b`, "i");
    if (brandRegex.test(cleanQuery)) {
      brands.push(brand);
      remainingText = remainingText.replace(brandRegex, "");
    }
  });

  // 3. Parse Categories
  const categories = [];
  Object.entries(categoryMap).forEach(([catKey, synonyms]) => {
    synonyms.forEach(syn => {
      const synRegex = new RegExp(`\\b${syn}\\b`, "i");
      if (synRegex.test(cleanQuery)) {
        if (!categories.includes(catKey)) {
          categories.push(catKey);
        }
        remainingText = remainingText.replace(synRegex, "");
      }
    });
  });

  // 4. Extract Remaining General Keywords
  const keywords = remainingText
    .split(/\s+/)
    .map(w => w.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""))
    .filter(w => w.length > 1 && !["product", "products", "item", "items", "show", "find", "search", "with", "the", "under", "above"].includes(w));

  return {
    priceFilter,
    brands,
    categories,
    keywords
  };
}

/**
 * Filter products according to the parsed AI Search constraints
 */
function applyAISearch(products, query) {
  if (!query) {
    return { filtered: products, criteria: null };
  }

  const criteria = parseAISearchQuery(query);
  const { priceFilter, brands, categories, keywords } = criteria;

  const filtered = products.filter(p => {
    // 1. Brand filtering
    if (brands.length > 0) {
      const pBrand = (p.owner || "").toLowerCase().trim();
      const brandMatch = brands.some(b => {
        if (b === "levis" || b === "levi's") {
          return pBrand.includes("levi");
        }
        return pBrand.includes(b);
      });
      if (!brandMatch) return false;
    }

    // 2. Category filtering
    if (categories.length > 0) {
      const pCategory = (p.category || "").toLowerCase().trim();
      if (!categories.includes(pCategory)) return false;
    }

    // 3. Price boundary filtering
    if (priceFilter) {
      if (priceFilter.type === "less" && p.price > priceFilter.val) return false;
      if (priceFilter.type === "greater" && p.price < priceFilter.val) return false;
    }

    // 4. General Keyword filtering (Name / Category / Owner check)
    if (keywords.length > 0) {
      const pName = (p.name || "").toLowerCase();
      const pCat = (p.category || "").toLowerCase();
      const pOwner = (p.owner || "").toLowerCase();
      
      const keywordMatch = keywords.every(kw => 
        pName.includes(kw) || pCat.includes(kw) || pOwner.includes(kw)
      );
      if (!keywordMatch) return false;
    }

    return true;
  });

  return { filtered, criteria };
}

// Expose to window/global scope for easy script inclusion in HTML files
window.fallbackProducts = fallbackProducts;
window.parseAISearchQuery = parseAISearchQuery;
window.applyAISearch = applyAISearch;
window.debounce = debounce;
