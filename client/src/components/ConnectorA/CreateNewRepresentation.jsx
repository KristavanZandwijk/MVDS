import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
  useTheme,
} from "@mui/material";

const mediaTypes = ["application/json", "application/xml", "text/plain"];
const languages = [
  { label: "English", value: "https://w3id.org/idsa/code/EN" },
  { label: "German", value: "https://w3id.org/idsa/code/DE" },
  { label: "French", value: "https://w3id.org/idsa/code/FR" },
  { label: "Dutch", value: "https://w3id.org/idsa/code/NL" },
];

const CreateNewRepresentation = () => {
  const theme = useTheme();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaType: "",
    language: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validate required fields
    const missing = Object.entries(formData)
      .filter(([_, v]) => !v.trim())
      .map(([k]) => k);

    if (missing.length > 0) {
      setStatus({
        type: "error",
        message: `Please fill in all required fields: ${missing.join(", ")}`,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/representations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Representation created successfully!" });
      setFormData({
        title: "",
        description: "",
        mediaType: "",
        language: "",
      });
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
      sx={{ boxShadow: 3 }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create New Representation
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={3}>
        Fill in all required fields to create a new representation.
      </Typography>

      {/* Title */}
      <Box mb={2}>
        <TextField
          fullWidth
          required
          name="title"
          label="Title *"
          value={formData.title}
          onChange={handleChange}
        />
      </Box>

      {/* Description */}
      <Box mb={2}>
        <TextField
          fullWidth
          required
          name="description"
          label="Description *"
          value={formData.description}
          onChange={handleChange}
          multiline
          minRows={3}
        />
      </Box>

      {/* Media Type */}
      <Box mb={2}>
        <TextField
          select
          fullWidth
          required
          name="mediaType"
          label="Media Type *"
          value={formData.mediaType}
          onChange={handleChange}
        >
          {mediaTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Language */}
      <Box mb={3}>
        <TextField
          select
          fullWidth
          required
          name="language"
          label="Language *"
          value={formData.language}
          onChange={handleChange}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.value} value={lang.value}>
              {lang.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Submit Button */}
      <Box mt={3}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Representation"}
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

export default CreateNewRepresentation;
