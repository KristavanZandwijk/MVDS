import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  Button,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";

const StartNegotiation = () => {
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
  const [loadingNegotiation, setLoadingNegotiation] = useState(false);

  const [error, setError] = useState(null);
  const [connectorError, setConnectorError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [negotiationError, setNegotiationError] = useState("");
  const [negotiationResponse, setNegotiationResponse] = useState(null);

  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  // Contract form state (user-friendly)
  const [contractForm, setContractForm] = useState({
    title: "Example Usage Policy",
    description: "Usage policy provide access applied",
    action: "https://w3id.org/idsa/code/USE",
    ruleId: "",
    targetArtifact: "",
  });

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
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
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

  // --- Fetch Connectors for selected Artifact ---
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
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
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

  // --- Fetch Catalog Details ---
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
        if (!response.ok) throw new Error(`Failed: ${response.status}`);
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

  // --- Build Contract Body from user-friendly form ---
  const buildContractBody = () => {
    if (!selectedResource || !selectedArtifact || !contractForm.ruleId) return "";
    return JSON.stringify([
      {
        "@type": "ids:Permission",
        "@id": contractForm.ruleId,
        "ids:title": [{ "@value": contractForm.title }],
        "ids:description": [{ "@value": contractForm.description }],
        "ids:action": [{ "@id": contractForm.action }],
        "ids:target": contractForm.targetArtifact,
      },
    ]);
  };

  // --- Start Negotiation ---
  const startNegotiation = async () => {
    if (!selectedConnector || !selectedResource || !selectedArtifact) return;
    setLoadingNegotiation(true);
    setNegotiationError("");
    setNegotiationResponse(null);
    try {
      const response = await fetch(
        `/connectorb/api/ids/contract?recipient=${encodeURIComponent(
          selectedConnector.accessURL
        )}&resourceIds=${encodeURIComponent(selectedResource["@id"])}&artifactIds=${encodeURIComponent(
          selectedArtifact
        )}&download=false`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: buildContractBody(),
        }
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const json = await response.json();
      setNegotiationResponse(json);
    } catch (err) {
      console.error(err);
      setNegotiationError(err.message);
    } finally {
      setLoadingNegotiation(false);
    }
  };

  // Prefill contract form when resource is selected
  useEffect(() => {
    if (selectedResource && selectedArtifact) {
      const recommendedRuleId = selectedResource["ids:contractOffer"]?.[0]?.["@id"] || "";
      setContractForm({
        title: "Example Usage Policy",
        description: "Usage policy provide access applied",
        action: "https://w3id.org/idsa/code/USE",
        ruleId: recommendedRuleId,
        targetArtifact: selectedArtifact,
      });
    }
  }, [selectedResource, selectedArtifact]);

  useEffect(() => {
    fetchBrokerDescription();
  }, []);

  return (
    <Box flex={1} p="1.5rem" borderRadius="1rem" bgcolor={theme.palette.background.alt} sx={{ boxShadow: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Contract Negotiation
        </Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchBrokerDescription} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
              Here you can initiate a contract. Select the catalog and the resource you want access to, and submit a contract offer.
        </Typography>

      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error">{error}</Alert>}

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
                fetchConnectorList(artifactId);
              }}
            >
              {artifactIds.map((id) => (
                <MenuItem key={id} value={id}>{id}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Connector Selection */}
          {connectorList.length > 0 && (
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
          )}

          {/* Catalog Selection */}
          {selectedConnector && selectedConnector.catalogs?.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Catalog(s)</InputLabel>
              <Select
                multiple
                value={selectedCatalogs.map(c => c["@id"])}
                onChange={(e) => {
                  const cats = selectedConnector.catalogs.filter(c => e.target.value.includes(c["@id"]));
                  setSelectedCatalogs(cats);
                  setCatalogResources([]);
                }}
                renderValue={() => `${selectedCatalogs.length} selected`}
              >
                {selectedConnector.catalogs.map(cat => (
                  <MenuItem key={cat["@id"]} value={cat["@id"]}>
                    {cat["@id"]}
                    {selectedCatalogs.some(c => c["@id"] === cat["@id"]) && <CheckIcon sx={{ marginLeft: "auto", color: "green" }} />}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={selectedCatalogs.length === 0 || loadingCatalog}
            onClick={fetchCatalogDetails}
            color="secondary"
          >
            Fetch Catalog(s)
          </Button>

          {/* Resource Selection */}
          {catalogResources.length > 0 && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Resource</InputLabel>
              <Select
                value={selectedResource?.["@id"] || ""}
                onChange={(e) => {
                  const res = catalogResources.find(r => r["@id"] === e.target.value);
                  setSelectedResource(res);
                  const artifactId = res["ids:representation"]?.[0]?.["ids:instance"]?.[0]?.["@id"];
                  setSelectedArtifact(artifactId);
                }}
              >
                {catalogResources.map(res => (
                  <MenuItem key={res["@id"]} value={res["@id"]}>
                    {res["ids:title"]?.[0]?.["@value"] || res["@id"]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* User-friendly Contract Form */}
          {selectedResource && selectedArtifact && contractForm.ruleId && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommended Contract Offer (Editable)
                </Typography>

                <TextField
                  label="Rule ID"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={contractForm.ruleId}
                  onChange={(e) => setContractForm({ ...contractForm, ruleId: e.target.value })}
                />

                <TextField
                  label="Title"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                />

                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={2}
                  sx={{ mb: 2 }}
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                />

                <TextField
                  label="Action (IDS URI)"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={contractForm.action}
                  onChange={(e) => setContractForm({ ...contractForm, action: e.target.value })}
                />

                <TextField
                  label="Target Artifact ID"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={contractForm.targetArtifact}
                  onChange={(e) => setContractForm({ ...contractForm, targetArtifact: e.target.value })}
                />
              </CardContent>
            </Card>
          )}

          {/* Start Negotiation */}
          <Button
            variant="contained"
            color="secondary"
            onClick={startNegotiation}
            disabled={loadingNegotiation || !selectedResource || !selectedArtifact || !contractForm.ruleId}
          >
            Start Negotiation
          </Button>
          {loadingNegotiation && <CircularProgress sx={{ mt: 2 }} />}
          {negotiationError && <Alert severity="error" sx={{ mt: 2 }}>{negotiationError}</Alert>}

          {/* Negotiation Response */}
            {negotiationResponse && (
            <Box mt={2}>
                <Typography variant="h6">Negotiation Response</Typography>

                {/* Extract agreement info */}
                {(() => {
                let agreementId = "";
                let confirmed = false;
                let contractStart = "";
                let contractEnd = "";

                try {
                    // Parse value if it's a string
                    const value = typeof negotiationResponse.value === "string"
                    ? JSON.parse(negotiationResponse.value)
                    : negotiationResponse.value;

                    if (value["@type"] === "ids:ContractAgreement") {
                    agreementId = value["@id"] || negotiationResponse.remoteId;
                    confirmed = negotiationResponse.confirmed || false;
                    contractStart = value["ids:contractStart"]?.["@value"] || "";
                    contractEnd = value["ids:contractEnd"]?.["@value"] || "";
                    } else {
                    agreementId = negotiationResponse.remoteId || "";
                    }
                } catch (err) {
                    console.error("Failed to parse negotiation response", err);
                }

                return (
                    <Card sx={{ p: 2, mb: 2 }}>
                    <Typography><strong>Agreement ID:</strong> {agreementId}</Typography>
                    <Typography><strong>Confirmed:</strong> {confirmed ? "Yes ✅" : "No ❌"}</Typography>
                    {contractStart && <Typography><strong>Contract Start:</strong> {new Date(contractStart).toLocaleString()}</Typography>}
                    {contractEnd && <Typography><strong>Contract End:</strong> {new Date(contractEnd).toLocaleString()}</Typography>}

                    {/* Optional: show full JSON */}
                    <Box mt={1}>
                        <Typography variant="subtitle2">Full Response:</Typography>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12 }}>
                        {JSON.stringify(negotiationResponse, null, 2)}
                        </pre>
                    </Box>
                    </Card>
                );
                })()}
            </Box>
            )}

        </Box>
      )}
    </Box>
  );
};

export default StartNegotiation;
