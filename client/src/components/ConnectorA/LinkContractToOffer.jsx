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
  useTheme,
} from "@mui/material";

const LinkContractToOffer = () => {
  const theme = useTheme();

  const [offers, setOffers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [offerContracts, setOfferContracts] = useState([]);

  // Fetch offers and contracts
  useEffect(() => {
    fetchOffersAndContracts();
  }, []);

  const fetchOffersAndContracts = async () => {
    setFetching(true);
    try {
      // Fetch offers
      const offersResp = await fetch("/api/offers");
      if (!offersResp.ok) throw new Error(`Error fetching offers: ${offersResp.status}`);
      const offersData = await offersResp.json();
      const offersArray = offersData._embedded?.resources || [];
      setOffers(offersArray);

      // Fetch contracts
      const contractsResp = await fetch("/api/contracts");
      if (!contractsResp.ok) throw new Error(`Error fetching contracts: ${contractsResp.status}`);
      const contractsData = await contractsResp.json();
      const contractsArray = contractsData._embedded?.contracts || [];
      setContracts(contractsArray);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    } finally {
      setFetching(false);
    }
  };

  // Fetch contracts linked to an offer
  const fetchOfferContracts = async (offerId) => {
    if (!offerId) return;
    try {
      const resp = await fetch(`/api/offers/${offerId}/contracts`);
      if (!resp.ok) throw new Error(`Error fetching contracts for offer: ${resp.status}`);
      const data = await resp.json();
      setOfferContracts(data._embedded?.contracts || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleOfferChange = (e) => {
    const offerId = e.target.value;
    setSelectedOffer(offerId);
    setSelectedContract("");
    fetchOfferContracts(offerId);
  };

  const handleSubmit = async () => {
    if (!selectedOffer || !selectedContract) {
      setStatus({ type: "error", message: "Please select both an offer and a contract." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const contractUrl = selectedContract;
      const response = await fetch(`/api/offers/${selectedOffer}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([contractUrl]),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Contract linked to offer successfully!" });
      setSelectedContract("");
      fetchOfferContracts(selectedOffer); // Refresh linked contracts
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
        Link Contract to Offer
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Select an offer and a contract to link. You can also view all contracts already linked to an offer.
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

          {/* Select Contract */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="contract-select-label">Select Contract</InputLabel>
            <Select
              labelId="contract-select-label"
              value={selectedContract}
              label="Select Contract"
              onChange={(e) => setSelectedContract(e.target.value)}
            >
              {contracts.map((contract) => {
                const contractId = contract._links.self.href.split("/").pop();
                return (
                  <MenuItem key={contract._links.self.href} value={contract._links.self.href}>
                    {contract.title ? `${contract.title} (ID: ${contractId})` : contractId}
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
            {loading ? "Linking..." : "Link Contract to Offer"}
          </Button>

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* Display linked contracts */}
          {selectedOffer && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Contracts linked to this Offer
              </Typography>

              {offerContracts.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {offerContracts.map((contract, index) => {
                    const contractId = contract._links.self.href.split("/").pop();
                    return (
                      <Card key={contract._links.self.href} sx={{ width: 300, p: 2 }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {contract.title || `Contract #${index + 1}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {contract.description || "No description"}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Contract ID: {contractId}
                          </Typography>
                          <Typography variant="caption" display="block">
                            Created: {contract.creationDate ? new Date(contract.creationDate).toLocaleString() : "N/A"}
                          </Typography>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  No contracts are linked to this offer yet.
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LinkContractToOffer;
