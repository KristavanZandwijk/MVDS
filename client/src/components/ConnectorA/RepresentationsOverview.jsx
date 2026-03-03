import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  useTheme,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const RepresentationsOverview = () => {
  const theme = useTheme();
  const [representations, setRepresentations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepresentations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/representations", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const reps = data._embedded?.representations || data.representations || [];

      // Sort by creation date (newest first)
      const sortedReps = [...reps].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      setRepresentations(sortedReps);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepresentations();
  }, []);

  const handleShowMore = () => setVisibleCount((prev) => prev + 4);
  const handleRefresh = () => {
    fetchRepresentations();
    setVisibleCount(4);
    setSearch("");
  };

  // Filter representations by title (case-insensitive)
  const filteredReps = representations.filter((rep) =>
    rep.title?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleReps = filteredReps.slice(0, visibleCount);

  return (
    <Box
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Representations Overview
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
        Here you can see all available representations. They are shown from new to old.  
        Use the search bar to filter by title.
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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* No results */}
      {!loading && !error && filteredReps.length === 0 && (
        <Typography mt={2}>No representations found.</Typography>
      )}

      {/* Representations grid */}
      {!loading && !error && filteredReps.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleReps.map((rep, index) => {
              const repId = rep._links?.self?.href?.split("/").pop() || `Unknown-${index}`;
              return (
                <Box
                  key={repId}
                  sx={{
                    flex: "1 1 calc(33.33% - 16px)",
                    minWidth: 250,
                    maxWidth: "100%",
                  }}
                >
                  <Card
                    sx={{
                      minHeight: 220,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {rep.title || "Untitled Representation"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        {rep.description || "No description provided."}
                      </Typography>

                      <Typography variant="caption" display="block" mt={1}>
                        Representation ID: {repId}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Language: {rep.language?.split("/").pop()?.toUpperCase() || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Media Type: {rep.mediaType || "Unknown"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Created:{" "}
                        {rep.creationDate
                          ? new Date(rep.creationDate).toLocaleDateString()
                          : "N/A"}
                      </Typography>

                      {rep.remoteId && (
                        <Chip
                          label={`Remote ID: ${rep.remoteId}`}
                          size="small"
                          sx={{
                            mt: 1,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {visibleCount < filteredReps.length && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button variant="contained" color="primary" onClick={handleShowMore}>
                Show more representations
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default RepresentationsOverview;
