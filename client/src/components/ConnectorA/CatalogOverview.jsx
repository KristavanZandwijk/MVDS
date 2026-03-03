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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const CatalogOverview = () => {
  const theme = useTheme();
  const [catalogs, setCatalogs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCatalogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/catalogs");
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      const catalogsArray = data._embedded?.catalogs || [];

      const sortedCatalogs = [...catalogsArray].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      setCatalogs(sortedCatalogs);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const extractId = (url) => url?.split("/").pop() || "N/A";

  const handleShowMore = () => setVisibleCount((prev) => prev + 4);

  const handleRefresh = () => {
    fetchCatalogs();
    setVisibleCount(4);
    setSearch("");
  };

  // Filter catalogs by description
  const filteredCatalogs = catalogs.filter((c) =>
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleCatalogs = filteredCatalogs.slice(0, visibleCount);

  return (
    <Box
      flex={1}
      p="1.5rem"
      borderRadius="1rem"
      bgcolor={theme.palette.background.alt}
      sx={{ boxShadow: 3, minHeight: "400px" }}
    >
      {/* Header with search & refresh */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]}>
          Catalog Overview
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
        This shows an overview of the catalogs linked to your connectors.
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{error}</Typography>}

      {!loading && !error && filteredCatalogs.length === 0 && (
        <Typography>No catalogs found.</Typography>
      )}

      {!loading && !error && filteredCatalogs.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleCatalogs.map((catalog, index) => {
              const catalogId = extractId(catalog._links?.self?.href);
              const offerTemplate =
                catalog._links?.offers?.href?.replace("{?page,size}", "") || "N/A";

              return (
                <Box
                  key={catalog._links?.self?.href || index}
                  sx={{
                    flex: "1 1 calc(33.33% - 16px)",
                    minWidth: 280,
                    maxWidth: "100%",
                  }}
                >
                  <Card
                    sx={{
                      minHeight: 250,
                      borderRadius: 3,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      backgroundColor: theme.palette.background.alt,
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0px 8px 20px ${theme.palette.primary[800]}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={theme.palette.secondary[100]}
                        gutterBottom
                      >
                        {catalog.title || `Catalog #${index + 1}`}
                      </Typography>

                      <Typography
                        variant="body1"
                        color={theme.palette.secondary.main}
                        gutterBottom
                      >
                        {catalog.description || "No description provided."}
                      </Typography>

                      <Box mt={1}>
                        <Typography variant="body2" color={theme.palette.neutral[100]}>
                          <strong>Catalog ID:</strong> {catalogId}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.neutral[100]}>
                          <strong>Offer ID template:</strong> {offerTemplate}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.neutral[100]}>
                          <strong>Created:</strong>{" "}
                          {catalog.creationDate
                            ? new Date(catalog.creationDate).toLocaleString()
                            : "N/A"}
                        </Typography>
                        <Typography variant="body2" color={theme.palette.neutral[100]}>
                          <strong>Modified:</strong>{" "}
                          {catalog.modificationDate
                            ? new Date(catalog.modificationDate).toLocaleString()
                            : "N/A"}
                        </Typography>
                      </Box>

                      {catalog._links?.self?.href && (
                        <Typography mt={2}>
                          <a
                            href={catalog._links.self.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: theme.palette.secondary.main,
                              textDecoration: "none",
                            }}
                          >
                            Open Catalog URL
                          </a>
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {visibleCount < filteredCatalogs.length && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button variant="contained" color="primary" onClick={handleShowMore}>
                Show more catalogs
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default CatalogOverview;
