# puntrosales-web-catalog

Visor web estático para catálogos exportados por PuntroSales, construido **solo con HTML, CSS y JavaScript vanilla**.

## ¿Qué es este proyecto?

Este repositorio contiene una web estática que lee un `catalog.json` y renderiza un catálogo público con:

- Plantillas visuales seleccionables por JSON.
- Buscador de productos.
- Filtros por categorías (chips/tabs).
- Cards responsive con imagen, precio, unidad y disponibilidad.
- Manejo de errores y vista de catálogo expirado.

No hay backend ni dependencias obligatorias externas.

## Estructura

```text
/
  index.html
  catalog.json
  README.md
  /css
    base.css
    templates.css
  /js
    app.js
    templates.js
    catalog-loader.js
  /assets
    placeholder.svg
```

## Cómo correr localmente

### Opción A: abrir archivo directamente

1. Descarga el repo.
2. Abre `index.html` en un navegador moderno.

> Nota: algunos navegadores bloquean `fetch()` en archivos `file://`. Si ocurre, usa la opción B.

### Opción B: servidor estático local

Puedes usar cualquier servidor estático simple:

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Cómo cambiar la plantilla desde `catalog.json`

El campo `template` permite elegir el diseño:

- `restaurant-menu`
- `store`
- `default-catalog`

Si llega un valor no válido, la app usa `default-catalog` automáticamente.

## Publicar en GitHub Pages (rama `main`)

1. Sube el contenido a GitHub en la rama `main`.
2. Ve a **Settings → Pages**.
3. En **Build and deployment**, selecciona:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` y carpeta `/ (root)`
4. Guarda y espera el deploy.

La web está preparada con rutas relativas (`./css/...`, `./js/...`, `./assets/...`), así que funciona bien en rutas como:

`https://usuario.github.io/puntrosales-web-catalog/`

## Ejemplo de JSON

```json
{
  "catalogId": "demo-catalog",
  "template": "store",
  "store": {
    "name": "PuntroSales Demo Store",
    "description": "Catálogo generado desde PuntroSales",
    "logoUrl": "",
    "currency": "MXN",
    "whatsapp": "",
    "location": ""
  },
  "expiresAt": "2099-12-31T23:59:59-06:00",
  "categories": ["Todos", "Bebidas", "Snacks", "Limpieza", "Cocina"],
  "products": [
    {
      "id": "prod_001",
      "name": "Café soluble",
      "description": "Café soluble clásico de uso diario.",
      "category": "Bebidas",
      "price": 85.5,
      "unit": "pieza",
      "available": true,
      "stock": 10,
      "imageUrl": "https://placehold.co/600x400?text=Cafe"
    }
  ]
}
```

## Notas para integración futura con PuntroSales

- En este demo, los datos se leen desde `catalog.json` local.
- En producción, ese JSON puede venir desde hosting estático como:
  - Firebase Storage
  - OCI Object Storage
  - NGINX sirviendo archivos estáticos
  - S3 compatible u otra CDN estática
- Mientras el archivo JSON cumpla la estructura esperada, la UI lo renderizará.

## Funcionalidades incluidas

- Plantillas: `restaurant-menu`, `store`, `default-catalog`.
- Fallback de plantilla inválida a `default-catalog`.
- Validación básica y errores amigables de carga/parsing.
- Pantalla de catálogo expirado (`expiresAt`).
- Buscador por nombre, descripción y categoría.
- Chips de categoría con opción `Todos`.
- Placeholder local si la imagen falta.
- Badge de disponibilidad (`Disponible` / `Agotado`) cuando existe `available`.
- Formato de precios con `Intl.NumberFormat` usando moneda del catálogo.
- Botón para copiar link actual.
- Botón de WhatsApp cuando `store.whatsapp` existe.

## Alcance

Este proyecto **no implementa carrito ni pedidos**: es un visor público estático de catálogo.

## Probar con Firebase Storage

Puedes usar la misma web en GitHub Pages para cargar un catálogo remoto por query param `catalog`.

### 1) Subir `catalog.json` a Firebase Storage

1. En Firebase Console, entra a **Storage** de tu proyecto.
2. Crea (si no existe) la ruta:
   - `catalogs/demo-puntrosales-001/catalog.json`
3. Sube tu archivo `catalog.json` en esa ubicación.

### 2) Subir imágenes del catálogo

Sube las imágenes a:

- `catalogs/demo-puntrosales-001/images/`

Luego usa esas URLs públicas en el campo `imageUrl` de cada producto dentro de `catalog.json`.

### 3) Obtener URL pública del `catalog.json`

La URL de descarga pública normalmente queda así:

`https://firebasestorage.googleapis.com/v0/b/BUCKET/o/catalogs%2Fdemo-puntrosales-001%2Fcatalog.json?alt=media`

Asegúrate de que las reglas/permisos permitan lectura pública para pruebas (o utiliza un token de descarga válido).

### 4) Codificar URL para usarla en GitHub Pages

Codifica **la URL completa** con `encodeURIComponent(...)`, por ejemplo desde consola del navegador:

```js
const firebaseCatalogUrl = "https://firebasestorage.googleapis.com/v0/b/BUCKET/o/catalogs%2Fdemo-puntrosales-001%2Fcatalog.json?alt=media";
const encoded = encodeURIComponent(firebaseCatalogUrl);
console.log(encoded);
```

### 5) URL final de prueba

Usa tu GitHub Pages con el parámetro `catalog`:

`https://USUARIO.github.io/puntrosales-web-catalog/?catalog=URL_FIREBASE_CODIFICADA`

Ejemplo completo:

`https://USUARIO.github.io/puntrosales-web-catalog/?catalog=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2FBUCKET%2Fo%2Fcatalogs%252Fdemo-puntrosales-001%252Fcatalog.json%3Falt%3Dmedia`

### Comportamiento esperado

- Sin query param, la app carga `./catalog.json`.
- Con `?catalog=...`, la app intenta cargar la URL remota usando el valor retornado por `URLSearchParams.get("catalog")` (sin `decodeURIComponent` manual adicional).
- Para Firebase Storage, esto evita romper el object path (`%2F`) dentro de la URL del archivo.
- Si falla descarga, CORS o permisos de Firebase, verás un mensaje claro en pantalla y detalles en consola.
