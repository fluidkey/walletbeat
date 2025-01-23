import { generateBasicMetadata } from '@/beta/components/metadata';
import { AboutPage } from '@/beta/components/ui/pages/AboutPage';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return generateBasicMetadata({
    title: 'About Walletbeat',
    route: '/beta/about',
    keywordsAfter: ['about'],
  });
}

export default function Page(): React.JSX.Element {
  return <AboutPage />;
}
