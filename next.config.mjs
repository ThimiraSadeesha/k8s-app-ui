// In the cluster the ingress sends /api straight to k8s-app-api, so these rewrites are never hit.
// They exist for local development only:
//   API_URL=https://api.dev-k8s.auren.rest npm run dev
// (the value is read when the server starts, or at build time for `next build`)
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
