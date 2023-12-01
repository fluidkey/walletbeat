import React from 'react';
import { Box } from '@mui/material';
import ComparisonTable from '@/components/ui/organisms/Table';

export default function Home(): JSX.Element {
  return (
    <Box maxWidth="100vw" px={1} display="flex" justifyContent="center">
      <ComparisonTable />
    </Box>
  );
}
