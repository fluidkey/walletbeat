import WalletTable from '@/beta/components/ui/organisms/WalletTable';
import { Box, Link, Typography } from '@mui/material';
import type React from 'react';
import './global.css';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';

export default function Page(): React.JSX.Element {
  return (
    <Box maxWidth="100vw" display="flex" flexDirection="column" alignItems="center">
      <Box
        minHeight="100vh"
        maxWidth="100vw"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={2}
      >
        <Typography variant="h1" fontWeight={600} mt={4} maxWidth="90vw">
          ~ walletbeta
        </Typography>
        <WalletTable />
        <Typography variant="caption" mt={4} maxWidth="90vw">
          <Link href="/beta/faq">
            <HelpCenterIcon fontSize="small" />
            Frequently asked questions
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
