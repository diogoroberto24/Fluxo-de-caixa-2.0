// Força Tailwind a usar fallback JS/WASM em vez do binding nativo
// Isso evita o erro "Failed to load native binding" em ambientes Docker
process.env.TAILWIND_DISABLE_NATIVE = process.env.TAILWIND_DISABLE_NATIVE || '1'

// Em ESM, os imports são resolvidos antes do corpo. Usamos createRequire
// para garantir que a env seja setada antes de carregar o plugin.
process.env.TAILWIND_DISABLE_NATIVE = process.env.TAILWIND_DISABLE_NATIVE || '1'

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
