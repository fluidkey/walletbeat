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
import { Box } from '@mui/material';
import type React from 'react';
import { Arc, type PieSlice, RatingPie } from '../atoms/RatingPie';
import type { GridColTypeDef } from '@mui/x-data-grid';

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

/** Width of rating cells. */
const cellWidth = 156;

/**
 * Common properties of rating-type columns.
 */
export const walletRatingColumnProps: GridColTypeDef = {
  resizable: false,
  filterable: false,
  editable: false,
  width: cellWidth,
  minWidth: cellWidth,
  maxWidth: cellWidth,
  align: 'center',
  headerAlign: 'left',
};

/** A single cell evaluating a wallet on an attribute group. */
export function WalletRatingCell<Vs extends ValueSet>({
  wallet,
  attrGroup,
  evalGroupFn,
}: {
  wallet: RatedWallet;
  attrGroup: AttributeGroup<Vs>;
  evalGroupFn: (tree: EvaluationTree) => EvaluatedGroup<Vs>;
}): React.JSX.Element {
  const slices: NonEmptyArray<PieSlice> = nonEmptyMap(
    evaluatedAttributes(evalGroupFn(wallet.overall)),
    evaluatedAttr => {
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
    }
  );
  return (
    <Box>
      <RatingPie slices={slices} arc={Arc.TOP_HALF} width={128} height={56} />
    </Box>
  );
}
