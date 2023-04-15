const { withAxiom } = require("next-axiom");

module.exports = withAxiom({
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    // eslint-disable-next-line no-param-reassign
    config.experiments = { layers: true };
    return config;
  },
  experimental: {
    forceSwcTransforms: true,
  },
});
