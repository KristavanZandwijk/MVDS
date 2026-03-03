import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import Header from "components/Header";
import systemImage from "assets/SystemHypothesis.png";

const Homepage = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      {/* Page Header */}
      <Header
        title="Homepage"
        subtitle="Welcome to the Construction Data Space. Explore how data flows between providers, consumers, and brokers within our Data Space ecosystem."
      />

      {/* Diagram / Image */}
      <Box
        component="img"
        src={systemImage}
        alt="System Hypothesis Diagram"
        sx={{
          display: "block",
          width: "80%",
          maxWidth: 800,
          margin: "2rem auto",
          borderRadius: "1rem",
          boxShadow: 3,
        }}
      />

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.5rem",
          mt: "2rem",
        }}
      >
        {["dataprovider (Connector A)", "dataconsumer (Connector B)", "broker"].map((route) => (
          <Button
            key={route}
            component={Link}
            to={`/${route}`}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.secondary.main,
              borderRadius: "3rem",
              px: "2rem",
              py: "0.75rem",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
            }}
          >
            {route
              .replace(/^\w/, (c) => c.toUpperCase())
              .replace(/([A-Z])/g, " $1")
              .trim()}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default Homepage;
