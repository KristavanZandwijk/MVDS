import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Chip,
  MenuItem,
  IconButton,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

const paymentOptions = ["undefined", "free", "fixedPrice", "negotiationBasis"];

const requiredFields = [
  "title",
  "description",
  "keywords",
  "publisher",
  "sovereign",
  "language",
];

const CreateNewOffer = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: [],
    keywordInput: "",
    publisher: "",
    language: "EN",
    license: "",
    sovereign: "",
    endpointDocumentation: "",
    paymentModality: "undefined",
    samples: "",
  });

  const [customFields, setCustomFields] = useState([]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddKeyword = () => {
    const kw = formData.keywordInput.trim();
    if (kw && !formData.keywords.includes(kw)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, kw],
        keywordInput: "",
      }));
    }
  };

  const handleDeleteKeyword = kw => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== kw),
    }));
  };

  const handleAddCustomField = () => {
    const key = customKey.trim();
    const value = customValue.trim();
    if (key && value) {
      setCustomFields([...customFields, { key, value }]);
      setCustomKey("");
      setCustomValue("");
    }
  };

  const handleRemoveCustomField = index => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const missingFields = requiredFields.filter(field => {
      if (field === "keywords") return formData.keywords.length === 0;
      return !formData[field].trim();
    });

    if (missingFields.length > 0) {
      setStatus({
        type: "error",
        message: `Please fill in all required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    setLoading(true);

    const { keywordInput, samples, ...rest } = formData;
    const body = { ...rest, keywords: formData.keywords };

    if (samples.trim()) {
      body.samples = samples.split(",").map(s => s.trim());
    }

    customFields.forEach(({ key, value }) => {
      if (key.trim()) body[key] = value;
    });

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Offer created successfully!" });
      setFormData({
        title: "",
        description: "",
        keywords: [],
        keywordInput: "",
        publisher: "",
        language: "EN",
        license: "",
        sovereign: "",
        endpointDocumentation: "",
        paymentModality: "undefined",
        samples: "",
      });
      setCustomFields([]);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      flex={1}
      p="1.5rem"
      borderRadius="1rem"
      bgcolor={theme.palette.background.alt}
      sx={{ boxShadow: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create New Offer
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Fill in the details to create a new offer.
      </Typography>

      {/* Basic Fields */}
      {[
        { name: "title", label: "Title", multiline: false },
        { name: "description", label: "Description", multiline: true },
        { name: "publisher", label: "Publisher", multiline: false },
        { name: "language", label: "Language", multiline: false },
        { name: "license", label: "License", multiline: false },
        { name: "sovereign", label: "Sovereign", multiline: false },
        { name: "endpointDocumentation", label: "Endpoint Documentation", multiline: true },
        { name: "samples", label: "Sample Resource URIs (comma-separated)", multiline: false },
      ].map((field, i) => {
        const isRequired = requiredFields.includes(field.name);
        const value = formData[field.name];
        const hasError = isRequired && (field.name === "keywords" ? formData.keywords.length === 0 : !value.trim());

        return (
          <Box key={i} mb={2}>
            <TextField
              fullWidth
              name={field.name}
              label={field.label + (isRequired ? " *" : "")}
              value={value}
              onChange={handleChange}
              multiline={field.multiline}
              minRows={field.multiline ? 3 : 1}
              error={hasError}
            />
          </Box>
        );
      })}

      {/* Keywords */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
          Keywords *
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Add Keyword"
            name="keywordInput"
            value={formData.keywordInput}
            onChange={handleChange}
            size="small"
            error={formData.keywords.length === 0 && status.type === "error"}
          />
          <Button onClick={handleAddKeyword} variant="contained" startIcon={<AddCircle />}>
            Add
          </Button>
        </Box>
        <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
          {formData.keywords.map(kw => (
            <Chip key={kw} label={kw} onDelete={() => handleDeleteKeyword(kw)} variant="outlined" />
          ))}
        </Box>
      </Box>

      {/* Payment Modality */}
      <Box mb={3}>
        <Typography variant="subtitle1" fontWeight="bold" mb={0.5}>
          Payment Modality
        </Typography>
        <TextField select fullWidth name="paymentModality" label="Payment Modality" value={formData.paymentModality} onChange={handleChange}>
          {paymentOptions.map(opt => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Custom Attributes */}
      <Typography variant="h6" mb={1}>
        Custom Attributes
      </Typography>

      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TextField label="Key" value={customKey} onChange={e => setCustomKey(e.target.value)} sx={{ flex: 1 }} />
        <TextField label="Value" value={customValue} onChange={e => setCustomValue(e.target.value)} sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleAddCustomField} startIcon={<AddCircle />}>
          Add
        </Button>
      </Box>

      {customFields.map((pair, index) => (
        <Box key={index} display="flex" gap={1} alignItems="center" mb={1.5} pl={1}>
          <TextField label="Key" value={pair.key} InputProps={{ readOnly: true }} sx={{ flex: 1 }} />
          <TextField label="Value" value={pair.value} InputProps={{ readOnly: true }} sx={{ flex: 1 }} />
          <IconButton color="error" onClick={() => handleRemoveCustomField(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}

      {/* Submit Button */}
      <Box mt={4}>
        <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth size="large">
          {loading ? "Creating..." : "Create Offer"}
        </Button>
      </Box>

      {status.message && (
        <Alert severity={status.type} sx={{ mt: 3 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
};

export default CreateNewOffer;
