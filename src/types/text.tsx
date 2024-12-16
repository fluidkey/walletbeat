import { Typography, type TypographyOwnProps } from '@mui/material';
import type React from 'react';

/** An input template for rendering. */
type Input = object;

/**
 * An element that can be rendered to the DOM.
 */
export interface Renderable<I extends Input = Input> {
  /** Renders the element given an input template. */
  render: (input: I) => React.JSX.Element;
}

/**
 * A brandable implementation of Renderable.
 */
class Renderer<I extends Input, B> implements Renderable<I> {
  public readonly render: (input: I) => React.JSX.Element;
  public readonly __brand: B;

  constructor(renderFn: (input: I) => React.JSX.Element, brand: B) {
    this.render = renderFn;
    this.__brand = brand;
  }
}

/** An input template that contains Typography props. */
type WithTypography = Input & {
  typography?: TypographyOwnProps;
};

const paragraphBrand = 'paragraph';
const paragraphMaxLength = 1024;

/** A short amount of text that fits in a single paragraph. */
export type Paragraph<I extends WithTypography = WithTypography> = Renderable<I> & {
  __brand: 'paragraph';
};

/** A renderable paragraph. */
export function paragraph<I extends WithTypography = WithTypography>(text: string): Paragraph<I> {
  if (text.length > paragraphMaxLength) {
    throw new Error(
      `Paragraph text is too long (${text.length} characters is over the maximum length of ${paragraphMaxLength} characters).`
    );
  }
  return new Renderer((input: I) => <Typography {...(input.typography ?? {})}>{text.trim()}</Typography>, paragraphBrand);
}
