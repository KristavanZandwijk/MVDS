import React from "react";
import { Box, useTheme } from "@mui/material";
import Header from "components/Header";
import ArtifactOverview from "components/ConnectorA/ArtifactOverview";
import CreateNewArtifact from "components/ConnectorA/CreateNewArtifact";
import LinkArtifactToRepresentation from "components/ConnectorA/LinkedArtifactToRepresentation";


const Artifact = () => {
  const theme = useTheme();

  return (
    <Box m="2rem">
      <Header title="Artifacts" subtitle="Below you can see existing artifacts within your connector. You can also create new artifacts and link them to representations." />

      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
        alignItems="stretch" // ensures children stretch to equal height
      >
        {/* LEFT BOX: Artifact Overview */}
        <Box flex={1}
          p="1.5rem"
          borderRadius="1rem"
          bgcolor={theme.palette.background.alt}
          sx={{ boxShadow: 3, minHeight: "200px" }}> 
          <ArtifactOverview />
        </Box>

        {/* RIGHT BOX: Create New Artifact + Link Artifact To Representation (stacked) */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch" // ensures children stretch naturally
        >
          <CreateNewArtifact />
          <LinkArtifactToRepresentation/>
        </Box>
      </Box>
    </Box>
  );
};

export default Artifact;
