import React, { useState } from "react";
import { Box, Button, Typography, TextField, MenuItem, Paper } from "@mui/material";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const ApiRequestPanel = ({ title, defaultMethod, defaultEndpoint, defaultBody }) => {
  const [method, setMethod] = useState(defaultMethod || "GET");
  const [endpoint, setEndpoint] = useState(defaultEndpoint || "");
  const [body, setBody] = useState(defaultBody || "");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const options = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method !== "GET" && body) {
        options.body = body;
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResponse(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: "1rem" }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        {title}
      </Typography>

      {/* Method & Endpoint */}
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={2}>
        <TextField
          select
          label="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {METHODS.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Endpoint"
          fullWidth
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />
      </Box>

      {/* Body */}
      {method !== "GET" && (
        <TextField
          label="Request Body"
          multiline
          minRows={6}
          fullWidth
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ mb: 2 }}
        />
      )}

      {/* Send Button */}
      <Button
        variant="contained"
        onClick={handleSend}
        disabled={loading || !endpoint}
        sx={{ mb: 2 }}
      >
        {loading ? "Sending..." : "Send Request"}
      </Button>

      {/* Response / Error */}
      {response && (
        <Box
          sx={{
            bgcolor: "#1e1e1e",
            color: "#fff",
            p: 2,
            borderRadius: "0.75rem",
            fontFamily: "monospace",
            overflowX: "auto",
            mb: 2,
          }}
        >
          <Typography variant="body2">{JSON.stringify(response, null, 2)}</Typography>
        </Box>
      )}

      {error && (
        <Box
          sx={{
            bgcolor: "#ffebeb",
            color: "#900",
            p: 2,
            borderRadius: "0.75rem",
            fontFamily: "monospace",
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ApiRequestPanel;
