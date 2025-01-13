import { FrequentlyAskedQuestions } from '@/beta/components/ui/pages/FrequentlyAskedQuestions';
import { Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';

export default function Page(): React.JSX.Element {
  return (
    <Box maxWidth="100vw" display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h1">Walletbeat FAQ</Typography>
      <Box maxWidth="75vw" display="flex" flexDirection="column" alignItems="stretch">
        <FrequentlyAskedQuestions />
      </Box>
      <Typography variant="caption">
        <Link href="/beta">
          <HomeIcon fontSize="small" />
          Home
        </Link>
      </Typography>
    </Box>
  );
}
