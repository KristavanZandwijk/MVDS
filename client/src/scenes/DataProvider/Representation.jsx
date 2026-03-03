import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import Header from "components/Header";
import RepresentationsOverview from "components/ConnectorA/RepresentationsOverview";
import CreateNewRepresentation from "components/ConnectorA/CreateNewRepresentation";
import LinkRepresentationToOffer from "components/ConnectorA/LinkRepresentationToOffer";

const Representation = () => {
  const theme = useTheme();

  return (
    <Box m="2rem">
      {/* Page Header */}
      <Header
        title="Representations"
        subtitle="This page shows your representations."
      />

      {/* Two-column layout */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
        alignItems="stretch" // ensures children stretch to equal height
      >
        {/* LEFT BOX */}
        <Box
          flex={1}
          p="1.5rem"
          borderRadius="1rem"
          bgcolor={theme.palette.background.alt}
          sx={{ boxShadow: 3, minHeight: "200px" }}
        >
          <RepresentationsOverview/>
        </Box>

        {/* RIGHT BOX */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch" // ensures children stretch naturally
        >
          <CreateNewRepresentation/>
          <LinkRepresentationToOffer/>
        </Box>
      </Box>
    </Box>
  );
};

export default Representation;
