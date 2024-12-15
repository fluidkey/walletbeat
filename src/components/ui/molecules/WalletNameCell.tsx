import type { RatedWallet } from '@/schema/wallet';
import { UnfoldMore } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import type React from 'react';

/** The first column's cell in the wallet comparison table. */
export function WalletNameCell({ wallet }: { wallet: RatedWallet }): React.JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      width="100%"
      height="100%"
    >
      <Box>
        <IconButton size="small">
          <UnfoldMore />
        </IconButton>
      </Box>
      <Image
        alt={wallet.metadata.displayName}
        width="48"
        height="48"
        src={`/images/wallets/${wallet.metadata.id}.${wallet.metadata.iconExtension}`}
      />
      <Box flex="1">
        <Typography>{wallet.metadata.displayName}</Typography>
      </Box>
    </Box>
  );
}
