'use client';

import type React from 'react';
import { labeledUrl, type Url } from '@/schema/url';
import { OpenInNewRounded } from '@mui/icons-material';
import { Box, Link, type TypographyOwnProps } from '@mui/material';

export function ExternalLink({
  url,
  defaultLabel = undefined,
  color = undefined,
  style = undefined,
  rel = 'noopener noreferrer nofollow',
}: {
  url: Url;
  defaultLabel?: string;
  color?: TypographyOwnProps['color'];
  style?: React.CSSProperties;
  rel?: string;
}): React.JSX.Element {
  const labeled = labeledUrl(url, defaultLabel);
  return (
    <Link
      href={labeled.url}
      target="_blank"
      rel={rel}
      color={color}
      style={style}
      display="flex"
      flexDirection="row"
      alignItems="end"
      gap="2px"
    >
      <Box>{labeled.label}</Box>
      <OpenInNewRounded color="inherit" fontSize="inherit" />
    </Link>
  );
}
