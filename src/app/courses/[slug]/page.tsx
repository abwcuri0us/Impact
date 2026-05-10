import type { Metadata } from 'next';
import { courses } from '@/data/courses';
import CourseDetailContent from './CourseDetailContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (course) {
    return {
      title: `${course.title} | Impact Computers`,
      description: course.description,
      openGraph: {
        title: `${course.title} | Impact Computers`,
        description: course.description,
      },
    };
  }

  return {
    title: 'Course | Impact Computers',
    description: 'Explore our government-certified computer courses at Impact Computers, Navi Mumbai.',
  };
}

export default async function CourseDetailPage({ params }: Props) {
  return <CourseDetailContent />;
}
