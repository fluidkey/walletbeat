import { generateBasicMetadata } from '@/components/metadata';
import { AboutPage } from '@/components/ui/pages/AboutPage';
import { betaSiteRoot } from '@/constants';
import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return generateBasicMetadata({
    title: 'About Walletbeat',
    route: `${betaSiteRoot}/about`,
    keywordsAfter: ['about'],
  });
}

export default function Page(): React.JSX.Element {
  return <AboutPage />;
}
