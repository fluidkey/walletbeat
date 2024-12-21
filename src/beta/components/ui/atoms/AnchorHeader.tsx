import { Link, Typography, type TypographyProps } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import LinkIcon from '@mui/icons-material/Link';

export function AnchorHeader(props: TypographyProps & { id?: string }): React.JSX.Element {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <Typography {...props}>
      <Link
        key="link"
        href={props.id === undefined ? undefined : `#${props.id}`}
        underline="none"
        onMouseEnter={() => { setHovered(true); }}
        onMouseLeave={() => { setHovered(false); }}
        color="inherit"
      >
        {props.children}
        {hovered ? (
          <>
            {' '}
            <LinkIcon fontSize="small" sx={{ opacity: 0.75 }} />
          </>
        ) : null}
      </Link>
    </Typography>
  );
}
