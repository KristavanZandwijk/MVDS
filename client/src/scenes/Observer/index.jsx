import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Header from "components/Header";
import AgreementOverview from "components/ConnectorB/AgreementOverview";

const Observer = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header
        title="Observer"
        subtitle="This page shows all transactions in the data space related to your connector."
      />

      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        gap="2rem"
        alignItems="stretch"
        mt="2rem"
      >
        <AgreementOverview />
      </Box>
    </Box>
  );
};

export default Observer;