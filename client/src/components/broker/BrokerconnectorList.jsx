import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const BrokerConnectorList = () => {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [artifactIds, setArtifactIds] = useState([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState("");
  const [connectorList, setConnectorList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [error, setError] = useState(null);
  const [connectorError, setConnectorError] = useState("");

  // Fetch Broker Self-Description
  const fetchBrokerDescription = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(
        `/connectorb/api/ids/description?recipient=${encodeURIComponent(
          "https://broker-reverseproxy/infrastructure"
        )}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch broker description: ${response.status}`);
      }

      const json = await response.json();
      setData(json);

      // Extract all Artifact IDs
      const artifacts = [];
      json["ids:resourceCatalog"]?.forEach((catalog) => {
        catalog["ids:offeredResource"]?.forEach((res) => {
          res["ids:representation"]?.forEach((rep) => {
            rep["ids:instance"]?.forEach((artifact) => {
              if (artifact["@id"]) artifacts.push(artifact["@id"]);
            });
          });
        });
      });

      setArtifactIds(artifacts);
    } catch (err) {
      console.error("Error fetching broker self-description:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Access URL for a connector
  const fetchConnectorAccessURL = async (connectorId) => {
    try {
      const res = await fetch(
        `/connectorb/api/ids/description?recipient=${encodeURIComponent(
          "https://broker-reverseproxy/infrastructure"
        )}&elementId=${encodeURIComponent(connectorId)}`,
        { method: "POST" }
      );

      if (!res.ok) return "N/A";

      const json = await res.json();
      const endpoint = (json["@graph"] || []).find(
        (item) => item["@type"] === "ids:ConnectorEndpoint"
      );
      return endpoint?.accessURL || "N/A";
    } catch (err) {
      console.error(err);
      return "N/A";
    }
  };

  // Fetch Connectors for a selected Artifact ID
  const fetchConnectorList = async (artifactId) => {
    if (!artifactId) return;

    setConnectorError("");
    setLoadingConnectors(true);
    setConnectorList([]);

    try {
      const response = await fetch(
        `/connectorb/api/ids/description?recipient=${encodeURIComponent(
          "https://broker-reverseproxy/infrastructure"
        )}&elementId=${encodeURIComponent(artifactId)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch connectors: ${response.status}`);
      }

      const json = await response.json();

      const connectors = (json["@graph"] || []).filter(
        (item) => item["@type"] === "ids:BaseConnector"
      );

      const resourceCatalogs = (json["@graph"] || []).filter(
        (item) => item["@type"] === "ids:ResourceCatalog"
      );

      // Fetch accessURL for each connector
      const connectorsWithAccess = await Promise.all(
        connectors.map(async (conn) => {
          const catalogs =
            conn.resourceCatalog?.map((catId) =>
              resourceCatalogs.find((c) => c["@id"] === catId)
            ) || [];

          const accessURL = await fetchConnectorAccessURL(conn["@id"]);

          return { ...conn, catalogs, accessURL };
        })
      );

      setConnectorList(connectorsWithAccess);
    } catch (err) {
      console.error("Error fetching connectors:", err);
      setConnectorError(err.message);
    } finally {
      setLoadingConnectors(false);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Broker Connectors
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
        Select a broker catalog to automatically fetch its connectors and view access URLs.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Data Display */}
      {data && !loading && !error && (
        <Box>
          {/* Artifact Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Broker Catalog</InputLabel>
            <Select
              value={selectedArtifactId}
              label="Select Artifact ID"
              onChange={(e) => {
                const artifactId = e.target.value;
                setSelectedArtifactId(artifactId);
                fetchConnectorList(artifactId); // Auto-fetch connectors
              }}
            >
              {artifactIds.length === 0 ? (
                <MenuItem disabled>No Artifact IDs available</MenuItem>
              ) : (
                artifactIds.map((id) => (
                  <MenuItem key={id} value={id}>
                    {id}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* Connector Fetch State */}
          {loadingConnectors && (
            <Box display="flex" justifyContent="center" mt={3}>
              <CircularProgress color="secondary" />
            </Box>
          )}

          {connectorError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {connectorError}
            </Alert>
          )}

          {/* Connector Results */}
          {!loadingConnectors && connectorList.length > 0 && (
            <Box mt={3}>
              {connectorList.map((conn, idx) => (
                <Card
                  key={idx}
                  sx={{
                    mb: 2,
                    borderRadius: "1rem",
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: 2,
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={theme.palette.secondary[100]}
                    >
                      <strong>Title: </strong>
                      {conn.title || "Unnamed Connector"}
                    </Typography>

                    <Typography variant="body2">
                      <strong>Connector ID:</strong> {conn["@id"]}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Description:</strong> {conn.description || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Curator:</strong> {conn.curator || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Maintainer:</strong> {conn.maintainer || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Version:</strong> {conn.version || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Security Profile:</strong> {conn.securityProfile || "N/A"}
                    </Typography>
                    <Typography variant="body2" color={theme.palette.primary[500]}>
                      <strong>Access URL Connector:</strong> {conn.accessURL || "N/A"}
                    </Typography>

                    {/* Resource Catalogs */}
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      color={theme.palette.secondary[100]}
                    >
                      Resource Catalogs:
                    </Typography>

                    {conn.catalogs && conn.catalogs.length > 0 ? (
                      conn.catalogs.map((cat, cIdx) => (
                        <Box key={cIdx} ml={2} mt={1}>
                          <Typography variant="body2">
                            <strong>Catalog ID:</strong> {cat["@id"] || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Catalog URL (sameAs):</strong> {cat.sameAs || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Type:</strong> {cat["@type"] || "N/A"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" ml={2} mt={1}>
                        This connector does not have any catalogs (yet).
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BrokerConnectorList;
