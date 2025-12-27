export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Admin panel ko google search se chhupayein
    },
    sitemap: 'https://jeevanhariavnsh.vercel.app/sitemap.xml', // Apni domain lagayein
  }
}