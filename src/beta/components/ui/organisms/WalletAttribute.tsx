import type {
  AttributeGroup,
  EvaluatedAttribute,
  EvaluatedGroup,
  Value,
  ValueSet,
} from '@/beta/schema/attributes';
import type { RatedWallet } from '@/beta/schema/wallet';
import { isRenderableTypography } from '@/beta/types/text';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import type React from 'react';
import { WrapRatingIcon } from '../atoms/WrapRatingIcon';
import { subsectionBorderRadius, subsectionWeight } from '../../constants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
  const isTypography = isRenderableTypography(evalAttr.evaluation.details);
  const renderDetailsProps = {
    wallet,
    value: evalAttr.evaluation.value,
    typography: isTypography
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
  if (isTypography) {
    rendered = (
      <WrapRatingIcon rating={evalAttr.evaluation.value.rating}>{rendered}</WrapRatingIcon>
    );
  }
  return (
    <>
      {rendered}
      <Accordion
        disableGutters={true}
        square={true}
        sx={{
          marginTop: '1rem',
          borderRadius: `${subsectionBorderRadius}px`,
          ':before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`why-should-i-care-${evalAttr.attribute.id}`}
          id={`why-should-i-care-${evalAttr.attribute.id}`}
        >
          Why should I care?
        </AccordionSummary>
        <AccordionDetails>{evalAttr.attribute.why.render({})}</AccordionDetails>
      </Accordion>
    </>
  );
}
