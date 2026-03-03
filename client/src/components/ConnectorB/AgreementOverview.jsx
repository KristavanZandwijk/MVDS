import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  TextField,
  useTheme,
  Divider,
  Link,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const ReceivedData = ({ agreementSelfLink }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artifactData, setArtifactData] = useState(null);

  useEffect(() => {
    const fetchArtifactData = async () => {
      setLoading(true);
      setError(null);

      try {
        const agreementId = agreementSelfLink.replace(/^.*\/api\/agreements\//, "");
        const response = await fetch(`/connectorb/api/agreements/${encodeURIComponent(agreementId)}/artifacts`);
        if (!response.ok) throw new Error(`Error fetching artifact: ${response.status}`);
        const data = await response.json();

        const artifact = data._embedded?.artifacts?.[0];
        if (!artifact) {
          setArtifactData(null);
        } else {
          setArtifactData({
            title: artifact.title || "No title",
            description: artifact.description || "No description",
            dataHref: artifact._links?.data?.href || null,
            creationDate: artifact.creationDate,
            modificationDate: artifact.modificationDate,
            byteSize: artifact.byteSize,
          });
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifactData();
  }, [agreementSelfLink]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1} mt={1}>
        <CircularProgress size={18} />
        <Typography variant="body2">Fetching artifact data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" mt={1}>
        {error}
      </Typography>
    );
  }

  if (!artifactData) {
    return (
      <Typography variant="body2" mt={1}>
        No artifact data available.
      </Typography>
    );
  }

  return (
    <Card variant="outlined" sx={{ mt: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Artifact Information
        </Typography>
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="body2"><strong>Title:</strong> {artifactData.title}</Typography>
          <Typography variant="body2"><strong>Description:</strong> {artifactData.description}</Typography>
          <Typography variant="body2"><strong>Creation Date:</strong> {artifactData.creationDate ? new Date(artifactData.creationDate).toLocaleString() : "N/A"}</Typography>
          <Typography variant="body2"><strong>Modification Date:</strong> {artifactData.modificationDate ? new Date(artifactData.modificationDate).toLocaleString() : "N/A"}</Typography>
          <Typography variant="body2"><strong>Byte Size:</strong> {artifactData.byteSize ?? "N/A"}</Typography>
          <Divider sx={{ my: 1 }} />
          {artifactData.dataHref ? (
            <Typography variant="body2">
              <strong>Access the data here:</strong>{" "}
              <Link href={artifactData.dataHref} target="_blank" rel="noopener noreferrer" color="secondary">
                {artifactData.dataHref}
              </Link>
            </Typography>
          ) : (
            <Typography variant="body2">No data link available.</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};


const AgreementOverview = () => {
  const theme = useTheme();

  const [agreements, setAgreements] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4); // initially show 4

  const fetchAgreements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/connectorb/api/agreements");
      if (!response.ok) throw new Error(`Error fetching agreements: ${response.status}`);
      const data = await response.json();
      setAgreements(data._embedded?.agreements || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const evaluateAgreementCompleteness = (agreementValue) => {
    const requiredFields = [
      "ids:provider",
      "ids:consumer",
      "ids:contractStart",
      "ids:contractEnd",
      "ids:permission",
    ];
    const missing = requiredFields.filter(
      (field) =>
        !agreementValue[field] ||
        (Array.isArray(agreementValue[field]) && agreementValue[field].length === 0)
    );
    return { complete: missing.length === 0, missing };
  };

  // Filter & search agreements
  let filteredAgreements = agreements.filter((a) => {
    const value = JSON.parse(a.value || "{}");
    const title = value["ids:permission"]?.[0]?.["ids:title"]?.[0]?.["@value"]?.toLowerCase() || "";
    const provider = value["ids:provider"]?.["@id"]?.toLowerCase() || "";
    const consumer = value["ids:consumer"]?.["@id"]?.toLowerCase() || "";
    return (
      title.includes(search.toLowerCase()) ||
      provider.includes(search.toLowerCase()) ||
      consumer.includes(search.toLowerCase())
    );
  });

  // Sort newest to oldest by contractDate
  filteredAgreements.sort((a, b) => {
    const aDate = new Date(JSON.parse(a.value || "{}")["ids:contractDate"]?.["@value"] || 0);
    const bDate = new Date(JSON.parse(b.value || "{}")["ids:contractDate"]?.["@value"] || 0);
    return bDate - aDate;
  });

  // Slice to show only visibleCount
  const visibleAgreements = filteredAgreements.slice(0, visibleCount);

  return (
    <Box flex={1} p="1.5rem" borderRadius="1rem" bgcolor={theme.palette.background.alt} sx={{ boxShadow: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Contract Overview
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchAgreements}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Complete agreements are shown in <strong style={{ color: "green" }}>green</strong>, incomplete in <strong style={{ color: "red" }}>red</strong>. For complete contract, it is possible to access the data. Click the link to view the data!
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by title, provider, or consumer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary" />
        </Box>
      )}

      {error && <Typography color="error" mt={2}>{error}</Typography>}

      {!loading && !error && filteredAgreements.length === 0 && (
        <Typography mt={2}>No agreements found.</Typography>
      )}

      {!loading && !error && visibleAgreements.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleAgreements.map((agreement, index) => {
              const agreementValue = JSON.parse(agreement.value || "{}");
              const { complete } = evaluateAgreementCompleteness(agreementValue);

              const provider = agreementValue["ids:provider"]?.["@id"] || "N/A";
              const consumer = agreementValue["ids:consumer"]?.["@id"] || "N/A";
              const start = agreementValue["ids:contractStart"]?.["@value"];
              const end = agreementValue["ids:contractEnd"]?.["@value"];
              const contractDate = agreementValue["ids:contractDate"]?.["@value"];
              const permissions = agreementValue["ids:permission"] || [];
              const contractId = agreement._links?.self?.href || "Unknown ID";

              const title = permissions?.[0]?.["ids:title"]?.[0]?.["@value"] || `Agreement #${index + 1}`;
              const description = permissions?.[0]?.["ids:description"]?.[0]?.["@value"] || "No description provided";

              return (
                <Box key={index} sx={{ flex: "1 1 calc(33.33% - 16px)", minWidth: 280, maxWidth: "100%" }}>
                  <Card sx={{ minHeight: 400, transition: "0.3s", "&:hover": { boxShadow: 6 }, borderLeft: complete ? "5px solid #4caf50" : "5px solid #f44336" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom><strong>Title:</strong> {title}</Typography>
                      <Typography variant="body2" gutterBottom><strong>Description:</strong> {description}</Typography>

                      <Divider sx={{ my: 1 }} />

                      <Box display="flex" flexDirection="column" gap={0.75}>
                        <Typography variant="body2"><strong>Provider:</strong> {provider}</Typography>
                        <Typography variant="body2"><strong>Consumer:</strong> {consumer}</Typography>
                        <Typography variant="body2"><strong>Contract ID:</strong> {contractId}</Typography>
                        <Typography variant="body2"><strong>Contract Date:</strong> {contractDate ? new Date(contractDate).toLocaleString() : "N/A"}</Typography>
                        <Typography variant="body2"><strong>Start:</strong> {start ? new Date(start).toLocaleString() : "N/A"}</Typography>
                        <Typography variant="body2"><strong>End:</strong> {end ? new Date(end).toLocaleString() : "N/A"}</Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="h6" gutterBottom>Contract Details</Typography>
                      {permissions.length > 0 ? permissions.map((perm, pIndex) => {
                        const action = perm["ids:action"]?.[0]?.["@id"]?.split("/")?.pop();
                        const target = perm["ids:target"]?.["@id"];
                        return (
                          <React.Fragment key={pIndex}>
                            <Typography variant="body2"><strong>Action:</strong> {action || "N/A"}</Typography>
                            <Typography variant="body2"><strong>Target:</strong> {target || "N/A"}</Typography>
                            {pIndex < permissions.length - 1 && <Divider sx={{ my: 0.5 }} />}
                          </React.Fragment>
                        );
                      }) : <Typography variant="body2" color="textSecondary">No contract details available.</Typography>}

                      <ReceivedData agreementSelfLink={contractId} />
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {/* Show More button */}
          {visibleCount < filteredAgreements.length && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button variant="outlined" onClick={() => setVisibleCount(visibleCount + 4)} color="secondary">
                Show More
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AgreementOverview;
