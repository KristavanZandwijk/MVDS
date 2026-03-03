import React, { useState } from "react";
import { Box, TextField, Typography, Button, Alert, useTheme } from "@mui/material";

const CreateNewContract = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "https://connectora:8080/", // prefilled
    start: "",
    end: "",
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

  if (!formData.title || !formData.description || !formData.provider || !formData.start || !formData.end) {
    setStatus({ type: "error", message: "All fields are required." });
    return;
  }

  setLoading(true);

  try {
    const body = {
      title: formData.title,
      description: formData.description,
      provider: formData.provider,
      start: new Date(formData.start).toISOString(), // convert to ISO with milliseconds + Z
      end: new Date(formData.end).toISOString(),
    };

    const response = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Error ${response.status}`);
    }

    setStatus({ type: "success", message: "Contract created successfully!" });
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
        Create New Contract
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Fill in the details to create a new contract.
      </Typography>

      {/* Title */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Title *"
          placeholder="Enter contract title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </Box>

      {/* Description */}
      <Box mb={2}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description *"
          placeholder="Enter contract description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Box>

      {/* Provider URL */}
      <Box mb={2}>
        <TextField
          fullWidth
          label="Provider URL *"
          name="provider"
          value={formData.provider} // prefilled text
          onChange={handleChange}
        />
      </Box>

      {/* Start Date */}
      <Box mb={2}>
        <TextField
          fullWidth
          type="datetime-local"
          label="Start Date *"
          placeholder="Select start date"
          name="start"
          value={formData.start}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* End Date */}
      <Box mb={2}>
        <TextField
          fullWidth
          type="datetime-local"
          label="End Date *"
          placeholder="Select end date"
          name="end"
          value={formData.end}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
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
          {loading ? "Creating Contract..." : "Create Contract"}
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

export default CreateNewContract;
