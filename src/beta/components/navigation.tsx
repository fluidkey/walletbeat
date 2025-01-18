import type { NavigationLinkItem } from './ui/organisms/Navigation';
import HomeIcon from '@mui/icons-material/Home';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

export const navigationHome: NavigationLinkItem = {
  id: 'wallet-table',
  icon: <HomeIcon />,
  title: 'Walletbeat',
  href: '/beta',
};

export const navigationFaq: NavigationLinkItem = {
  id: 'faq',
  icon: <HelpCenterIcon />,
  title: 'FAQ',
  href: '/beta/faq',
};

export const scrollPastHeaderPixels = 16;
