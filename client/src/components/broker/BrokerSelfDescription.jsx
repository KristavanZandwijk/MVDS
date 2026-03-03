import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Divider,
  Alert,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const BrokerSelfDescription = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrokerDescription = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/connectorb/api/ids/description?recipient=${encodeURIComponent(
          "https://broker-reverseproxy/infrastructure"
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch broker description: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching broker self-description:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerDescription();
  }, []);

  return (
    <Box
      flex={1}
      p="1.5rem"
      borderRadius="1rem"
      bgcolor={theme.palette.background.alt}
      sx={{ boxShadow: 3 }}
    >
      {/* Header */}
      <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center" 
      mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Broker Self-Description
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchBrokerDescription}
          disabled={loading}
        >
          Refresh
        </Button>

        
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
              Below the self-description of the broker that you are connected to is displayed.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Display */}
      {data && !loading && !error && (
        <Box >
            {/* General Info */}
            <Typography variant="h6" gutterBottom color={theme.palette.secondary[100]}>
              <strong>Title: </strong>{data["ids:title"]?.[0]?.["@value"] || "Unnamed Broker"}
            </Typography>

            <Typography variant="body2" color={theme.palette.secondary} gutterBottom>
              <strong>Description: </strong>
              {data["ids:description"]?.[0]?.["@value"] || "No description available."}
            </Typography>

            <Typography variant="subtitle2" color={theme.palette.secondary} gutterBottom>
              <strong>Type:</strong> {data["@type"]}
            </Typography>

            <Typography variant="subtitle2" color={theme.palette.secondary} gutterBottom>
              <strong>ID:</strong> {data["@id"]}
            </Typography>

            <Typography variant="subtitle2" color={theme.palette.primary[500]} gutterBottom>
              <strong>Access URL (Default Endpoint):</strong>{" "}
              {data["ids:hasDefaultEndpoint"]?.["ids:accessURL"]?.["@id"] || "N/A"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Endpoints */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Endpoints:
            </Typography>

            {data["ids:hasEndpoint"]?.map((ep, idx) => (
              <Box key={idx} mb={1}>
                <Typography variant="body2" gutterBottom>
                  <strong>Type:</strong> {ep["@type"] || "N/A"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>ID:</strong> {ep["@id"] || "N/A"}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Path:</strong> {ep["ids:path"] || "N/A"}
                </Typography>
                <Typography variant="body2" color={theme.palette.primary[500]} gutterBottom>
                  <strong>Access URL:</strong> {ep["ids:accessURL"]?.["@id"] || "N/A"}
                </Typography>
                {ep["ids:endpointInformation"]?.map((info, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    color={theme.palette.secondary}
                    sx={{ ml: 2 }}
                  >
                    • {info["@value"]}
                  </Typography>
                ))}
                <Divider sx={{ my: 1 }} />
              </Box>
            ))}

            {/* Resource Catalog Section */}
            {data["ids:resourceCatalog"] && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ mt: 3 }}
                >
                  Resource Catalog:
                </Typography>

                {data["ids:resourceCatalog"].map((catalog, idx) => (
                  <Box key={idx} mb={2}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Type:</strong> {catalog["@type"] || "N/A"}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>ID:</strong> {catalog["@id"] || "N/A"}
                    </Typography>

                    {/* Offered Resources */}
                    {catalog["ids:offeredResource"]?.map((res, rIdx) => (
                      <Box key={rIdx} ml={2} mt={1}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Offered Resource Type:</strong> {res["@type"] || "N/A"}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Offered Resource ID:</strong> {res["@id"] || "N/A"}
                        </Typography>

                        {/* Representations */}
                        {res["ids:representation"]?.map((rep, repIdx) => (
                          <Box key={repIdx} ml={2} mt={1}>
                            <Typography variant="body2" gutterBottom>
                              <strong>Representation Type:</strong> {rep["@type"] || "N/A"}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              <strong>Representation ID:</strong> {rep["@id"] || "N/A"}
                            </Typography>

                            {/* Artifacts */}
                            {rep["ids:instance"]?.map((artifact, aIdx) => (
                              <Box key={aIdx} ml={2} mt={0.5}>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Artifact Type:</strong> {artifact["@type"] || "N/A"}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.primary[500]} gutterBottom>
                                  <strong>Artifact ID:</strong> {artifact["@id"] || "N/A"}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                      </Box>
                    ))}
                  </Box>
                ))}
              </>
            )}
          </Box>
      )}
    </Box>
  );
};

export default BrokerSelfDescription;
