const siteUrl = process.env.SITE_URL || "https://exoexs.com";

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: true,
  changefreq: "weekly",
  exclude: ["/upload/*"],
};

module.exports = config;
