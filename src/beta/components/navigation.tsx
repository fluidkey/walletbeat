import type { NavigationLinkItem } from './ui/organisms/Navigation';
import HomeIcon from '@mui/icons-material/Home';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import ForumIcon from '@mui/icons-material/Forum';
import GitHubIcon from '@mui/icons-material/GitHub';

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

export const navigationRepository: NavigationLinkItem = {
  id: 'code-repository',
  icon: <GitHubIcon />,
  title: 'Contribute on GitHub',
  href: 'https://github.com/fluidkey/walletbeat',
};

export const navigationFarcasterChannel: NavigationLinkItem = {
  id: 'farcaster-channel',
  icon: <ForumIcon />,
  title: 'Discuss on Farcaster',
  href: 'https://warpcast.com/~/channel/walletbeat',
};

export const scrollPastHeaderPixels = 16;