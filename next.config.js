/** @type {import('next').NextConfig} */
// const withTM = require('next-transpile-modules')(['@solana/wallet-adapter-base','@solana/wallet-adapter-react','@solana/wallet-adapter-react-ui','@solana/wallet-adapter-wallets','']);

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "cdn.discordapp.com",
      "pengapi.herokuapp.com",
      "pengpad.pengsol.com",
      "pengsol.com",
      "pengsol.s3.us-east-2.amazonaws.com",
      "pengsol-tools-types.vercel.app",
      "res.cloudinary.com",
      "https://tools-pi-sooty.vercel.app",
    ],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/projects",
        destination: "https://pengapi.herokuapp.com/api/projects",
      },
      {
        source: "/api/premints",
        destination: "https://pengapi.herokuapp.com/api/premints",
      },
      {
        source: "/api/premints/:id",
        destination: "https://pengapi.herokuapp.com/api/premints/:id",
      },
      {
        source: "/api/users/me",
        destination: "https://pengapi.herokuapp.com/api/users/me",
      },
      {
        source: "/api/onboardings",
        destination: "https://pengapi.herokuapp.com/api/onboardings",
      },
      {
        source: "/api/soldouts",
        destination: "https://pengapi.herokuapp.com/api/soldouts",
      },
    ];
  },
  resolve: {
    fallback: {
      fs: false,
    },
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
      },
    };
    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
