import type { MetadataRoute } from 'next'

const BASE_URL = 'https://impactcomputers.in'

export default function sitemap(): MetadataRoute.Sitemap {
  // Static routes
  const staticRoutes = [
    '', '/about', '/courses', '/why-us', '/gallery',
    '/contact', '/facilities', '/ai-learning', '/enquiry',
    '/gallery/photos', '/gallery/videos', '/gallery/certificates', '/gallery/faculty',
  ]

  // Course slugs (these are the known courses from the database)
  const courseSlugs = [
    'ms-cit',
    'advance-tally-prime-with-gst-tax',
    'advance-excel',
    'python-and-mysql',
    'certificate-course-in-computerised-accounting-and-office-automation',
    'certificate-course-in-computer-operation-with-ms-office',
    'certificate-course-in-desktop-publishing',
    'certificate-course-in-computerised-accounting-cac',
    'certificate-course-in-web-designing',
    'certificate-course-in-computerised-accounting',
    'certificate-course-in-advanced-excel',
    'computer-teacher-training-course',
    'certificate-course-in-financial-accounting-cfa',
    'c-programming',
  ]

  const staticEntries = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  const courseEntries = courseSlugs.map((slug) => ({
    url: `${BASE_URL}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...courseEntries]
}
