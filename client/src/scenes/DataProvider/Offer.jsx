import React from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import OfferOverview from "components/ConnectorA/OfferOverview";
import CreateNewOffer from "components/ConnectorA/CreateNewOffer";

const Offer = () => {
  const theme = useTheme();

  return (
    <Box m="2rem">
      <Header title="Offers" subtitle="Below all your offers are displayed." />

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
      >
        {/* LEFT: Offer Overview */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch"
        >
          <OfferOverview />
        </Box>

        {/* RIGHT: Create New Offer */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch"
        >
          <CreateNewOffer />
        </Box>
      </Box>
    </Box>
  );
};

export default Offer;
