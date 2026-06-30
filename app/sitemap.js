import { fetchGuides } from '../lib/guides.js';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zxsj.example.com';
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/calendar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ];

  try {
    const { guides } = await fetchGuides({ publishedOnly: true });
    const guidePages = guides.map((guide) => ({
      url: `${baseUrl}/guides/${guide.id}`,
      lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticPages, ...guidePages];
  } catch {
    return staticPages;
  }
}
