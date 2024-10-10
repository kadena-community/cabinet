// next.config.mjs
export default {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'], // Use SVGR webpack loader
    });

    return config;
  },
};
