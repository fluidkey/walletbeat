import WalletTable from '@/beta/components/ui/organisms/WalletTable';
import { Box, Typography } from '@mui/material';
import type React from 'react';
import './global.css';

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
      </Box>
    </Box>
  );
}
