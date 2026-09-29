# 🏥 GuardiasApp — Gestión de guardia médica

Aplicación web para registrar pacientes, ordenar la sala de espera según el triage, coordinar al equipo de guardia y estimar retribuciones. Funciona sin servidor: los datos se guardan en el navegador.

## 🎓 Información académica

- **Institución:** Universidad Tecnológica Nacional (UTN FRT)
- **Alumna:** María José Thompson
- **Legajo:** 61026
- **Modalidad:** Proyecto individual (frontend estático)

## 📁 Estructura

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura semántica y metadatos SEO. Sin estilos ni eventos inline. |
| `style.css` | Paleta del tema, expresada con las variables CSS oficiales de Bootstrap 5.3. |
| `main.js` | Lógica: roles, validación, sala de espera, equipo médico y calculadora. |

## 🔎 Estrategia SEO

Cuatro frentes, todos presentes en el código:

1. **SEO técnico:** HTML5 semántico (`header`, `nav`, `main`, `section`, `article`, `footer`), un único `<h1>`, jerarquía de títulos ordenada, `lang="es"`, enlace "Saltar al contenido", `aria-label` en regiones y `<noscript>` con aviso.
2. **Indexación:** directiva `robots` y URL canónica.
3. **On-page:** palabras clave en `<title>`, descripción y encabezados, con texto natural.
4. **Compartir en redes (SMO) y datos estructurados:** Open Graph, Twitter Cards y JSON-LD `WebApplication`.

## 🏷️ Etiquetas del `<head>` (19 `<meta>` + 3 elementos)

### Base y autoría

| Etiqueta | Función |
|---|---|
| `<meta charset="UTF-8">` | Codificación; evita errores con tildes y ñ. |
| `<meta name="viewport">` | Diseño adaptable en celulares. |
| `<title>` | Título en resultados de búsqueda y pestaña. |
| `<meta name="description">` | Resumen que suele mostrarse bajo el título en Google. |
| `<meta name="keywords">` | Palabras clave del tema. Google la ignora; se conserva por documentación. |
| `<meta name="author">` | Autoría del proyecto. |
| `<meta name="theme-color">` | Color de la barra del navegador en móviles. |

### Indexación

| Etiqueta | Función |
|---|---|
| `<meta name="robots" content="index, follow">` | Permite indexar la página y seguir sus enlaces. |
| `<link rel="canonical">` | URL preferida; evita contenido duplicado. |
| `<link rel="icon">` | Ícono de pestaña (emoji en SVG embebido, sin archivo extra). |

### Open Graph (WhatsApp, Facebook, LinkedIn)

| Etiqueta | Función |
|---|---|
| `og:type` | Tipo de contenido (`website`). |
| `og:site_name` | Nombre del sitio. |
| `og:locale` | Idioma y región (`es_AR`). |
| `og:title` | Título de la tarjeta al compartir. |
| `og:description` | Texto de la tarjeta. |
| `og:url` | URL oficial del sitio. |
| `og:image` | Imagen de vista previa. |
| `og:image:alt` | Descripción accesible de la imagen. |

### Twitter / X

| Etiqueta | Función |
|---|---|
| `twitter:card` | Formato de tarjeta (`summary_large_image`). |
| `twitter:title` | Título en X. |
| `twitter:description` | Descripción en X. |
| `twitter:image` | Imagen en X. |

### Datos estructurados

`<script type="application/ld+json">` con el esquema `WebApplication` de schema.org: le indica a los buscadores que se trata de una aplicación de salud, su autora e idioma.

### ⚠️ Antes de publicar

- Reemplazá `https://guardiasapp.netlify.app/` (canonical, `og:url`, `og:image`, `twitter:image` y JSON-LD) por la URL real de Netlify.
- Creá una imagen de **1200 × 630 px** llamada `og-guardiasapp.png` en la raíz del proyecto; sin ella las tarjetas se ven sin imagen.

## ⚡ Funcionalidades

- **Admisión:** formulario validado con Bootstrap; rechaza DNI repetidos en la sala.
- **Sala de espera:** se ordena por urgencia (Rojo, Amarillo, Verde) y hora de llegada. Estados: *En Espera*, *En Atención*, *Atendido*.
- **Estado del servicio:** atendidos del día, espera media y turno se calculan con los datos reales.
- **Equipo médico:** alta con formulario, cambio de guardia/descanso y baja con confirmación.
- **Retribuciones:** valor por hora según perfil, horas totales, complemento y total bruto.
- **Persistencia:** los datos sobreviven a recargar la página (`localStorage`); la sesión, hasta cerrar la pestaña.

## 👥 Roles (cuentas de prueba, clave `1234`)

| Usuario | Rol | Puede |
|---|---|---|
| `recepcion` | Recepcionista | Admitir, atender, finalizar y eliminar pacientes. |
| `medico` | Médico | Atender, finalizar y cambiar su estado de guardia. |
| `admin` | Administrador | Gestionar médicos y usar la calculadora. |

> El acceso es una simulación del lado del cliente con fines didácticos. Un sistema real debe autenticar en un servidor.

## 🛠️ Tecnologías

- HTML5 semántico y JavaScript ES6+ (sin frameworks)
- Bootstrap 5.3 y Bootstrap Icons (tema oscuro)
- Git y GitHub (ramas `main`, `dev`, `feature/*`)
- Despliegue en Netlify

## ▶️ Cómo ejecutarlo

Abrí `index.html` en el navegador o usá la extensión **Live Server** de VS Code. Requiere conexión a internet para cargar Bootstrap desde CDN.
