import React from 'react';
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";


const VocabularyHub = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Vocabulary Hub" subtitle="This page shows the Vocabulary Hub." />
    </Box>
  );
};
export default VocabularyHub;
