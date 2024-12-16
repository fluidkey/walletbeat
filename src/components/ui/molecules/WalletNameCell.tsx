import type { RatedWallet } from '@/schema/wallet';
import { UnfoldLess, UnfoldMore } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import Image from 'next/image';
import type React from 'react';
import { shortRowHeight } from '../constants';
import { ExternalLink } from '../atoms/ExternalLink';

const walletIconSize = shortRowHeight / 2;

/** The first column's cell in the wallet comparison table. */
export function WalletNameCell({
  wallet,
  expanded,
  toggleExpanded,
}: {
  wallet: RatedWallet;
  expanded: boolean;
  toggleExpanded: () => void;
}): React.JSX.Element {
  return (
    <Box display="flex" justifyContent="flex-start" alignItems="flex-start" flexDirection="column">
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        gap="8px"
        width="100%"
        height={shortRowHeight}
      >
        {/* The fold/unfold icons have a hover effect which makes them look
          like they have a huge margin when not hovered, so compensate for
          this by adding negative margin here. */}
        <Box display="flex" flexDirection="column" justifyContent="center" height={shortRowHeight}>
          <IconButton size="small" onClick={toggleExpanded}>
            {expanded ? <UnfoldLess /> : <UnfoldMore />}
          </IconButton>
        </Box>
        <Image
          alt={wallet.metadata.displayName}
          width={walletIconSize}
          height={walletIconSize}
          src={`/images/wallets/${wallet.metadata.id}.${wallet.metadata.iconExtension}`}
        />
        <Box flex="1">
          <Typography variant="subtitle1">{wallet.metadata.displayName}</Typography>
        </Box>
      </Box>
      {expanded ? (
        <Box display="flex" flexDirection="column" sx={{ lineHeight: 1, whiteSpace: 'normal' }}>
          {wallet.metadata.blurb.render({
            typography: {
              variant: 'body2',
              fontWeight: 'normal',
              lineHeight: 1.25,
              marginBottom: '0.5rem',
            },
          })}
          <Typography
            variant="caption"
            display="flex"
            flexDirection="row"
            alignItems="baseline"
            gap="6px"
          >
            <ExternalLink
              url={wallet.metadata.url}
              defaultLabel={`${wallet.metadata.displayName} website`}
            />
            {wallet.metadata.repoUrl === undefined ? null : (
              <ExternalLink url={wallet.metadata.repoUrl} defaultLabel="Code" />
            )}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
