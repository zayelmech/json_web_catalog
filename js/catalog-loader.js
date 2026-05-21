(function () {
  const ALLOWED_TEMPLATES = ["restaurant-menu", "store", "default-catalog"];

  function buildFetchError(path, error) {
    const isRemote = /^https?:\/\//i.test(path);
    const base = isRemote
      ? "No se pudo descargar el catálogo remoto."
      : "No se pudo leer catalog.json local.";
    const corsHint = isRemote
      ? " Si usas Firebase Storage, revisa CORS del bucket y permisos de lectura pública."
      : "";

    const fetchError = new Error(`${base}${corsHint}`);
    fetchError.name = "CatalogFetchError";
    fetchError.details = error;
    return fetchError;
  }

  function buildHttpError(path, status) {
    const isRemote = /^https?:\/\//i.test(path);
    const reason = isRemote
      ? `El servidor respondió con HTTP ${status}.`
      : `No se encontró ./catalog.json (HTTP ${status}).`;

    const httpError = new Error(`No se pudo cargar el catálogo. ${reason}`);
    httpError.name = "CatalogHttpError";
    return httpError;
  }

  async function loadCatalogJson(path) {
    let response;
    try {
      response = await fetch(path, { cache: "no-store" });
    } catch (error) {
      throw buildFetchError(path, error);
    }

    if (!response.ok) {
      throw buildHttpError(path, response.status);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error("El JSON del catálogo no es válido o está corrupto.");
    }
  }

  function normalizeCatalog(raw) {
    if (!raw || typeof raw !== "object") {
      throw new Error("El contenido del catálogo no tiene la estructura esperada.");
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
