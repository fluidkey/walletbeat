import { Typography } from '@mui/material';
import type React from 'react';
import { MarkdownBox } from '../components/ui/atoms/MarkdownBox';
import { MarkdownTypography } from '../components/ui/atoms/MarkdownTypography';

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

/** An input template that contains Typography-like props. */
export type WithTypography<I extends Input = Input> = I & {
  /**
   * A text transformation applied to the text.
   * This happens after expansion of the text, but before rendering.
   */
  textTransform?: (resolvedText: string, input: I) => string;

  /** A subset of supported typography props. */
  typography?: {
    color?: React.ComponentProps<typeof Typography>['color'];
    fontSize?: React.ComponentProps<typeof Typography>['fontSize'];
    fontWeight?: React.ComponentProps<typeof Typography>['fontWeight'];
    fontStyle?: React.ComponentProps<typeof Typography>['fontStyle'];
    lineHeight?: React.ComponentProps<typeof Typography>['lineHeight'];
    marginBottom?: React.ComponentProps<typeof Typography>['marginBottom'];
    marginTop?: React.ComponentProps<typeof Typography>['marginTop'];
    paddingBottom?: React.ComponentProps<typeof Typography>['paddingBottom'];
    paddingTop?: React.ComponentProps<typeof Typography>['paddingTop'];
    variant?: React.ComponentProps<typeof Typography>['variant'];
  };
};

function typography<I extends Input, B>(
  text: string | ((input: I) => string),
  brand: B,
  isMarkdown: boolean
): Renderer<I, B> {
  return new Renderer((input: WithTypography<I>) => {
    const typographyProps = input.typography ?? {};
    let resolvedText = typeof text === 'string' ? text : text(input);
    if (input.textTransform !== undefined) {
      resolvedText = input.textTransform(resolvedText, input);
    }
    if (isMarkdown) {
      return <MarkdownTypography {...typographyProps}>{resolvedText}</MarkdownTypography>;
    }
    return <Typography {...typographyProps}>{resolvedText}</Typography>;
  }, brand);
}

const sentenceBrand = 'sentence';
const sentenceMaxLength = 256;

/** A single sentence. */
export type Sentence<I extends Input = Input> = Renderable<WithTypography<I>> & {
  __brand: 'sentence';
};

/** A renderable sentence. */
export function sentence<I extends Input = Input>(
  text: string | ((input: I) => string),
  isMarkdown?: boolean
): Sentence<I> {
  if (text.length > sentenceMaxLength) {
    throw new Error(
      `Sentence text is too long (${text.length} characters is over the maximum length of ${sentenceMaxLength} characters).`
    );
  }
  return typography(text, sentenceBrand, isMarkdown ?? false);
}

/** A renderable Markdown-rendered sentence. */
export function mdSentence<I extends Input = Input>(
  text: string | ((input: I) => string)
): Sentence<I> {
  return sentence(text, true /* isMarkdown */);
}

const paragraphBrand = 'paragraph';
const paragraphMaxLength = 1024;

/** A short amount of text that fits in a single paragraph. */
export type Paragraph<I extends Input = Input> = Renderable<WithTypography<I>> & {
  __brand: 'paragraph';
};

/** A renderable paragraph. */
export function paragraph<I extends Input = Input>(
  text: string | ((input: I) => string),
  isMarkdown?: boolean
): Paragraph<WithTypography<I>> {
  if (text.length > paragraphMaxLength) {
    throw new Error(
      `Paragraph text is too long (${text.length} characters is over the maximum length of ${paragraphMaxLength} characters).`
    );
  }
  return typography(text, paragraphBrand, isMarkdown ?? false);
}

/** A renderable Markdown-rendered paragraph. */
export function mdParagraph<I extends Input = Input>(
  text: string | ((input: I) => string)
): Paragraph<I> {
  return paragraph(text, true /* isMarkdown */);
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

export function markdown<I extends Input = Input>(
  markdown: string | ((input: I) => string)
): Renderable<WithTypography<I>> {
  return {
    render: (input: WithTypography<I>): React.JSX.Element => (
      <MarkdownBox pTypography={input.typography}>
        {typeof markdown === 'string' ? markdown : markdown(input)}
      </MarkdownBox>
    ),
  };
}

/**
 * Slugify a camelCaseString into a-slug-like-this.
 */
export function slugifyCamelCase(camelCaseString: string): string {
  return camelCaseString
    .replaceAll('_', '-')
    .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}
