'use client';

import type { EvaluationTree } from '@/schema/attribute-groups';
import {
  type AttributeGroup,
  type EvaluatedGroup,
  type ValueSet,
  evaluatedAttributes,
  Rating,
} from '@/schema/attributes';
import type { RatedWallet } from '@/schema/wallet';
import { type NonEmptyArray, nonEmptyMap } from '@/types/utils/non-empty';
import { Box, Typography } from '@mui/material';
import type React from 'react';
import { Arc, type PieSlice, RatingPie } from '../atoms/RatingPie';
import type { GridColTypeDef } from '@mui/x-data-grid';
import { expandedRowHeight, ratingCellWidth, shortRowHeight } from '../constants';

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
 * Convert a rating to the value string displayed on the slice tooltip.
 */
function ratingToTooltipValue(rating: Rating): string {
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
  const slices: NonEmptyArray<PieSlice> = nonEmptyMap(evalAttrs, evaluatedAttr => {
    const icon = evaluatedAttr.evaluation.value.icon ?? evaluatedAttr.attribute.icon;
    return {
      id: evaluatedAttr.attribute.id,
      color: ratingToColor(evaluatedAttr.evaluation.value.rating),
      weight: 1,
      arcLabel: icon,
      tooltip: `${icon} ${evaluatedAttr.attribute.displayName}: ${evaluatedAttr.evaluation.value.displayName}`,
      tooltipValue: ratingToTooltipValue(evaluatedAttr.evaluation.value.rating),
      click: undefined, // TODO: Go to per-wallet page and scroll the section about to this attribute
    };
  });
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="4px">
      <RatingPie
        slices={slices}
        arc={Arc.TOP_HALF}
        width={ratingPieWidth}
        height={ratingPieHeight}
        centerLabel={`${Math.round(score * 100)}`}
      />
      {expanded ? (
        <Box height={expandedRowHeight - shortRowHeight} lineHeight="1" gap="4px">
          <Typography variant="h6" fontSize="0.8rem">
            {attrGroup.icon} {attrGroup.displayName}
          </Typography>
          <Typography variant="caption">Lorem ipsum...</Typography>
        </Box>
      ) : null}
    </Box>
  );
}
