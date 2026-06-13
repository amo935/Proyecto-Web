# Game Ender

Proyecto final para el curso de Desarrollo de Aplicaciones Web e Inteligencia Artificial (DAW-IA-2026).

## Descripción

Game Ender es una aplicación web full-stack que integra un frontend moderno construido con **Nuxt 3** y **Vue 3**, junto con una API robusta desarrollada en **Node.js** con **Express** y **TypeScript**. El proyecto utiliza **Supabase** como servicio de base de datos y autenticación.

## Estructura del Proyecto

Este repositorio está organizado como un monorepo con las siguientes carpetas principales:

```
.
├── backend/          # API REST con Express + TypeScript
├── frontend/         # Aplicación web con Nuxt 3 + Vue 3
├── scripts/          # Scripts de automatización (desarrollo)
└── package.json      # Configuración raíz del monorepo
```

### Backend

- **Framework:** [Express](https://expressjs.com/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de datos y auth:** [Supabase](https://supabase.com/)
- **Validación:** [Zod](https://zod.dev/)
- **Otros:** bcryptjs, cors, multer, cookie-parser

### Frontend

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **UI:** [Vue 3](https://vuejs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- **Ruteo:** Vue Router (integrado en Nuxt)

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión recomendada: 20 LTS)
- [npm](https://www.npmjs.com/)

## Instalación

Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las dependencias del monorepo:

```bash
npm run install:all
```

Este comando instalará las dependencias de la raíz, del `backend` y del `frontend`.

## Desarrollo

Para iniciar el entorno de desarrollo completo (backend y frontend en paralelo) ejecuta:

```bash
npm run dev
```

Este comando lanzará simultáneamente:
- La API en modo watch (`tsx watch`)
- El frontend con el servidor de desarrollo de Nuxt

Si prefieres ejecutar cada servicio por separado:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia backend y frontend en paralelo |
| `npm run dev:backend` | Inicia solo la API de Express |
| `npm run dev:frontend` | Inicia solo el servidor de desarrollo de Nuxt |
| `npm run install:all` | Instala todas las dependencias del proyecto |

### Scripts específicos del frontend

- `npm run build` - Compila la aplicación para producción
- `npm run generate` - Genera una versión estática de la aplicación
- `npm run preview` - Previsualiza la build de producción

### Scripts específicos del backend

- `npm run build` - Compila TypeScript a JavaScript (`dist/`)
- `npm run start` - Ejecuta la versión compilada en producción

## Variables de Entorno

Asegúrate de configurar las variables de entorno necesarias en archivos `.env` tanto en `backend` como en `frontend`. Algunas comunes son:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (para el backend)

## Autores

- **Agueda** - Desarrollo principal

## Licencia

Este proyecto es de uso académico para el curso DAW-IA-2026.
