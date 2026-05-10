'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const AIChatAvatar = dynamic(() => import('@/components/AIChatAvatar'), {
  ssr: false,
  loading: () => null,
});

export default function ClientChatbot() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return <AIChatAvatar />;
}
