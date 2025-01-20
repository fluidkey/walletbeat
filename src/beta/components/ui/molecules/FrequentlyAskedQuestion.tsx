import { Box, type Typography } from '@mui/material';
import { MarkdownBox } from '../atoms/MarkdownBox';
import { AnchorHeader } from '../atoms/AnchorHeader';

export default function FrequentlyAskedQuestion({
  question,
  anchor,
  questionTypographyProps = undefined,
  answerTypographyProps = undefined,
  children,
}: {
  question: string;
  anchor: string;
  questionTypographyProps?: React.ComponentProps<typeof Typography>;
  answerTypographyProps?: React.ComponentProps<typeof Typography>;
  children: string;
}): React.JSX.Element {
  return (
    <Box key={anchor}>
      <AnchorHeader id={anchor} {...questionTypographyProps}>
        {question}
      </AnchorHeader>
      <MarkdownBox pTypography={answerTypographyProps}>{children}</MarkdownBox>
    </Box>
  );
}
