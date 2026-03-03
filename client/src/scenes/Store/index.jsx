import React from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import OfferOverview from "components/ConnectorA/OfferOverview";

const Store = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        px: { xs: "1rem", md: "2rem" },
        py: "2rem",
      }}
    >
      <Header
        title="Offers"
        subtitle="Below all your offers are displayed."
      />

      <Box mt="2rem" width="100%">
        <OfferOverview />
      </Box>
    </Box>
  );
};

export default Store;