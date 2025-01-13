import type { TypographyProps } from '@mui/material';
import type React from 'react';
import { MarkdownBase } from './MarkdownBase';

interface MarkdownTypographyProps extends TypographyProps {
  children: string;
}

/**
 * Styled Markdown Typography.
 */
export function MarkdownTypography(props: MarkdownTypographyProps): React.JSX.Element {
  return (
    <MarkdownBase
      markdown={props.children.trim()}
      textColor={props.color}
      pFontWeight={props.fontWeight}
      pMarginTop={props.marginTop}
      pMarginBottom={props.marginBottom}
      pVariant={props.variant}
    />
  );
}
