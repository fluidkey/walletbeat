import { Typography } from '@mui/material';
import Link from 'next/link';
import type React from 'react';
import Markdown, { type Components } from 'react-markdown';
import { ExternalLink } from './ExternalLink';

/**
 * Markdown rendering.
 *
 * Should not be used directly; use MarkdownBox or MarkdownTypography.
 */
export function MarkdownBase({
  markdown,
  pVariant = undefined,
  pFontWeight = undefined,
  pMarginTop = '0.5rem',
  pMarginBottom = '0.5rem',
  textColor = 'inherit',
}: {
  markdown: string;
  pVariant?: React.ComponentProps<typeof Typography>['variant'];
  pFontWeight?: React.ComponentProps<typeof Typography>['fontWeight'];
  pMarginTop?: React.ComponentProps<typeof Typography>['marginTop'];
  pMarginBottom?: React.ComponentProps<typeof Typography>['marginBottom'];
  textColor?: React.ComponentProps<typeof Typography>['color'];
}): React.JSX.Element {
  const componentsMap: Components = {
    a: ({ href, children }) => {
      const hrefStr = href ?? '#';
      if (/^[-_\w+:]/.exec(hrefStr) !== null) {
        // External link.
        return <ExternalLink url={hrefStr}>{children}</ExternalLink>;
      }
      return <Link href={hrefStr}>{children}</Link>;
    },
    p: ({ children }) => (
      <Typography
        variant={pVariant}
        color={textColor}
        fontWeight={pFontWeight}
        marginTop={pMarginTop}
        marginBottom={pMarginBottom}
      >
        {children}
      </Typography>
    ),
    li: ({ children }) => (
      <li>
        <Typography
          variant={pVariant}
          color={textColor}
          fontWeight={pFontWeight}
          marginTop={pMarginTop}
          marginBottom={pMarginBottom}
        >
          {children}
        </Typography>
      </li>
    ),
  };
  return <Markdown components={componentsMap}>{markdown}</Markdown>;
}
