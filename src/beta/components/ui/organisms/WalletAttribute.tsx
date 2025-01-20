import {
  Rating,
  type AttributeGroup,
  type EvaluatedAttribute,
  type EvaluatedGroup,
  type Value,
  type ValueSet,
} from '@/beta/schema/attributes';
import { getAttributeOverride, type RatedWallet } from '@/beta/schema/wallet';
import { isRenderableTypography } from '@/beta/types/text';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { WrapIcon } from '../atoms/WrapIcon';
import { subsectionBorderRadius, subsectionIconWidth, subsectionWeight } from '../../constants';
import { type AccordionData, Accordions } from '../atoms/Accordions';
import type { NonEmptyArray } from '@/beta/types/utils/non-empty';
import { WrapRatingIcon } from '../atoms/WrapRatingIcon';
import { AttributeMethodology } from '../molecules/attributes/AttributeMethodology';
import { subsectionTheme } from '../../ThemeRegistry/theme';
import type { Variant } from '@/beta/schema/variants';
import { variantToName } from '../../variants';

export function WalletAttribute<Vs extends ValueSet, V extends Value>({
  wallet,
  attrGroup,
  evalGroup,
  evalAttr,
  isVariantSpecific,
  pickedVariant,
}: {
  wallet: RatedWallet;
  attrGroup: AttributeGroup<Vs>;
  evalGroup: EvaluatedGroup<Vs>;
  evalAttr: EvaluatedAttribute<V>;
  isVariantSpecific: boolean;
  pickedVariant: Variant | null;
}): React.JSX.Element {
  const override = getAttributeOverride(wallet, attrGroup.id, evalAttr.attribute.id);
  const detailsIsTypography = isRenderableTypography(evalAttr.evaluation.details);
  const renderDetailsProps = {
    wallet,
    value: evalAttr.evaluation.value,
    typography: detailsIsTypography
      ? {
          fontWeight: subsectionWeight,
        }
      : undefined,
  };
  let rendered = (
    <>
      <React.Fragment key="details">
        {evalAttr.evaluation.details.render(renderDetailsProps)}
      </React.Fragment>
      <React.Fragment key="variantSpecific">
        {isVariantSpecific ? (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {pickedVariant === null
              ? 'This rating differs across versions. Select a specific version for details.'
              : `This rating is specific to the ${variantToName(pickedVariant, false)} version.`}
          </Typography>
        ) : null}
      </React.Fragment>
      <React.Fragment key="impact">
        {evalAttr.evaluation.impact === undefined ? null : (
          <>
            <Box height="1rem"></Box>
            {evalAttr.evaluation.impact.render({
              wallet,
              value: evalAttr.evaluation.value,
              typography: {
                fontWeight: subsectionWeight,
              },
            })}
          </>
        )}
      </React.Fragment>
    </>
  );
  if (detailsIsTypography) {
    rendered = (
      <WrapRatingIcon rating={evalAttr.evaluation.value.rating}>{rendered}</WrapRatingIcon>
    );
  }
  const accordions: NonEmptyArray<AccordionData> = [
    {
      id: `why-${evalAttr.attribute.id}`,
      summary:
        evalAttr.evaluation.value.rating === Rating.YES ||
        evalAttr.evaluation.value.rating === Rating.UNRATED
          ? 'Why does this matter?'
          : 'Why should I care?',
      contents: evalAttr.attribute.why.render({
        typography: {
          variant: 'body2',
        },
      }),
    },
    {
      id: `methodology-${evalAttr.attribute.id}`,
      summary: `How is ${evalAttr.attribute.midSentenceName} evaluated?`,
      contents: (
        <AttributeMethodology attribute={evalAttr.attribute} evaluation={evalAttr.evaluation} />
      ),
    },
  ];
  const howToImprove =
    override?.howToImprove !== undefined ? override.howToImprove : evalAttr.evaluation.howToImprove;
  if (howToImprove !== undefined) {
    accordions.push({
      id: `how-${evalAttr.attribute.id}`,
      summary: `What can ${wallet.metadata.displayName} do about its ${evalAttr.attribute.midSentenceName}?`,
      contents: howToImprove.render({
        wallet,
        value: evalAttr.evaluation.value,
        typography: { variant: 'body2' },
      }),
    });
  }
  return (
    <>
      {rendered}
      {override?.note !== undefined ? (
        <WrapIcon
          icon={'\u{1f449}'}
          iconFontSize={subsectionTheme.typography.body1.fontSize}
          iconWidth={subsectionIconWidth}
          sx={{ marginTop: '1rem' }}
        >
          {override.note.render({ wallet })}
        </WrapIcon>
      ) : null}
      <Accordions
        accordions={accordions}
        borderRadius={`${subsectionBorderRadius}px`}
        summaryTypographyVariant="h4"
        interAccordionMargin="1rem"
      />
    </>
  );
}
