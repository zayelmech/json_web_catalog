(function () {
  const app = document.getElementById("app");
  const state = {
    catalog: null,
    selectedCategory: "Todos",
    search: ""
  };

  function formatPrice(value) {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: state.catalog?.store?.currency || "MXN"
    }).format(amount);
  }

  function normalizeCategories(catalog) {
    const set = new Set((catalog.categories || []).filter(Boolean));
    set.add("Todos");
    return Array.from(set);
  }

  function getFilteredProducts() {
    const search = state.search.trim().toLowerCase();
    return state.catalog.products.filter((product) => {
      const inCategory = state.selectedCategory === "Todos" || product.category === state.selectedCategory;
      if (!inCategory) return false;
      if (!search) return true;

      const blob = `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase();
      return blob.includes(search);
    });
  }

  function categoriesHtml(categories) {
    return `<section class="chips" aria-label="Categorías">${categories.map((category) => `
      <button class="chip ${category === state.selectedCategory ? "active" : ""}" data-category="${CatalogTemplates.escapeHtml(category)}">${CatalogTemplates.escapeHtml(category)}</button>
    `).join("")}</section>`;
  }

  function productsHtml(products) {
    if (!products.length) {
      return `<section class="message-card">No encontramos productos con los filtros seleccionados.</section>`;
    }
    return `<section class="grid">${products.map((product) => CatalogTemplates.productCard(product, formatPrice)).join("")}</section>`;
  }

  function controlsHtml() {
    const wa = state.catalog.store.whatsapp
      ? `<a class="btn btn-ghost" target="_blank" rel="noopener noreferrer" href="https://wa.me/${encodeURIComponent(state.catalog.store.whatsapp)}">Contactar por WhatsApp</a>`
      : "";

    return `
      <div class="toolbar">
        <input id="searchInput" class="search-input" type="search" placeholder="Buscar por nombre, descripción o categoría" value="${CatalogTemplates.escapeHtml(state.search)}" />
        <button id="copyLinkBtn" class="btn btn-primary" type="button">Copiar link</button>
        ${wa}
      </div>
    `;
  }

  function bindEvents() {
    document.querySelectorAll(".chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCategory = button.dataset.category || "Todos";
        render();
      });
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        state.search = event.target.value;
        render();
      });
    }

    const copyBtn = document.getElementById("copyLinkBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          copyBtn.textContent = "¡Link copiado!";
          setTimeout(() => (copyBtn.textContent = "Copiar link"), 1600);
        } catch (error) {
          copyBtn.textContent = "No se pudo copiar";
          setTimeout(() => (copyBtn.textContent = "Copiar link"), 1600);
        }
      });
    }
  }

  function renderExpired() {
    app.innerHTML = `<main class="container"><section class="message-card"><h1>Este catálogo expiró</h1><p>Solicita al comercio una versión actualizada.</p></section></main>`;
  }

  function render() {
    const categories = normalizeCategories(state.catalog);
    const filtered = getFilteredProducts();
    const templateName = CatalogLoader.ALLOWED_TEMPLATES.includes(state.catalog.template)
      ? state.catalog.template
      : "default-catalog";

    const renderer = CatalogTemplates.renderers[templateName] || CatalogTemplates.renderers["default-catalog"];
    app.innerHTML = renderer({
      catalog: state.catalog,
      categoriesHtml: categoriesHtml(categories),
      productsHtml: productsHtml(filtered),
      controlsHtml: controlsHtml()
    });

    bindEvents();
  }

  async function init() {
    try {
      const catalogPath = CatalogLoader.resolveCatalogPath();
      const data = await CatalogLoader.loadCatalogJson(catalogPath);
      state.catalog = CatalogLoader.normalizeCatalog(data);

      if (CatalogLoader.isCatalogExpired(state.catalog.expiresAt)) {
        renderExpired();
        return;
      }

      render();
    } catch (error) {
      app.innerHTML = `<main class="container"><section class="message-card error"><h1>No pudimos cargar el catálogo</h1><p>${CatalogTemplates.escapeHtml(error.message)}</p></section></main>`;
    }
  }

  init();
})();
