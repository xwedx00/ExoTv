/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "thumb.tapecontent.net" },
      { protocol: "https", hostname: "emojis.slackmojis.com" },
      { protocol: "https", hostname: "pic-bstarstatic.akamaized.net" },
    ],
    minimumCacheTTL: 604800,
  },
};

module.exports = nextConfig;
