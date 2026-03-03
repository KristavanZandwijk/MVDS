import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  IconButton,
  Alert,
  Divider,
  useTheme,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

const CreateNewArtifact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    value: "",
    automatedDownload: false,
    accessUrl: "",
    username: "",
    password: "",
  });

  const [customFields, setCustomFields] = useState([]);
  const [customKey, setCustomKey] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [isRemote, setIsRemote] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!formData.title.trim() || !formData.description.trim()) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields: title and description.",
      });
      return;
    }

    if (!isRemote && !formData.value.trim()) {
      setStatus({
        type: "error",
        message: "For local data, please provide a value.",
      });
      return;
    }

    if (isRemote && !formData.accessUrl.trim()) {
      setStatus({
        type: "error",
        message: "For remote data, please provide an access URL.",
      });
      return;
    }

    setLoading(true);

    try {
      const body = {
        title: formData.title,
        description: formData.description,
        automatedDownload: formData.automatedDownload,
      };

      // Add local or remote data
      if (isRemote) {
        body.accessUrl = formData.accessUrl;
        if (formData.username || formData.password) {
          body.username = formData.username;
          body.password = formData.password;
        }
      } else {
        body.value = formData.value;
      }

      // Include custom fields
      customFields.forEach(({ key, value }) => {
        if (key.trim()) body[key] = value;
      });

      const response = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Artifact created successfully!" });
      setFormData({
        title: "",
        description: "",
        value: "",
        automatedDownload: false,
        accessUrl: "",
        username: "",
        password: "",
      });
      setCustomFields([]);
      setIsRemote(false);
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
    >
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Create New Artifact
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Create a new artifact — either with local data or remote data from an API.
      </Typography>

      {/* Title & Description */}
      <TextField
        fullWidth
        label="Title *"
        name="title"
        value={formData.title}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Description *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        minRows={3}
        sx={{ mb: 3 }}
      />

      {/* Toggle Local vs Remote */}
      <FormControlLabel
        control={
          <Switch
            checked={isRemote}
            onChange={() => setIsRemote(!isRemote)}
            color="primary"
          />
        }
        label={isRemote ? "Remote Data (accessUrl)" : "Local Data (value)"}
        sx={{ mb: 2 }}
      />

      {/* Conditional Fields */}
      {isRemote ? (
        <>
          <TextField
            fullWidth
            label="Access URL *"
            name="accessUrl"
            value={formData.accessUrl}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Username (optional)"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="Password (optional)"
            name="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
        </>
      ) : (
        <TextField
        fullWidth
        label="Local Data (JSON Format) *"
        name="value"
        value={formData.value}
        onChange={handleChange}
        placeholder={`{\n  "value": "Hello World"\n}`}
        multiline
        minRows={6}
        sx={{ mb: 1 }}
        helperText="Provide your local data in valid JSON format."
      />

      )}

      {/* Automated Download */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.automatedDownload}
            onChange={handleChange}
            name="automatedDownload"
            color="primary"
          />
        }
        label="Enable Automated Download"
      />

      {customFields.map((pair, index) => (
        <Box
          key={index}
          display="flex"
          gap={1}
          alignItems="center"
          mb={1.5}
          pl={1}
        >
          <TextField
            label="Key"
            value={pair.key}
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Value"
            value={pair.value}
            InputProps={{ readOnly: true }}
            sx={{ flex: 1 }}
          />
          <IconButton color="error" onClick={() => handleRemoveCustomField(index)}>
            <Delete />
          </IconButton>
        </Box>
      ))}

      {/* Submit Button */}
      <Box mt={4}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          size="large"
        >
          {loading ? "Creating..." : "Create Artifact"}
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

export default CreateNewArtifact;
