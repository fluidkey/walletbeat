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
import { Box } from '@mui/material';
import type React from 'react';
import { WrapIcon } from '../atoms/WrapIcon';
import { subsectionBorderRadius, subsectionIconWidth, subsectionWeight } from '../../constants';
import { type AccordionData, Accordions } from '../atoms/Accordions';
import type { NonEmptyArray } from '@/beta/types/utils/non-empty';
import { WrapRatingIcon } from '../atoms/WrapRatingIcon';
import { AttributeMethodology } from '../molecules/attributes/AttributeMethodology';

export function WalletAttribute<Vs extends ValueSet, V extends Value>({
  wallet,
  attrGroup,
  evalGroup,
  evalAttr,
}: {
  wallet: RatedWallet;
  attrGroup: AttributeGroup<Vs>;
  evalGroup: EvaluatedGroup<Vs>;
  evalAttr: EvaluatedAttribute<V>;
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
      {evalAttr.evaluation.details.render(renderDetailsProps)}
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
          iconFontSize="1rem"
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
