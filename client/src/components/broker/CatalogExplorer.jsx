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
  Chip, 
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

const CatalogExplorer = () => {
  const theme = useTheme();

  const [data, setData] = useState(null);
  const [artifactIds, setArtifactIds] = useState([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState("");
  const [connectorList, setConnectorList] = useState([]);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [catalogResources, setCatalogResources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  const [error, setError] = useState(null);
  const [connectorError, setConnectorError] = useState("");
  const [catalogError, setCatalogError] = useState("");

  // --- Fetch Broker Self-Description ---
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

      if (!response.ok)
        throw new Error(`Failed to fetch broker description: ${response.status}`);

      const json = await response.json();
      setData(json);

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
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Connector Access URL ---
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

  // --- Fetch Connectors for a selected Artifact ---
  const fetchConnectorList = async (artifactId) => {
    if (!artifactId) return;

    setConnectorError("");
    setLoadingConnectors(true);
    setConnectorList([]);
    setSelectedConnector(null);
    setSelectedCatalogs([]);
    setCatalogResources([]);

    try {
      const response = await fetch(
        `/connectorb/api/ids/description?recipient=${encodeURIComponent(
          "https://broker-reverseproxy/infrastructure"
        )}&elementId=${encodeURIComponent(artifactId)}`,
        { method: "POST" }
      );

      if (!response.ok)
        throw new Error(`Failed to fetch connectors: ${response.status}`);

      const json = await response.json();
      const connectors = (json["@graph"] || []).filter(
        (item) => item["@type"] === "ids:BaseConnector"
      );
      const resourceCatalogs = (json["@graph"] || []).filter(
        (item) => item["@type"] === "ids:ResourceCatalog"
      );

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
      console.error(err);
      setConnectorError(err.message);
    } finally {
      setLoadingConnectors(false);
    }
  };

  // --- Fetch Catalog Details from selected catalogs ---
  const fetchCatalogDetails = async () => {
    if (!selectedConnector || selectedCatalogs.length === 0) {
      setCatalogError("Select a connector and at least one catalog.");
      return;
    }

    setCatalogError("");
    setLoadingCatalog(true);
    setCatalogResources([]);

    try {
      const allResources = [];

      for (const cat of selectedCatalogs) {
        const catalogURL = cat.sameAs.replace(
          "https://localhost:8080",
          selectedConnector.accessURL.replace(/\/$/, "")
        );

        const response = await fetch(
          `/connectorb/api/ids/description?recipient=${encodeURIComponent(
            selectedConnector.accessURL
          )}&elementId=${encodeURIComponent(catalogURL)}`,
          { method: "POST" }
        );

        if (!response.ok)
          throw new Error(`Failed to fetch catalog: ${response.status}`);
        const json = await response.json();
        allResources.push(...(json["ids:offeredResource"] || []));
      }

      setCatalogResources(allResources);
    } catch (err) {
      console.error(err);
      setCatalogError(err.message);
    } finally {
      setLoadingCatalog(false);
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
          Catalog Explorer
        </Typography>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchBrokerDescription}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Select a broker and connector to explore the catalogs within the connector.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {data && (
        <Box mt={3}>
          {/* Artifact Selection */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Broker Catalog</InputLabel>
            <Select
              value={selectedArtifactId}
              onChange={(e) => {
                const artifactId = e.target.value;
                setSelectedArtifactId(artifactId);
                fetchConnectorList(artifactId); // Auto-fetch connectors
              }}
            >
              {artifactIds.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingConnectors && <CircularProgress sx={{ mt: 2 }} />}
          {connectorError && <Alert severity="error" sx={{ mt: 2 }}>{connectorError}</Alert>}

          {/* Connector Selection */}
          {connectorList.length > 0 && (
            <Box mt={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Connector</InputLabel>
                <Select
                  value={selectedConnector?.["@id"] || ""}
                  onChange={(e) => {
                    const conn = connectorList.find((c) => c["@id"] === e.target.value);
                    setSelectedConnector(conn);
                    setSelectedCatalogs([]);
                    setCatalogResources([]);
                  }}
                >
                  {connectorList.map((conn) => (
                    <MenuItem key={conn["@id"]} value={conn["@id"]}>
                      {conn.title} ({conn.accessURL})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Catalog Selection (Multiple) */}
              {selectedConnector && (
                <Box mt={2}>
                    {selectedConnector.catalogs && selectedConnector.catalogs.length > 0 ? (
                    <>
                        {/* Multi-select dropdown with checkmarks */}
                        <FormControl fullWidth sx={{ mb: 1 }}>
                        <InputLabel>Select Catalog(s)</InputLabel>
                        <Select
                            multiple
                            value={selectedCatalogs.map((c) => c["@id"])}
                            onChange={(e) => {
                            const selectedIds = e.target.value;
                            const cats = selectedConnector.catalogs.filter((c) =>
                                selectedIds.includes(c["@id"])
                            );
                            setSelectedCatalogs(cats);
                            setCatalogResources([]);
                            }}
                            renderValue={() => `${selectedCatalogs.length} selected`}
                        >
                            {selectedConnector.catalogs.map((cat) => (
                            <MenuItem key={cat["@id"]} value={cat["@id"]}>
                                {cat["@id"]}
                                {selectedCatalogs.some((c) => c["@id"] === cat["@id"]) && (
                                <CheckIcon sx={{ marginLeft: "auto", color: "green" }} />
                                )}
                            </MenuItem>
                            ))}
                        </Select>
                        </FormControl>

                        {/* Display selected catalogs below as chips with delete */}
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                        {selectedCatalogs.map((cat) => (
                            <Chip
                            key={cat["@id"]}
                            label={cat["@id"]}
                            onDelete={() => {
                                setSelectedCatalogs(selectedCatalogs.filter((c) => c["@id"] !== cat["@id"]));
                                setCatalogResources([]);
                            }}
                            deleteIcon={<DeleteIcon />}
                            color="primary"
                            size="small"
                            />
                        ))}
                        </Box>
                    </>
                    ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No catalogs to explore for this connector.
                    </Alert>
                    )}
                </Box>
                )}


              <Button
                variant="outlined"
                onClick={fetchCatalogDetails}
                disabled={loadingCatalog || selectedCatalogs.length === 0}
                color="secondary"
                sx={{ mt: 2 }}
              >
                Fetch Catalog(s)
              </Button>
              {loadingCatalog && <CircularProgress sx={{ mt: 2 }} />}
              {catalogError && <Alert severity="error" sx={{ mt: 2 }}>{catalogError}</Alert>}
            </Box>
          )}

          {/* Display Offered Resources */}
          {catalogResources.length > 0 && (
            <Box mt={3}>
              {catalogResources.map((res) => (
                <Card key={res["@id"]} sx={{ mb: 2, borderRadius: "1rem", boxShadow: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                       <strong>Title: </strong>{res["ids:title"]?.[0]?.["@value"] || "No Title"}
                    </Typography>
                    <Typography variant="body2">
                      <strong> Offered Resource Description:</strong> {res["ids:description"]?.[0]?.["@value"] || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Offered Resource ID:</strong> {res["@id"]}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Offered Resource Type:</strong> {res["@type"]}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Language:</strong> {res["ids:language"]?.[0]?.["@id"] || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Publisher:</strong> {res["ids:publisher"]?.["@id"] || "N/A"}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Keywords:</strong> {res["ids:keyword"]?.map((k) => k["@value"]).join(", ") || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Created:</strong> {res["ids:created"]?.["@value"] || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Modified:</strong> {res["ids:modified"]?.["@value"] || "N/A"}
                    </Typography>



                    {res["ids:representation"]?.map((rep, i) => (
                      <Box key={i} ml={2} mt={1}>
                            <Typography variant="body2">
                            <strong>Representation ID:</strong> {res["ids:representation"]?.map((c) => c["@id"]).join(", ") || "N/A"}
                            </Typography>

                            <Typography variant="body2">
                            <strong>Artifacts:</strong> {rep["ids:instance"]?.map((inst) => inst["@id"]).join(", ")}
                            </Typography>

                            <Typography variant="body2">
                            <strong>Contract Offer ID:</strong> {res["ids:contractOffer"]?.map((c) => c["@id"]).join(", ") || "N/A"}
                            </Typography>

                            
                        
                      </Box>
                    ))}
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

export default CatalogExplorer;
