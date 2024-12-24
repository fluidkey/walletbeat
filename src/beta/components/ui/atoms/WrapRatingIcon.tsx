import { type Rating, ratingToIcon } from '@/beta/schema/attributes';
import { Box, Typography } from '@mui/material';
import type React from 'react';
import { subsectionIconWidth } from '../../constants';

export function WrapRatingIcon({
  rating,
  children = undefined,
}: {
  rating: Rating;
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <Box display="flex" flexDirection="row" gap="0px">
      <Box
        flex="0"
        minWidth={subsectionIconWidth}
        maxWidth={subsectionIconWidth}
        display="flex"
        flexDirection="row"
      >
        <Box flex="2" />
        <Typography flex="0" variant="h5" fontSize="20px">
          {ratingToIcon(rating)}
        </Typography>
        <Box flex="7" />
      </Box>
      <Box flex="1">{children}</Box>
    </Box>
  );
}
