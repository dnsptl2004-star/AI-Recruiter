
module.exports = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
};
