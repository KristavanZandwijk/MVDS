import React from 'react';
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";


const IdentityProvider = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Identity Provider" subtitle="This is page shows your digital identity." />
    </Box>
  );
};

export default IdentityProvider;
