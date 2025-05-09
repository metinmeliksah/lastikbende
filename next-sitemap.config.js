/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://lastikbende.com',
  generateRobotsTxt: true,
  exclude: ['/yonetici/*', '/bayi/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/yonetici', '/bayi', '/api']
      }
    ]
  },
  outDir: 'out', // Build çıktı dizini
  generateIndexSitemap: false, // Index sitemap üretme
}
