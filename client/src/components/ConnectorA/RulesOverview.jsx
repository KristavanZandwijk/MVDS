import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  TextField,
  Collapse,
  useTheme,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const RulesOverview = () => {
  const theme = useTheme();
  const [rules, setRules] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedRule, setExpandedRule] = useState(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rules", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      const resources = data._embedded?.rules || [];

      // Sort from newest to oldest
      const sortedRules = [...resources].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );

      setRules(sortedRules);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleShowMore = () => setVisibleCount((prev) => prev + 4);

  const handleRefresh = () => {
    fetchRules();
    setVisibleCount(8);
    setSearch("");
  };

  const handleToggleExpand = (ruleId) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const filteredRules = rules.filter((rule) =>
    rule.title?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleRules = filteredRules.slice(0, visibleCount);

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
        Rules Overview
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
      View all rules available in your connector. Click on a rule to see its detailed value.
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

    {/* No rules */}
    {!loading && !error && filteredRules.length === 0 && (
      <Typography mt={2}>No rules found.</Typography>
    )}

    {/* Rules grid */}
    {!loading && !error && filteredRules.length > 0 && (
      <>
        <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
          {visibleRules.map((rule, index) => (
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
                  minHeight: 150,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 },
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onClick={() => handleToggleExpand(rule._links.self.href)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {rule.title || `Rule #${index + 1}`}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {rule.description || "No description provided."}
                  </Typography>

                  <Typography variant="caption" display="block">
                    <strong>Rule ID:</strong> {rule._links.self.href.split("/").pop()}
                  </Typography>

                  <Typography variant="caption" display="block">
                    <strong>Created:</strong>{" "}
                    {rule.creationDate
                      ? new Date(rule.creationDate).toLocaleString()
                      : "N/A"}
                  </Typography>

                  <Typography variant="caption" display="block">
                    <strong>Modified:</strong>{" "}
                    {rule.modificationDate
                      ? new Date(rule.modificationDate).toLocaleString()
                      : "N/A"}
                  </Typography>

                  {/* Expandable value */}
                  <Collapse in={expandedRule === rule._links.self.href} timeout="auto" unmountOnExit>
                    <Box mt={1} sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                      {rule.value || "No value provided."}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {visibleCount < filteredRules.length && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="primary" onClick={handleShowMore}>
              Show more rules
            </Button>
          </Box>
        )}
      </>
    )}
  </Box>
);

};

export default RulesOverview;
