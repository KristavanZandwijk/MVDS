import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Alert,
  Divider,
  useTheme,
} from "@mui/material";

const requiredFields = ["title", "description"];

const CreateNewCatalog = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const missingFields = requiredFields.filter((field) => !formData[field].trim());
    if (missingFields.length > 0) {
      setStatus({
        type: "error",
        message: `Please fill in all required fields: ${missingFields.join(", ")}`,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Catalog created successfully!" });
      setFormData({ title: "", description: "" });
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
      sx={{ boxShadow: 3, minHeight: "400px" }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[100]} mb={2}>
        Create New Catalog
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Fill in the required fields to create a new catalog.
      </Typography>

      <Box mb={2}>
        <TextField
          fullWidth
          name="title"
          label="Title *"
          value={formData.title}
          onChange={handleChange}
          error={!formData.title.trim() && status.type === "error"}
        />
      </Box>

      <Box mb={2}>
        <TextField
          fullWidth
          name="description"
          label="Description *"
          multiline
          minRows={3}
          value={formData.description}
          onChange={handleChange}
          error={!formData.description.trim() && status.type === "error"}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
        {loading ? "Creating..." : "Create Catalog"}
      </Button>

      {status.message && <Alert severity={status.type} sx={{ mt: 3 }}>{status.message}</Alert>}
    </Box>
  );
};

export default CreateNewCatalog;
