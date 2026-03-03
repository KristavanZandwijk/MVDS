import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  useTheme,
} from "@mui/material";

const LinkRepresentationToOffer = () => {
  const theme = useTheme();

  const [offers, setOffers] = useState([]);
  const [representations, setRepresentations] = useState([]);
  const [selectedRepresentation, setSelectedRepresentation] = useState("");
  const [selectedOffer, setSelectedOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [offerRepresentations, setOfferRepresentations] = useState([]);

  // Fetch offers and representations on mount
  useEffect(() => {
    fetchOffersAndRepresentations();
  }, []);

  const fetchOffersAndRepresentations = async () => {
    setFetching(true);
    try {
      // Fetch offers
      const offersResp = await fetch("/api/offers");
      if (!offersResp.ok) throw new Error(`Error fetching offers: ${offersResp.status}`);
      const offersData = await offersResp.json();
      const offersArray = offersData._embedded?.resources || [];
      setOffers(offersArray);

      // Fetch representations
      const repsResp = await fetch("/api/representations");
      if (!repsResp.ok) throw new Error(`Error fetching representations: ${repsResp.status}`);
      const repsData = await repsResp.json();
      const repsArray = repsData._embedded?.representations || [];
      setRepresentations(repsArray);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    } finally {
      setFetching(false);
    }
  };

  // Fetch representations linked to a specific offer
  const fetchOfferRepresentations = async (offerId) => {
    if (!offerId) return;
    try {
      const resp = await fetch(`/api/offers/${offerId}/representations`);
      if (!resp.ok) throw new Error(`Error fetching representations for offer: ${resp.status}`);
      const data = await resp.json();
      setOfferRepresentations(data._embedded?.representations || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleOfferChange = (e) => {
    const offerId = e.target.value;
    setSelectedOffer(offerId);
    fetchOfferRepresentations(offerId);
  };

  const handleSubmit = async () => {
    if (!selectedRepresentation || !selectedOffer) {
      setStatus({ type: "error", message: "Please select both a representation and an offer." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const representationUrl = selectedRepresentation;
      const offerId = selectedOffer;

      const response = await fetch(`/api/offers/${offerId}/representations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([representationUrl]),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Representation linked to offer successfully!" });
      setSelectedRepresentation("");
      fetchOfferRepresentations(offerId); // refresh linked representations
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      flex={1}
      p="1.5rem"
      borderRadius="1rem"
      bgcolor={theme.palette.background.alt}
      sx={{ boxShadow: 3, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]} mb={2}>
        Link Representation to Offer
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Select an offer and a representation to link. You can also view all representations already linked to an offer.
      </Typography>

      {fetching ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Select Representation */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="representation-select-label">Select Representation</InputLabel>
            <Select
              labelId="representation-select-label"
              value={selectedRepresentation}
              label="Select Representation"
              onChange={(e) => setSelectedRepresentation(e.target.value)}
            >
              {representations.map((rep) => {
                const repId = rep._links.self.href.split("/").pop();
                return (
                  <MenuItem key={rep._links.self.href} value={rep._links.self.href}>
                    {rep.title ? `${rep.title} (ID: ${repId})` : repId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Select Offer */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="offer-select-label">Select Offer</InputLabel>
            <Select
              labelId="offer-select-label"
              value={selectedOffer}
              label="Select Offer"
              onChange={handleOfferChange}
            >
              {offers.map((offer) => {
                const offerId = offer._links.self.href.split("/").pop();
                return (
                  <MenuItem key={offer._links.self.href} value={offerId}>
                    {offer.title ? `${offer.title} (ID: ${offerId})` : offerId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Linking..." : "Link Representation to Offer"}
          </Button>

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* Display linked representations */}
          {selectedOffer && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Representations linked to this Offer
              </Typography>

              {offerRepresentations.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {offerRepresentations.map((rep, index) => (
                    <Card key={rep._links.self.href} sx={{ width: 300, p: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {rep.title || `Representation #${index + 1}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {rep.description || "No description"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Created: {rep.creationDate ? new Date(rep.creationDate).toLocaleString() : "N/A"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Media Type: {rep.mediaType || "N/A"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Language: {rep.language || "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  There are no representations linked to this offer yet.
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LinkRepresentationToOffer;
