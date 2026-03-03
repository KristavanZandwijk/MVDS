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

const LinkArtifactToRepresentation = () => {
  const theme = useTheme();

  const [artifacts, setArtifacts] = useState([]);
  const [representations, setRepresentations] = useState([]);
  const [selectedArtifact, setSelectedArtifact] = useState("");
  const [selectedRepresentation, setSelectedRepresentation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [representationArtifacts, setRepresentationArtifacts] = useState([]);

  // Fetch artifacts and representations
  useEffect(() => {
    fetchArtifactsAndRepresentations();
  }, []);

  const fetchArtifactsAndRepresentations = async () => {
    setFetching(true);
    try {
      // Fetch artifacts
      const artifactsResp = await fetch("/api/artifacts");
      if (!artifactsResp.ok) throw new Error(`Error fetching artifacts: ${artifactsResp.status}`);
      const artifactsData = await artifactsResp.json();
      const artifactsArray = artifactsData._embedded?.artifacts || [];
      setArtifacts(artifactsArray);

      // Fetch representations
      const repsResp = await fetch("/api/representations");
      if (!repsResp.ok) throw new Error(`Error fetching representations: ${repsResp.status}`);
      const repsData = await repsResp.json();
      const repsArray = repsData._embedded?.representations || [];
      setRepresentations(repsArray);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    } finally {
      setFetching(false);
    }
  };

  // Fetch artifacts linked to a representation
  const fetchRepresentationArtifacts = async (representationId) => {
    if (!representationId) return;
    try {
      const resp = await fetch(`/api/representations/${representationId}/artifacts`);
      if (!resp.ok) throw new Error(`Error fetching artifacts for representation: ${resp.status}`);
      const data = await resp.json();
      setRepresentationArtifacts(data._embedded?.artifacts || []);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: err.message });
    }
  };

  const handleRepresentationChange = (e) => {
    const representationId = e.target.value;
    setSelectedRepresentation(representationId);
    fetchRepresentationArtifacts(representationId);
  };

  const handleSubmit = async () => {
    if (!selectedArtifact || !selectedRepresentation) {
      setStatus({ type: "error", message: "Please select both an artifact and a representation." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const artifactUrl = selectedArtifact;
      const representationId = selectedRepresentation;

      const response = await fetch(`/api/representations/${representationId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([artifactUrl]),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
      }

      setStatus({ type: "success", message: "Artifact linked to representation successfully!" });
      setSelectedArtifact("");
      fetchRepresentationArtifacts(representationId); // refresh linked artifacts
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
        Link Artifact to Representation
      </Typography>

      <Typography variant="body1" color={theme.palette.neutral[200]} mb={2}>
        Select a representation and an artifact to link. You can also view all artifacts already linked to a representation.
      </Typography>

      {fetching ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Select Artifact */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="artifact-select-label">Select Artifact</InputLabel>
            <Select
              labelId="artifact-select-label"
              value={selectedArtifact}
              label="Select Artifact"
              onChange={(e) => setSelectedArtifact(e.target.value)}
            >
              {artifacts.map((artifact) => {
                const artifactId = artifact._links.self.href.split("/").pop();
                return (
                  <MenuItem key={artifact._links.self.href} value={artifact._links.self.href}>
                    {artifact.title ? `${artifact.title} (ID: ${artifactId})` : artifactId}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Select Representation */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="representation-select-label">Select Representation</InputLabel>
            <Select
              labelId="representation-select-label"
              value={selectedRepresentation}
              label="Select Representation"
              onChange={handleRepresentationChange}
            >
              {representations.map((rep) => {
                const repId = rep._links.self.href.split("/").pop();
                return (
                  <MenuItem key={rep._links.self.href} value={repId}>
                    {rep.title ? `${rep.title} (ID: ${repId})` : repId}
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
            {loading ? "Linking..." : "Link Artifact to Representation"}
          </Button>

          {status.message && (
            <Alert severity={status.type} sx={{ mt: 3 }}>
              {status.message}
            </Alert>
          )}

          {/* Display linked artifacts */}
          {selectedRepresentation && (
            <Box mt={4}>
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Artifacts linked to this Representation
              </Typography>

              {representationArtifacts.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={3}>
                  {representationArtifacts.map((artifact, index) => (
                    <Card key={artifact._links.self.href} sx={{ width: 300, p: 2 }}>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {artifact.title || `Artifact #${index + 1}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {artifact.description || "No description"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Created: {artifact.creationDate ? new Date(artifact.creationDate).toLocaleString() : "N/A"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Byte Size: {artifact.byteSize || "N/A"}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Checksum: {artifact.checkSum || "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  There are no artifacts linked to this representation yet.
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default LinkArtifactToRepresentation;
