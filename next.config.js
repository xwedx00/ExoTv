const { i18n } = require("./next-i18next.config");

module.exports = {
  images: {
    domains: [
      "s4.anilist.co",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "platform-lookaside.fbsbx.com",
      "i.ibb.co",
      "thumb.tapecontent.net",
      "emojis.slackmojis.com",
      "pic-bstarstatic.akamaized.net",
      "cdn.discordapp.com",
    ],
    minimumCacheTTL: 604800, // a week,
  },
  i18n,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};
