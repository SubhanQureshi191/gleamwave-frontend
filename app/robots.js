// app/robots.js
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/dashboard", "/cart", "/checkout"],
    },
    sitemap: "https://gleamwaveresin.com/sitemap.xml",
  };
}