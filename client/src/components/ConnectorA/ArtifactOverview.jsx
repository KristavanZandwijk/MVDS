import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  TextField,
  Link,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const ArtifactOverview = () => {
  const theme = useTheme();
  const [artifacts, setArtifacts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchArtifacts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/artifacts", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      // ✅ Correct extraction of artifacts
      const resources = data._embedded?.artifacts || [];

      // Sort from newest to oldest
      const sortedArtifacts = [...resources].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      setArtifacts(sortedArtifacts);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const handleShowMore = () => setVisibleCount((prev) => prev + 4);

  const handleRefresh = () => {
    fetchArtifacts();
    setVisibleCount(8);
    setSearch("");
  };

  const filteredArtifacts = artifacts.filter((artifact) =>
    artifact.title?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleArtifacts = filteredArtifacts.slice(0, visibleCount);

  return (
    <>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Artifact Overview
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Here you can see the artifacts available in your connector. They are shown from
        newest to oldest. Use the search bar to filter by title.
      </Typography>

      {/* Search bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {/* No artifacts */}
      {!loading && !error && filteredArtifacts.length === 0 && (
        <Typography mt={2}>No artifacts found.</Typography>
      )}

      {/* Artifacts grid */}
      {!loading && !error && filteredArtifacts.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleArtifacts.map((artifact, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 calc(33.33% - 16px)",
                  minWidth: 250,
                  maxWidth: "100%",
                }}
              >
                <Card
                  sx={{
                    minHeight: 200,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 },
                    borderRadius: "12px",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {artifact.title || `Artifact #${index + 1}`}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {artifact.description || "No description provided."}
                    </Typography>

                    <Box mt={1}>
                      <Typography variant="caption" display="block">
                        <strong>ID:</strong> {artifact.remoteId || "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>Created:</strong>{" "}
                        {artifact.creationDate
                          ? new Date(artifact.creationDate).toLocaleString()
                          : "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>Modified:</strong>{" "}
                        {artifact.modificationDate
                          ? new Date(artifact.modificationDate).toLocaleString()
                          : "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block" mt={1}>
                        <strong>Byte Size:</strong> {artifact.byteSize || 0} bytes
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>Checksum:</strong> {artifact.checkSum || "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {visibleCount < filteredArtifacts.length && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button variant="contained" color="primary" onClick={handleShowMore}>
                Show more artifacts
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default ArtifactOverview;
