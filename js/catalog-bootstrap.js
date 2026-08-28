/* Threaded Trinkets catalog bootstrap.
   Loads the existing catalog only when this browser has no local catalog.
   Existing localStorage data always wins and is never overwritten. */
(function () {
  "use strict";
  const PRODUCTS_KEY = "threadedTrinketsProducts";
  const CATEGORIES_KEY = "threadedTrinketsCategories";
  const CATALOG_URL = "data/threaded-trinkets-catalog.json";

  window.threadedTrinketsCatalogReady = (async function () {
    try {
      const hasProducts = !!localStorage.getItem(PRODUCTS_KEY);
      const hasCategories = !!localStorage.getItem(CATEGORIES_KEY);

      if (hasProducts && hasCategories) return;

      const response = await fetch(CATALOG_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Catalog HTTP " + response.status);

      const catalog = await response.json();

      if (!hasCategories && Array.isArray(catalog.categories)) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(catalog.categories));
      }

      if (!hasProducts && Array.isArray(catalog.products)) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(catalog.products));
      }
    } catch (error) {
      console.warn("Threaded Trinkets catalog bootstrap unavailable:", error);
    }
  })();
})();