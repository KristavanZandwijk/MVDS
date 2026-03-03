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

const ContractOverview = () => {
  const theme = useTheme();
  const [contracts, setContracts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contracts", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      const resources = data._embedded?.contracts || [];

      // Sort from newest to oldest
      const sortedContracts = [...resources].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      setContracts(sortedContracts);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleShowMore = () => setVisibleCount((prev) => prev + 2);

  const handleRefresh = () => {
    fetchContracts();
    setVisibleCount(6);
    setSearch("");
  };

  const filteredContracts = contracts.filter((contract) =>
    contract.title?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleContracts = filteredContracts.slice(0, visibleCount);

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
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        View all contracts in your connector. Use the search bar to filter by title. Contracts are shown from newest to oldest.
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

      {/* No contracts */}
      {!loading && !error && filteredContracts.length === 0 && (
        <Typography mt={2}>No contracts found.</Typography>
      )}

      {/* Contracts grid */}
      {!loading && !error && filteredContracts.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleContracts.map((contract, index) => (
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
                    minHeight: 180,
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 },
                    borderRadius: "12px",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {contract.title || `Contract #${index + 1}`}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {contract.description || "No description provided."}
                    </Typography>

                    <Box mt={1}>
                      <Typography variant="caption" display="block">
                        <strong>Created:</strong>{" "}
                        {contract.creationDate
                          ? new Date(contract.creationDate).toLocaleString()
                          : "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>Modified:</strong>{" "}
                        {contract.modificationDate
                          ? new Date(contract.modificationDate).toLocaleString()
                          : "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>Start:</strong>{" "}
                        {contract.start ? new Date(contract.start).toLocaleDateString() : "N/A"}
                      </Typography>

                      <Typography variant="caption" display="block">
                        <strong>End:</strong>{" "}
                        {contract.end ? new Date(contract.end).toLocaleDateString() : "N/A"}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {visibleCount < filteredContracts.length && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button variant="contained" color="primary" onClick={handleShowMore}>
                Show more contracts
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ContractOverview;
