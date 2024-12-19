'use client';

import type { EvaluationTree } from '@/beta/schema/attribute-groups';
import {
  type AttributeGroup,
  type EvaluatedGroup,
  type ValueSet,
  type EvaluatedAttribute,
  evaluatedAttributes,
  Rating,
  type Value,
} from '@/beta/schema/attributes';
import type { RatedWallet } from '@/beta/schema/wallet';
import { type NonEmptyArray, nonEmptyMap } from '@/beta/types/utils/non-empty';
import { Box, Typography } from '@mui/material';
import type React from 'react';
import { Arc, type PieSlice, RatingPie } from '../atoms/RatingPie';
import type { GridColTypeDef } from '@mui/x-data-grid';
import { expandedRowHeight, ratingCellWidth, shortRowHeight } from '../../constants';
import { useState } from 'react';

/**
 * Convert a rating to a color for the pie slice.
 */
function ratingToColor(rating: Rating): string {
  switch (rating) {
    case Rating.NO:
      return '#FF0000';
    case Rating.PARTIAL:
      return '#FFA500';
    case Rating.YES:
      return '#008000';
    case Rating.UNRATED:
      return '#808080';
  }
}

/**
 * Convert a rating to the icon displayed on the slice tooltip.
 */
function ratingToIcon(rating: Rating): string {
  switch (rating) {
    case Rating.NO:
      return '\u{274c}'; // Red X
    case Rating.PARTIAL:
      return '\u{26a0}'; // Warning sign
    case Rating.YES:
      return '\u{2705}'; // Green checkmark
    case Rating.UNRATED:
      return '\u{2753}'; // Question mark
  }
}

/**
 * Common properties of rating-type columns.
 */
export const walletRatingColumnProps: GridColTypeDef = {
  resizable: false,
  filterable: false,
  editable: false,
  width: ratingCellWidth,
  minWidth: ratingCellWidth,
  maxWidth: ratingCellWidth,
  align: 'center',
  headerAlign: 'left',
};

const ratingPieMargin = 2;
const ratingPieHeight = shortRowHeight - ratingPieMargin * 2;
const ratingPieWidth = ratingPieHeight * 2;

/** A single cell evaluating a wallet on an attribute group. */
export function WalletRatingCell<Vs extends ValueSet>({
  wallet,
  attrGroup,
  evalGroupFn,
  expanded,
}: {
  wallet: RatedWallet;
  attrGroup: AttributeGroup<Vs>;
  evalGroupFn: (tree: EvaluationTree) => EvaluatedGroup<Vs>;
  expanded: boolean;
}): React.JSX.Element {
  const evalGroup = evalGroupFn(wallet.overall);
  const evalAttrs = evaluatedAttributes(evalGroup);
  const score = attrGroup.score(evalGroup);
  const centerLabel =
    score <= 0.0
      ? '\u{1f480}' /* Skull */
      : score >= 1.0
        ? '\u{1f4af}' /* 100 */
        : Math.round(score * 100).toString();
  const [highlightedSlice, setHighlightedSlice] = useState<{
    evalAttr: EvaluatedAttribute<Value>;
    sticky: boolean;
  } | null>(null);
  const slices: NonEmptyArray<PieSlice> = nonEmptyMap(
    evalAttrs,
    (evaluatedAttr: EvaluatedAttribute<Value>): PieSlice => {
      const icon = evaluatedAttr.evaluation.value.icon ?? evaluatedAttr.attribute.icon;
      return {
        id: evaluatedAttr.attribute.id,
        color: ratingToColor(evaluatedAttr.evaluation.value.rating),
        weight: 1,
        arcLabel: icon,
        tooltip: `${icon} ${evaluatedAttr.evaluation.value.displayName}`,
        tooltipValue: ratingToIcon(evaluatedAttr.evaluation.value.rating),
        focusChange: (focused: boolean) => {
          if (focused) {
            setHighlightedSlice({
              evalAttr: evaluatedAttr,
              sticky: highlightedSlice === null ? false : highlightedSlice.sticky,
            });
          } else if (highlightedSlice !== null) {
            setHighlightedSlice(
              highlightedSlice.sticky ? { evalAttr: evaluatedAttr, sticky: true } : null
            );
          }
        },
        click: () => {
          setHighlightedSlice(
            highlightedSlice === null
              ? null
              : { evalAttr: evaluatedAttr, sticky: !highlightedSlice.sticky }
          );
        },
      };
    }
  );
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="4px">
      <RatingPie
        pieId={attrGroup.id}
        slices={slices}
        highlightedSliceId={
          highlightedSlice === null ? null : highlightedSlice.evalAttr.attribute.id
        }
        arc={Arc.TOP_HALF}
        width={ratingPieWidth}
        height={ratingPieHeight}
        centerLabel={centerLabel}
      />
      {expanded ? (
        <Box
          height={expandedRowHeight - shortRowHeight}
          display="flex"
          flexDirection="column"
          lineHeight="1"
          gap="4px"
          sx={{ lineHeight: 1, whiteSpace: 'normal' }}
        >
          {highlightedSlice === null ? (
            <>
              <Typography variant="h5" fontSize="0.8rem">
                {attrGroup.icon} {attrGroup.displayName}
              </Typography>
              {attrGroup.perWalletQuestion.render({
                ...wallet.metadata,
                typography: {
                  variant: 'caption',
                },
              })}
            </>
          ) : (
            <>
              <Typography variant="h6" fontSize="0.7rem" whiteSpace="nowrap">
                {highlightedSlice.evalAttr.evaluation.value.icon ??
                  highlightedSlice.evalAttr.attribute.icon}{' '}
                {highlightedSlice.evalAttr.attribute.displayName}{' '}
              </Typography>
              {highlightedSlice.evalAttr.evaluation.value.walletExplanation.render({
                ...wallet.metadata,
                prefix: ratingToIcon(highlightedSlice.evalAttr.evaluation.value.rating) + ' ',
                typography: {
                  variant: 'caption',
                  lineHeight: 1.15,
                },
              })}
            </>
          )}
        </Box>
      ) : null}
    </Box>
  );
}
