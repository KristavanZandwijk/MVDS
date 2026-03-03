import React from 'react';
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";


const Observer = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Observer" subtitle="This page shows all transaction in the data space related to your connector." />
    </Box>
  );
};

export default Observer;
