/** @type {import('next').NextConfig} */
// Fully static export so the app can be hosted on GitHub Pages (no Node server).
// The swap talks to the 1Click API directly from the browser (CORS-enabled).
// `NEXT_PUBLIC_BASE_PATH` is set to "/<repo>" by the Pages workflow; empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
