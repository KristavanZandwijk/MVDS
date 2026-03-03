import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import Header from 'components/Header';
import BrokerSelfDescription from 'components/broker/BrokerSelfDescription';
import BrokerConnectorList from 'components/broker/BrokerconnectorList';
import CatalogExplorer from 'components/broker/CatalogExplorer';

const Broker = () => {
  const theme = useTheme();
 
  return (
    <Box m="2rem">
      <Header title = "Explore Data" subtitle= "Find other connectors and their data here."/>
      
    <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap="2rem"
            mt="2rem"
            alignItems="stretch" // ensures children stretch to equal height
          >
            {/* LEFT BOX: Artifact Overview */}
            <Box 
            flex={1}
            display="flex"
            flexDirection="column"
            gap="2rem"
            alignItems="stretch"> 
      <BrokerSelfDescription/>
      <BrokerConnectorList/>
    </Box>

        {/* RIGHT BOX: Create New Artifact + Link Artifact To Representation (stacked) */}
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          gap="2rem"
          alignItems="stretch" // ensures children stretch naturally
        >
          <CatalogExplorer/>
        </Box>
      </Box>
    </Box>
  );
};

export default Broker; 
