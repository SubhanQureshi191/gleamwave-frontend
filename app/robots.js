// app/robots.js
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/dashboard", "/cart", "/checkout"],
    },
    sitemap: "https://www.gleamwaveresin.com/sitemap.xml",
  };
}