(function () {
  const ALLOWED_TEMPLATES = ["restaurant-menu", "store", "default-catalog"];

  async function loadCatalogJson(path) {
    let response;
    try {
      response = await fetch(path, { cache: "no-store" });
    } catch (error) {
      throw new Error("No se pudo leer catalog.json. Verifica ruta y conexión local.");
    }

    if (!response.ok) {
      throw new Error("No se encontró catalog.json en la ruta esperada.");
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error("El JSON del catálogo está corrupto o no es válido.");
    }
  }

  function normalizeCatalog(raw) {
    if (!raw || typeof raw !== "object") {
      throw new Error("El contenido de catalog.json no tiene el formato esperado.");
    }

    const template = ALLOWED_TEMPLATES.includes(raw.template) ? raw.template : "default-catalog";
    const store = raw.store && typeof raw.store === "object" ? raw.store : {};

    return {
      catalogId: String(raw.catalogId || "catalog-sin-id"),
      template,
      store: {
        name: store.name || "Catálogo PuntroSales",
        description: store.description || "",
        logoUrl: store.logoUrl || "",
        currency: store.currency || "MXN",
        whatsapp: store.whatsapp || "",
        location: store.location || ""
      },
      expiresAt: raw.expiresAt || null,
      categories: Array.isArray(raw.categories) ? raw.categories : ["Todos"],
      products: Array.isArray(raw.products) ? raw.products : []
    };
  }

  function isCatalogExpired(expiresAt) {
    if (!expiresAt) return false;
    const parsedDate = new Date(expiresAt);
    if (Number.isNaN(parsedDate.getTime())) return false;
    return parsedDate.getTime() < Date.now();
  }

  window.CatalogLoader = {
    loadCatalogJson,
    normalizeCatalog,
    isCatalogExpired,
    ALLOWED_TEMPLATES
  };
})();
