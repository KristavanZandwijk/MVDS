import React from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import CatalogOverview from "components/ConnectorA/CatalogOverview";
import CreateNewCatalog from "components/ConnectorA/CreateNewCatalog";
import LinkOfferToCatalog from "components/ConnectorA/LinkOfferToCatalog";

const Catalog = () => {
  const theme = useTheme();

  return (
    <Box m="2rem">
      <Header title="Catalogs" subtitle="Below you can see existing catalogs or create a new one." />

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
        alignItems="stretch" // ensures children stretch to equal height
      >
        {/* LEFT BOX: Catalog Overview */}
        <Box flex={1} display="flex" flexDirection="column">
          <CatalogOverview />
        </Box>

        {/* RIGHT BOX: Create New Catalog + Link Offer To Catalog (stacked) */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch" // ensures children stretch naturally
        >
          <CreateNewCatalog />
          <LinkOfferToCatalog />
        </Box>
      </Box>
    </Box>
  );
};

export default Catalog;
