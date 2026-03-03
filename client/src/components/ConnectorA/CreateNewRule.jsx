import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  useTheme,
} from "@mui/material";

const CreateNewRule = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: JSON.stringify(
      {
        "@context": {
          ids: "https://w3id.org/idsa/core/",
          idsc: "https://w3id.org/idsa/code/",
        },
        "@type": "ids:Permission",
        "@id": "https://w3id.org/idsa/autogen/permission/51f5f7e4-f97f-4f91-bc57-b243714642be",
        "ids:description": [
          {
            "@value": "Usage policy provide access applied",
            "@type": "http://www.w3.org/2001/XMLSchema#string",
          },
        ],
        "ids:title": [
          {
            "@value": "Example Usage Policy",
            "@type": "http://www.w3.org/2001/XMLSchema#string",
          },
        ],
        "ids:action": [{ "@id": "https://w3id.org/idsa/code/USE" }],
      },
      null,
      2
    ),
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.title.trim() || !formData.description.trim() || !formData.value.trim()) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Rule created successfully!" });
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
      sx={{ boxShadow: 3 }}
    >
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create New Rule
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Fill in the fields below to create a new rule. You can edit the policy JSON freely.
      </Typography>

      {/* Title */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter rule title"
        />
      </Box>

      {/* Description */}
      <Box mb={2}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description *"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter rule description"
        />
      </Box>

      {/* Policy Value */}
      <Box mb={2}>
        <TextField
          fullWidth
          multiline
          minRows={8}
          label="Policy Value (JSON) *"
          name="value"
          value={formData.value}
          onChange={handleChange}
          sx={{ fontFamily: "monospace" }}
        />
      </Box>

      {/* Submit */}
      <Box mt={3}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Creating Rule..." : "Create Rule"}
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

export default CreateNewRule;
