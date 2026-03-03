import React from "react";
import { Box, Typography, useTheme, Button } from "@mui/material";
import Header from "components/Header";
import { useNavigate } from "react-router-dom";
import UMLDiagram from "assets/UML_Offer.png";


const DataProvider = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box m="1.5rem 2.5rem">
      {/* Page Header */}
      <Header
        title="Data Provider"
        subtitle="This page shows all data that is provided via your connector."
      />

      {/* Two-column layout */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap="2rem"
        mt="2rem"
      >
        {/* LEFT SECTION */}
        <Box
          flex={1}
          p="1.5rem"
          borderRadius="1rem"
          bgcolor={theme.palette.background.alt}
          display="flex"
          flexDirection="column"
          sx={{
            boxShadow: 3,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={theme.palette.secondary[100]}
            mb="1rem"
          >
            Connector Overview
          </Typography>

          <Typography
            variant="body1"
            color={theme.palette.neutral[200]}
            mb="1rem"
          >
            Here you can find an overview of your connector’s current state,
            configuration, and shared data.
          </Typography>

          <Box display="flex" flexDirection="column" mb="2rem" width="100%">
            {/* Image centered */}
            <Box mb="1rem" display="flex" justifyContent="center">
              <img
                src={UMLDiagram}
                alt="UML Offer Diagram"
                style={{ maxWidth: "100%", height: "auto", borderRadius: "0.5rem" }}
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT SECTION */}
        <Box
          flex={1}
          p="1.5rem"
          borderRadius="1rem"
          bgcolor={theme.palette.background.alt}
          display="flex"
          flexDirection="column"
          sx={{
            boxShadow: 3,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={theme.palette.secondary[100]}
            mb="1rem"
          >
            Offering new data
          </Typography>

          <Typography
            variant="body1"
            color={theme.palette.neutral[200]}
            mb="1.5rem"
          >
            Below several options are provided to navigate to dedicated pages to offer new data. Choose to (1) link new data, (2) create a new contract, or (3) make a new offer. Note that one can only make offers when the data is linked to the connector (1) and linked to a contract (2). 
          </Typography>

          {/* Vertical Buttons */}
          <Box display="flex" flexDirection="column" gap="1rem">
            <Button
              variant="contained"
              onClick={() => navigate("/dataprovider/catalog")}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.secondary[50],
                "&:hover": {
                  backgroundColor: theme.palette.primary[300],
                },
                px: "1.5rem",
                py: "0.75rem",
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              (1) View and Create New Catalogs
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/dataprovider/offer")}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.secondary[50],
                "&:hover": {
                  backgroundColor: theme.palette.primary[300],
                },
                px: "1.5rem",
                py: "0.75rem",
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              (2) View and Create New Resource Offers
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/dataprovider/representation")}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.secondary[50],
                "&:hover": {
                  backgroundColor: theme.palette.primary[300],
                },
                px: "1.5rem",
                py: "0.75rem",
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              (3) View and Link New Representations
            </Button>

            <Button
              variant="contained"
              onClick={() => navigate("/dataprovider/contract")}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.secondary[50],
                "&:hover": {
                  backgroundColor: theme.palette.primary[300],
                },
                px: "1.5rem",
                py: "0.75rem",
                borderRadius: "2rem",
                textTransform: "none",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              (4) View or Create New Contract
            </Button>


          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DataProvider;
