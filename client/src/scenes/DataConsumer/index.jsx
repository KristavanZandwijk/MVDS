import React from "react";
import { Box } from "@mui/material";
import Header from "components/Header";
import AgreementOverview from "components/ConnectorB/AgreementOverview";
import StartNegotiation from "components/ConnectorB/StartNegotiation";


const DataConsumer = () => {
  return (
    <Box m="2rem">
      <Header title="Data Consumer" subtitle="View the Received Data here." />
    {/* Two-column layout */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
      >
        {/* LEFT BOX */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch"
        >
          <AgreementOverview/>
        </Box>

        {/* RIGHT BOX */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch"
        >
          <StartNegotiation/>
        </Box>
      </Box>
    </Box>
  );
};
export default DataConsumer;
