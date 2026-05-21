(function () {
  const PLACEHOLDER = "./assets/placeholder.svg";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function productCard(product, formatPrice) {
    const imageUrl = product.imageUrl ? escapeHtml(product.imageUrl) : PLACEHOLDER;
    const description = product.description ? `<p class="product-description">${escapeHtml(product.description)}</p>` : "";
    const availability = typeof product.available === "boolean"
      ? `<span class="badge ${product.available ? "success" : "danger"}">${product.available ? "Disponible" : "Agotado"}</span>`
      : "";

    return `
      <article class="product-card">
        <img class="product-image" src="${imageUrl}" alt="${escapeHtml(product.name || "Producto")}" loading="lazy" onerror="this.onerror=null;this.src='./assets/placeholder.svg';" />
        <div class="product-content">
          <h3 class="product-name">${escapeHtml(product.name || "Producto sin nombre")}</h3>
          ${description}
          <p class="product-meta">Categoría: ${escapeHtml(product.category || "Sin categoría")}</p>
          <p class="product-meta">Unidad: ${escapeHtml(product.unit || "N/D")}</p>
          ${availability}
          <p class="product-price">${formatPrice(product.price)}</p>
        </div>
      </article>
    `;
  }

  function renderShared({ catalog, categoriesHtml, productsHtml, controlsHtml }) {
    return `
      <main class="container template-${catalog.template}">
        <section class="header-card">
          <h1 class="store-title">${escapeHtml(catalog.store.name)}</h1>
          <p class="store-description">${escapeHtml(catalog.store.description || "")}</p>
          ${controlsHtml}
        </section>
        ${categoriesHtml}
        ${productsHtml}
      </main>
    `;
  }

  function renderStore(params) { return renderShared(params); }
  function renderDefaultCatalog(params) { return renderShared(params); }
  function renderRestaurantMenu(params) { return renderShared(params); }

  window.CatalogTemplates = {
    renderers: {
      "store": renderStore,
      "default-catalog": renderDefaultCatalog,
      "restaurant-menu": renderRestaurantMenu
    },
    productCard,
    escapeHtml
  };
})();
