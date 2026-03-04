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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const OfferOverview = () => {
  const theme = useTheme();

  const [offers, setOffers] = useState([]);
  const [offerStatus, setOfferStatus] = useState({});
  const [visibleCount, setVisibleCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const [checkingCompleteness, setCheckingCompleteness] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // --- Fetch offers ---
  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/offers", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Error fetching offers: ${response.status}`);
      const data = await response.json();
      const resources = data._embedded?.resources || [];
      const sorted = [...resources].sort(
        (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
      );
      setOffers(sorted);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Check completeness for each offer ---
  const checkOfferCompleteness = async (offersList) => {
    setCheckingCompleteness(true);
    const results = {};

    for (const offer of offersList) {
      const offerId = offer._links.self.href.split("/").pop();
      const status = { complete: false, missing: [] };

      try {
        // Representations
        const repResp = await fetch(`/api/offers/${offerId}/representations`);
        const repData = await repResp.json();
        const reps = repData._embedded?.representations || [];
        if (reps.length === 0) status.missing.push("No linked representation");

        // Artifacts
        let hasArtifact = false;
        for (const rep of reps) {
          const repId = rep._links.self.href.split("/").pop();
          const artResp = await fetch(`/api/representations/${repId}/artifacts`);
          const artData = await artResp.json();
          if ((artData._embedded?.artifacts || []).length > 0) {
            hasArtifact = true;
            break;
          }
        }
        if (!hasArtifact) status.missing.push("No representation with artifact");

        // Contracts
        const contractResp = await fetch(`/api/offers/${offerId}/contracts`);
        const contractData = await contractResp.json();
        const contracts = contractData._embedded?.contracts || [];
        if (contracts.length === 0) status.missing.push("No linked contract");

        // Rules
        let hasRule = false;
        for (const contract of contracts) {
          const contractId = contract._links.self.href.split("/").pop();
          const rulesResp = await fetch(`/api/contracts/${contractId}/rules`);
          const rulesData = await rulesResp.json();
          if ((rulesData._embedded?.rules || []).length > 0) {
            hasRule = true;
            break;
          }
        }
        if (!hasRule) status.missing.push("No contract with rule");

        // Final status
        status.complete = status.missing.length === 0;
      } catch (err) {
        console.error(`Error checking offer ${offerId}:`, err);
        status.missing.push("Error checking completeness");
      }

      results[offerId] = status;
    }

    setOfferStatus(results);
    setCheckingCompleteness(false);
  };

  useEffect(() => {
    const load = async () => {
      await fetchOffers();
    };
    load();
  }, []);

  // When offers are fetched, check completeness
  useEffect(() => {
    if (offers.length > 0) checkOfferCompleteness(offers);
  }, [offers]);

  const handleShowMore = () => setVisibleCount((prev) => prev + 5);
  const handleRefresh = async () => {
    await fetchOffers();
    setVisibleCount(10);
    setSearch("");
  };

  const excludedKeywords = ["dwd", "test", "incomplete", "dsc", ""];

const filteredOffers = offers
  // 1️⃣ Remove offers with no keywords
  .filter((offer) => Array.isArray(offer.keywords) && offer.keywords.length > 0)

  // 2️⃣ Remove offers containing excluded keywords (case-insensitive)
  .filter((offer) =>
    !offer.keywords.some((kw) =>
      excludedKeywords.includes(kw.toLowerCase())
    )
  )

  // 3️⃣ Apply search filter (if search is entered)
  .filter((offer) =>
    search
      ? offer.keywords.some((kw) =>
          kw.toLowerCase().includes(search.toLowerCase())
        )
      : true
  );

  const visibleOffers = filteredOffers.slice(0, visibleCount);

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
          Offer Overview
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading || checkingCompleteness}
        >
          Refresh
        </Button>
      </Box>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Here you can see the offers made by your connector. Complete offers are marked in <strong style={{ color: "green" }}>green</strong>, incomplete in <strong style={{ color: "red" }}>red</strong>. When offers are incomplete, the missing requirements are listed at the end of the offer overview.
      </Typography>

      {/* Search bar */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          label="Search by keyword"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Loading */}
      {(loading || checkingCompleteness) && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="secondary"/>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {/* No offers */}
      {!loading && !error && filteredOffers.length === 0 && (
        <Typography mt={2}>No offers found.</Typography>
      )}

      {/* Offers grid */}
      {!loading && !error && filteredOffers.length > 0 && (
        <>
          <Box display="flex" flexWrap="wrap" gap={3} mt={2}>
            {visibleOffers.map((offer, index) => {
              const offerId = offer._links.self.href.split("/").pop();
              const status = offerStatus[offerId];

              return (
                <Box
                  key={index}
                  sx={{
                    flex: "1 1 calc(33.33% - 16px)",
                    minWidth: 180,
                    maxWidth: "100%",
                  }}
                >
                  <Card
                    sx={{
                      minHeight: 260,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
                      borderLeft: status
                        ? status.complete
                          ? "5px solid #4caf50"
                          : "5px solid #f44336"
                        : "none",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {offer.title || `Offer #${index + 1}`}
                      </Typography>

                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {offer.description || "No description provided."}
                      </Typography>

                      {offer.keywords?.length > 0 && (
                        <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                          {offer.keywords.map((kw, i) => (
                            <Chip
                              key={i}
                              label={kw}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      <Typography variant="caption" display="block" mt={1}>
                        Publisher: {offer.publisher || "Unknown"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Language: {offer.language || "N/A"}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Created:{" "}
                        {offer.creationDate
                          ? new Date(offer.creationDate).toLocaleDateString()
                          : "N/A"}
                      </Typography>

                      {/* Completeness info */}
                      {status && (
                        <Box mt={2}>
                          {status.complete ? (
                            <Chip
                              label="✅ Complete"
                              color="success"
                              sx={{ fontWeight: "bold" }}
                            />
                          ) : (
                            <Box>
                              <Chip
                                label="Incomplete"
                                color="error"
                                sx={{ fontWeight: "bold", mb: 1 }}
                              />
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                color="error.main"
                              >
                                Missing:
                              </Typography>
                              <ul style={{ marginTop: 0, marginBottom: 0 }}>
                                {status.missing.map((m, i) => (
                                  <li key={i}>
                                    <Typography variant="body2" color="error.main">
                                      {m}
                                    </Typography>
                                  </li>
                                ))}
                              </ul>
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>

          {visibleCount < filteredOffers.length && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Button variant="contained" color="primary" onClick={handleShowMore}>
                Show more offers
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default OfferOverview;
