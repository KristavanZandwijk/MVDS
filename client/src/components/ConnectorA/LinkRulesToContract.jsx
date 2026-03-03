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
  OutlinedInput,
  Chip,
  Card,
  CardContent,
  useTheme,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";


const LinkRulesToContract = () => {
  const theme = useTheme();

  const [contracts, setContracts] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [selectedRules, setSelectedRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [contractRules, setContractRules] = useState([]);

  useEffect(() => {
    fetchContractsAndRules();
  }, []);

  const fetchContractsAndRules = async () => {
    setFetching(true);
    try {
      const contractsResp = await fetch("/api/contracts");
      if (!contractsResp.ok) throw new Error(`Error fetching contracts: ${contractsResp.status}`);
      const contractsData = await contractsResp.json();
      setContracts(contractsData._embedded?.contracts || []);

      const rulesResp = await fetch("/api/rules");
      if (!rulesResp.ok) throw new Error(`Error fetching rules: ${rulesResp.status}`);
      const rulesData = await rulesResp.json();
      setRules(rulesData._embedded?.rules || []);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setFetching(false);
    }
  };

  const fetchContractRules = async (contractId) => {
    if (!contractId) return;
    try {
      const resp = await fetch(`/api/contracts/${contractId}/rules`);
      if (!resp.ok) throw new Error(`Error fetching rules for contract: ${resp.status}`);
      const data = await resp.json();
      setContractRules(data._embedded?.rules || []);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleContractChange = (e) => {
    const contractId = e.target.value;
    setSelectedContract(contractId);
    fetchContractRules(contractId);
    setSelectedRules([]);
  };

  const handleAddRule = (ruleUrl) => {
    if (!selectedRules.includes(ruleUrl)) {
      setSelectedRules(prev => [...prev, ruleUrl]);
    }
  };

  const handleDeleteRule = (ruleUrl) => {
    setSelectedRules(prev => prev.filter(r => r !== ruleUrl));
  };

  const handleSubmit = async () => {
    if (!selectedContract || selectedRules.length === 0) {
      setStatus({ type: "error", message: "Please select a contract and at least one rule." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch(`/api/contracts/${selectedContract}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRules),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Rules linked to contract successfully!" });
      setSelectedRules([]);
      fetchContractRules(selectedContract);
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
        Link Rule(s) to Contract
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Select a contract and one or more rules to link. You can also view all rules already linked to the contract.
      </Typography>

      {fetching ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Select Contract */}
          <FormControl fullWidth sx={{ mb: 3, backgroundColor: theme.palette.background.alt }}>
            <InputLabel id="contract-select-label">Select Contract</InputLabel>
            <Select
              labelId="contract-select-label"
              value={selectedContract}
              label="Select Contract"
              onChange={handleContractChange}
              sx={{ color: "black" }}
            >
              {contracts.map(contract => {
                const contractId = contract._links.self.href.split("/").pop();
                return (
                  <MenuItem key={contract._links.self.href} value={contractId}>
                    {contract.title ? `${contract.title} (Contract ID: ${contractId})` : contractId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Rule Dropdown */}
          <FormControl fullWidth sx={{ mb: 2, backgroundColor: theme.palette.background.alt }}>
            <InputLabel id="rules-select-label">Select Rule</InputLabel>
            <Select
              labelId="rules-select-label"
              value=""
              onChange={(e) => handleAddRule(e.target.value)}
              input={<OutlinedInput label="Select Rule" />}
              sx={{ color: "black" }}
            >
              {rules.map(rule => {
                const ruleUrl = rule._links.self.href;
                const ruleId = ruleUrl.split("/").pop();
                return (
                  <MenuItem key={ruleUrl} value={ruleUrl} disabled={selectedRules.includes(ruleUrl)}>
                    {rule.title ? `${rule.title} (Rule ID: ${ruleId})` : ruleId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Selected Rules */}
            {selectedRules.length > 0 && (
            <Box mb={3} display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                Selected Rules
                </Typography>
                {selectedRules.map(url => {
                const rule = rules.find(r => r._links.self.href === url);
                const ruleId = url.split("/").pop();
                return (
                    <Box key={url} display="flex" alignItems="center" gap={1}>
                    <Chip
                    label={rule?.title || `Rule ID: ${ruleId}`}
                    variant="outlined"
                    sx={{
                        borderColor: theme.palette.grey[700], // Border same color as dropdown text
                        color: theme.palette.grey[700],       // Text color same as border
                        backgroundColor: theme.palette.background.alt, // Match box background
                        flexGrow: 1,
                    }}
                    />


                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteRule(url)}
                    >
                        <Delete />
                    </IconButton>
                    </Box>
                );
                })}
            </Box>
            )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Linking Rules..." : "Link Rules to Contract"}
          </Button>

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* Display linked rules */}
            {/* Display linked rules */}
            {selectedContract && (
            <Box mt={4}>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                Rules linked to this Contract
                </Typography>

                {contractRules.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3}>
                    {contractRules.map((rule, index) => {
                    const ruleId = rule._links.self.href.split("/").pop();
                    return (
                        <Card key={rule._links.self.href} sx={{ width: 300, p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {rule.title || `Rule #${index + 1}`}
                            </Typography>
                            <Typography variant="caption" display="block" gutterBottom>
                            Rule ID: {ruleId}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                            {rule.description || "No description"}
                            </Typography>
                            <Typography variant="caption" display="block">
                            Created: {rule.creationDate ? new Date(rule.creationDate).toLocaleString() : "N/A"}
                            </Typography>
                        </CardContent>
                        </Card>
                    );
                    })}
                </Box>
                ) : (
                <Typography color="textSecondary">
                    No rules are linked to this contract yet.
                </Typography>
                )}
            </Box>
            )}

        </>
      )}
    </Box>
  );
};

export default LinkRulesToContract;
