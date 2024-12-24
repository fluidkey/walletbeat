import { Typography, type TypographyOwnProps } from '@mui/material';
import type React from 'react';

/** An input template for rendering. */
type Input = object;

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
type WithTypography<I extends Input> = I & {
  prefix?: string;
  suffix?: string;
  typography?: TypographyOwnProps;
};

function typography<I extends Input, B>(
  text: string | ((input: I) => string),
  brand: B
): Renderer<I, B> {
  return new Renderer(
    (input: WithTypography<I>) => (
      <Typography {...(input.typography ?? {})}>
        {input.prefix ?? ''}
        {typeof text === 'string' ? text.trim() : text(input).trim()}
        {input.suffix ?? ''}
      </Typography>
    ),
    brand
  );
}

const sentenceBrand = 'sentence';
const sentenceMaxLength = 256;

/** A single sentence. */
export type Sentence<I extends Input = Input> = Renderable<WithTypography<I>> & {
  __brand: 'sentence';
};

/** A renderable sentence. */
export function sentence<I extends Input = Input>(
  text: string | ((input: I) => string)
): Sentence<I> {
  if (text.length > sentenceMaxLength) {
    throw new Error(
      `Sentence text is too long (${text.length} characters is over the maximum length of ${sentenceMaxLength} characters).`
    );
  }
  return typography(text, sentenceBrand);
}

const paragraphBrand = 'paragraph';
const paragraphMaxLength = 1024;

/** A short amount of text that fits in a single paragraph. */
export type Paragraph<I extends Input = Input> = Renderable<WithTypography<I>> & {
  __brand: 'paragraph';
};

/** A renderable paragraph. */
export function paragraph<I extends Input = Input>(
  text: string | ((input: I) => string)
): Paragraph<WithTypography<I>> {
  if (text.length > paragraphMaxLength) {
    throw new Error(
      `Paragraph text is too long (${text.length} characters is over the maximum length of ${paragraphMaxLength} characters).`
    );
  }
  return typography(text, paragraphBrand);
}

/** Type predicate for Renderable<WithTypography<?>>. */
export function isRenderableTypography<I extends Input = Input>(
  renderable: Renderable<I> | Renderable<WithTypography<I>>
): renderable is Renderable<WithTypography<I>> {
  if (!Object.hasOwn(renderable, '__brand')) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- Safe because we just checked that the property exists.
  const brand = (renderable as any).__brand;
  return brand === sentenceBrand || brand === paragraphBrand;
}

export function component<I extends Input = Input, P extends Input = Input>(
  Component: React.ComponentType<P & I>,
  bakedProps?: P
): Renderable<I> {
  return {
    render: (input: I): React.JSX.Element => (
      <Component {...input} {...((bakedProps ?? {}) as P)} />
    ),
  };
}
