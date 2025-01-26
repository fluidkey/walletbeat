'use client';

import { Box, type BoxProps, type TypographyProps } from '@mui/material';
import type React from 'react';
import {
  deriveMarkdownPropsFromTypography,
  MarkdownBase,
  type MarkdownOwnProps,
} from './MarkdownBase';

interface MarkdownBoxProps extends BoxProps, MarkdownOwnProps {
  children: string;
  pTypography?: TypographyProps;
}

/**
 * Trim longest shared whitespace prefix in all non-whitespace-only lines.
 *
 * Useful to make Markdown text properly indented in source code, yet
 * rendered correctly when passed to the Markdown renderer which assumes
 * no indentation in its input.
 */
function trimWhitespacePrefix(str: string): string {
  const lines = str.split('\n');
  let longestCommonPrefix: string | null = null;
  for (const line of lines) {
    if (line.trim() === '') {
      continue; // Ignore whitespace-only lines.
    }
    const whitespacePrefixReg = /^\s+/.exec(line);
    if (whitespacePrefixReg === null) {
      return str; // No common whitespace prefix. Short circuit.
    }
    let whitespacePrefix = whitespacePrefixReg[0];
    if (longestCommonPrefix === null) {
      // First non-whitespace-only line.
      // Set the common prefix to the current one.
      longestCommonPrefix = whitespacePrefix;
      continue;
    }
    if (whitespacePrefix.length > longestCommonPrefix.length) {
      // Trim to match length of common prefix.
      whitespacePrefix = whitespacePrefix.substring(0, longestCommonPrefix.length);
    } else if (whitespacePrefix.length < longestCommonPrefix.length) {
      // Trim to match length of current line prefix.
      longestCommonPrefix = longestCommonPrefix.substring(0, whitespacePrefix.length);
    }
    if (whitespacePrefix !== longestCommonPrefix) {
      return str; // No common whitespace prefix. Short circuit.
    }
  }
  if (longestCommonPrefix === null || longestCommonPrefix === '') {
    return str;
  }
  return lines
    .map(line =>
      line.startsWith(longestCommonPrefix) ? line.substring(longestCommonPrefix.length) : line
    )
    .join('\n');
}

/**
 * Styled Markdown Box.
 */
export function MarkdownBox(props: MarkdownBoxProps): React.JSX.Element {
  const { markdownTransform, pTypography, pSpacing, liSpacing, ...boxProps } = props;
  const derivedMarkdownProps = deriveMarkdownPropsFromTypography(pTypography, props);
  return (
    <Box {...boxProps}>
      <MarkdownBase markdown={trimWhitespacePrefix(props.children)} {...derivedMarkdownProps} />
    </Box>
  );
}
