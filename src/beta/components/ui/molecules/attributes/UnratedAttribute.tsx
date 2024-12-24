import type { RatedWallet } from '@/beta/schema/wallet';
import { WrapRatingIcon } from '../../atoms/WrapRatingIcon';
import { Rating } from '@/beta/schema/attributes';
import { Typography } from '@mui/material';
import { ExternalLink } from '../../atoms/ExternalLink';

export function UnratedAttribute({ wallet }: { wallet: RatedWallet }): React.JSX.Element {
  return (
    <WrapRatingIcon rating={Rating.UNRATED}>
      <Typography>
        Walletbeat&apos;s database does not have the necessary information on
        {wallet.metadata.displayName} to assess this question.
      </Typography>
      <Typography>
        Please help us by contributing your knowledge on{' '}
        <ExternalLink url="https://github.com/fluidkey/walletbeat" rel="">
          our repository
        </ExternalLink>
        !
      </Typography>
    </WrapRatingIcon>
  );
}
