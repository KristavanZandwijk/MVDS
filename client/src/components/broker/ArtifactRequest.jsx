import React from 'react';
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";


const  ArtifactRequest = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Artifact Request" subtitle="Will be nice to show an overview of the agreements" />
    </Box>
  );
};

export default ArtifactRequest;
