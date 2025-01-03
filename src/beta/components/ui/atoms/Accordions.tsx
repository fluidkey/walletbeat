import type { NonEmptyArray } from '@/beta/types/utils/non-empty';
import type React from 'react';
import { useState } from 'react';
import theme from '../../ThemeRegistry/theme';
import { Accordion, AccordionDetails, AccordionSummary, darken } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface AccordionData {
  id: string;
  summary: string;
  contents: React.ReactNode;
}

/** Expandable set of Material Accordion controls. */
export function Accordions({
  accordions,
  borderRadius,
  interAccordionMargin = '1rem',
}: {
  accordions: NonEmptyArray<AccordionData>;
  borderRadius: string;
  interAccordionMargin?: string;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <>
      {accordions.map((accordion, index) => {
        const blankTop =
          index === 0 || expanded[accordions[index - 1].id] || expanded[accordion.id];
        const blankBottom =
          index === accordions.length - 1 ||
          expanded[accordions[index + 1].id] ||
          expanded[accordion.id];
        return (
          <Accordion
            key={`accordion-${accordion.id}`}
            expanded={expanded[accordion.id] ?? false}
            onChange={(_, newExpanded) => {
              setExpanded(previous => ({ ...previous, [accordion.id]: newExpanded }));
            }}
            square={true}
            sx={{
              marginTop: blankTop ? interAccordionMargin : '0px',
              ':before': blankTop ? { display: 'none' } : undefined,
              backgroundColor: theme.palette.background.paper,
              borderTopLeftRadius: blankTop ? borderRadius : '0px',
              borderTopRightRadius: blankTop ? borderRadius : '0px',
              borderBottomLeftRadius: blankBottom ? borderRadius : '0px',
              borderBottomRightRadius: blankBottom ? borderRadius : '0px',
            }}
          >
            <AccordionSummary
              key={accordion.id}
              aria-controls={accordion.id}
              id={accordion.id}
              expandIcon={<ExpandMoreIcon />}
            >
              {accordion.summary}
            </AccordionSummary>
            <AccordionDetails
              key={`${accordion.id}-details`}
              sx={{
                backgroundColor: darken(theme.palette.background.paper, 0.1),
                borderBottomLeftRadius: blankBottom ? borderRadius : '0px',
                borderBottomRightRadius: blankBottom ? borderRadius : '0px',
              }}
            >
              {accordion.contents}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
}
