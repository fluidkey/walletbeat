import {
  type Attribute,
  type Evaluation,
  type ExampleRating,
  Rating,
  ratingToIcon,
  type Value,
} from '@/beta/schema/attributes';
import { Divider, Typography } from '@mui/material';
import { Box } from '@mui/system';
import type { NonEmptyArray } from '@/beta/types/utils/non-empty';
import React from 'react';
import { mdSentence, type Sentence, type WithTypography } from '@/beta/types/text';
import { styled } from '@mui/material/styles';

const typographyProps: WithTypography['typography'] = {
  variant: 'body2',
};

interface ListItemProps {
  isFirstItem: boolean;
  bulletText: string;
  bulletFontSize?: string;
  spaceBetweenItems?: string;
}

const StyledListItem = styled('li')<ListItemProps>`
  margin-top: ${props => (props.isFirstItem ? '0px' : (props.spaceBetweenItems ?? '0px'))};
  &::marker {
    content: '${props => props.bulletText}  ';
    font-size: ${props => props.bulletFontSize ?? 'inherit'};
  }
`;

function replaceExampleRatingPrefix(
  theWallet: string,
  theWalletPossessive: string
): (text: string) => string {
  return (text: string): string => {
    const whitespacePrefixLength = text.length - text.trimStart().length;
    const whitespacePrefix =
      whitespacePrefixLength === 0 ? '' : text.substring(0, whitespacePrefixLength);
    const unprefixedText =
      whitespacePrefixLength === 0 ? text : text.substring(whitespacePrefix.length);
    if (unprefixedText.startsWith('The wallet ')) {
      return `${whitespacePrefix}${theWallet}${unprefixedText.substring('The wallet '.length)}`;
    }
    if (unprefixedText.startsWith("The wallet's ")) {
      return `${whitespacePrefix}${theWalletPossessive}${unprefixedText.substring("The wallet's ".length)}`;
    }
    throw new Error(
      `Example ratings should always begin with the phrase "The wallet"; got: "${unprefixedText}"`
    );
  };
}

function ExampleRatings<V extends Value>({
  displayOrder,
  passExamples,
  partialExamples,
  failExamples,
}: {
  displayOrder: 'pass-fail' | 'fail-pass';
  passExamples: ExampleRating<V> | NonEmptyArray<ExampleRating<V>>;
  partialExamples: ExampleRating<V> | Array<ExampleRating<V>> | undefined;
  failExamples: ExampleRating<V> | NonEmptyArray<ExampleRating<V>>;
}): React.JSX.Element {
  const renderListItem = (
    exampleRating: ExampleRating<V>,
    index: number,
    rating: Rating
  ): React.JSX.Element => (
    // Safe to use index as key here because example ratings are static and
    // never change order within the same rating.
    <StyledListItem
      key={`example-${index}`}
      bulletText={ratingToIcon(rating)}
      bulletFontSize="0.6rem"
      isFirstItem={index === 0}
      spaceBetweenItems="0.15rem"
    >
      {exampleRating.description.render({
        textTransform: replaceExampleRatingPrefix('It ', 'Its '),
        typography: typographyProps,
      })}
    </StyledListItem>
  );
  const renderExamples = (
    rating: Rating,
    preamble: Sentence,
    exampleRatings: ExampleRating<V> | Array<ExampleRating<V>> | undefined
  ): { key: string; element: React.JSX.Element | null } => {
    const ratingsList: Array<ExampleRating<V>> =
      exampleRatings === undefined
        ? []
        : Array.isArray(exampleRatings)
          ? exampleRatings
          : [exampleRatings];
    if (ratingsList.length === 0) {
      return { key: rating, element: null };
    }
    return {
      key: rating,
      element: (
        <React.Fragment>
          {preamble.render({
            textTransform: preamble => `${preamble}...`,
            typography: typographyProps,
          })}
          <ul>
            {ratingsList.map((exampleRating, index) =>
              renderListItem(exampleRating, index, rating)
            )}
          </ul>
        </React.Fragment>
      ),
    };
  };
  const passRendered = renderExamples(
    Rating.YES,
    mdSentence('A wallet would get a **passing** rating if'),
    passExamples
  );
  const partialRendered = renderExamples(
    Rating.PARTIAL,
    mdSentence('A wallet would get a **partial** rating if'),
    partialExamples
  );
  const failRendered = renderExamples(
    Rating.NO,
    mdSentence('A wallet would get a **failing** rating if'),
    failExamples
  );
  const renderedExamples: Array<{ key: string; element: React.JSX.Element | null }> = (() => {
    switch (displayOrder) {
      case 'pass-fail':
        return [passRendered, partialRendered, failRendered];
      case 'fail-pass':
        return [failRendered, partialRendered, passRendered];
    }
  })();
  return (
    <>
      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
        For example...
      </Typography>
      <Box>
        {renderedExamples.map(renderedExample =>
          renderedExample.element === null ? null : (
            <Box key={renderedExample.key}>{renderedExample.element}</Box>
          )
        )}
      </Box>
    </>
  );
}

/**
 * Explain how an attribute is evaluated.
 * This is a wallet-agnostic, attribute-specific description.
 * However, it can optionally take in an `Evaluation`, which is used to match
 * a wallet's evaluation against one of the example evaluations of the
 * attribute and highlight this example.
 */
export function AttributeMethodology<V extends Value>({
  attribute,
  evaluation = undefined,
}: {
  attribute: Attribute<V>;
  evaluation?: Evaluation<V>;
}): React.JSX.Element {
  return (
    <>
      <Box key="methodology">
        {attribute.methodology.render({
          typography: typographyProps,
        })}
      </Box>
      <Divider
        key="after-methodology"
        sx={{
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      />
      <Box key="example-ratings">
        {attribute.ratingScale.display === 'simple' ? (
          attribute.ratingScale.content.render({
            typography: typographyProps,
          })
        ) : (
          <ExampleRatings
            displayOrder={attribute.ratingScale.display}
            passExamples={attribute.ratingScale.pass}
            partialExamples={attribute.ratingScale.partial}
            failExamples={attribute.ratingScale.fail}
          />
        )}
      </Box>
    </>
  );
}
