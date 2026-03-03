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

const LinkOfferToCatalog = () => {
  const theme = useTheme();

  const [offers, setOffers] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [catalogOffers, setCatalogOffers] = useState([]);

  // Fetch all offers and catalogs
  useEffect(() => {
    fetchOffersAndCatalogs();
  }, []);

  const fetchOffersAndCatalogs = async () => {
    setFetching(true);
    try {
      const offersResp = await fetch("/api/offers");
      if (!offersResp.ok) throw new Error(`Error fetching offers: ${offersResp.status}`);
      const offersData = await offersResp.json();
      const offersArray = offersData._embedded?.resources || [];
      setOffers(offersArray);

      const catalogsResp = await fetch("/api/catalogs");
      if (!catalogsResp.ok) throw new Error(`Error fetching catalogs: ${catalogsResp.status}`);
      const catalogsData = await catalogsResp.json();
      const catalogsArray = catalogsData._embedded?.catalogs || [];
      setCatalogs(catalogsArray);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    } finally {
      setFetching(false);
    }
  };

  // Fetch offers in a specific catalog
  const fetchCatalogOffers = async (catalogId) => {
    if (!catalogId) return;
    try {
      const resp = await fetch(`/api/catalogs/${catalogId}/offers`);
      if (!resp.ok) throw new Error(`Error fetching catalog offers: ${resp.status}`);
      const data = await resp.json();
      setCatalogOffers(data._embedded?.resources || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleCatalogChange = (e) => {
    const catalogId = e.target.value;
    setSelectedCatalog(catalogId);
    fetchCatalogOffers(catalogId);
  };

  const handleSubmit = async () => {
    if (!selectedOffer || !selectedCatalog) {
      setStatus({ type: "error", message: "Please select both an offer and a catalog." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const catalogId = selectedCatalog;
      const offerUrl = selectedOffer;

      const response = await fetch(`/api/catalogs/${catalogId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([offerUrl]),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Offer linked to catalog successfully!" });
      setSelectedOffer("");
      // Refresh catalog offers
      fetchCatalogOffers(catalogId);
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
        Link Offer to Catalog
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Here you can link the offer to the catalog. If you only want to see which offers are linked to the catalog,
        without linking any new offers, just select a catalog. The system will then display all offers already linked to it.
      </Typography>

      {fetching ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Select Offer */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="offer-select-label">Select Offer</InputLabel>
            <Select
              labelId="offer-select-label"
              value={selectedOffer}
              label="Select Offer"
              onChange={(e) => setSelectedOffer(e.target.value)}
            >
              {offers.map((offer) => {
                const offerId = offer._links.self.href.split("/").pop();
                return (
                  <MenuItem key={offer._links.self.href} value={offer._links.self.href}>
                    {offer.title ? `${offer.title} (ID: ${offerId})` : offerId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Select Catalog */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="catalog-select-label">Select Catalog</InputLabel>
            <Select
              labelId="catalog-select-label"
              value={selectedCatalog}
              label="Select Catalog"
              onChange={handleCatalogChange}
            >
              {catalogs.map((catalog) => {
                const catalogId = catalog._links.self.href.split("/").pop();
                return (
                  <MenuItem key={catalog._links.self.href} value={catalogId}>
                    {catalog.title ? `${catalog.title} (ID: ${catalogId})` : catalogId}
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
            {loading ? "Linking..." : "Link Offer to Catalog"}
          </Button>

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* Display catalog offers */}
          {selectedCatalog && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Offers in this Catalog
              </Typography>

              {catalogOffers.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {catalogOffers.map((offer, index) => (
                    <Card key={offer._links.self.href} sx={{ width: 300, p: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {offer.title || `Offer #${index + 1}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {offer.description || "No description"}
                        </Typography>
                        {offer.keywords?.length > 0 && (
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                            {offer.keywords.map((kw, i) => (
                              <Chip key={i} label={kw} size="small" />
                            ))}
                          </Box>
                        )}
                        <Typography variant="caption" display="block" mt={1}>
                          Publisher: {offer.publisher || "Unknown"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Created: {offer.creationDate ? new Date(offer.creationDate).toLocaleDateString() : "N/A"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Language: {offer.language || "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  There are no offers linked to this catalog yet.
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LinkOfferToCatalog;
