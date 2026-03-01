"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Close,
  Download,
  FilterList,
  Search,
} from "@mui/icons-material";
import { fetchContents } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";

interface MediaAsset {
  id: number;
  title: string;
  url: string;
  thumbnail?: string;
  type: "photo" | "video" | "logo";
  category?: string;
  gender?: string;
  tags?: string[];
  created_at: string;
}

interface Filters {
  tag: string;
  category: string;
  gender: string;
  type: string;
}

const defaultFilters: Filters = {
  tag: "",
  category: "",
  gender: "",
  type: "",
};

export default function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const loadAssets = useCallback(async (appliedFilters?: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      const f = appliedFilters ?? filters;
      if (f.tag) params.tag = f.tag;
      if (f.category) params.category = f.category;
      if (f.gender) params.gender = f.gender;
      if (f.type) params.type = f.type;

      const res = await fetchContents(params);
      const data: MediaAsset[] = (res?.data ?? res ?? []).map(
        (item: Record<string, unknown>, i: number) => ({
          id: (item.id as number) ?? i,
          title: (item.title as string) ?? (item.name as string) ?? `Asset ${i + 1}`,
          url: (item.url as string) ?? (item.file_url as string) ?? "",
          thumbnail: (item.thumbnail as string) ?? (item.thumb_url as string) ?? (item.url as string) ?? "",
          type: (item.type as string) ?? "photo",
          category: (item.category as string) ?? "",
          gender: (item.gender as string) ?? "",
          tags: (item.tags as string[]) ?? [],
          created_at: (item.created_at as string) ?? "",
        })
      );
      setAssets(data);
      setFilteredAssets(data);
    } catch {
      setError("Impossibile caricare i contenuti. Riprova più tardi.");
      setAssets([]);
      setFilteredAssets([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAssets(assets);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredAssets(
        assets.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.category?.toLowerCase().includes(q) ||
            a.tags?.some((t) => t.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, assets]);

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    loadAssets(pendingFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setPendingFilters(defaultFilters);
    setFilters(defaultFilters);
    loadAssets(defaultFilters);
    setShowFilters(false);
  };

  const handleDownload = async (asset: MediaAsset) => {
    try {
      const response = await fetch(asset.url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = asset.title || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      showToast("Errore durante il download", "error");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getMediaThumbnail = (asset: MediaAsset) => {
    if (asset.type === "video" && asset.thumbnail) return asset.thumbnail;
    return asset.thumbnail || asset.url;
  };

  return (
    <Box className="w-100 paddingContainer mt-3">
      {/* Header */}
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Libreria Contenuti
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sfoglia e scarica i contenuti ufficiali per le tue campagne di promozione
          </Typography>
        </div>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtri
        </Button>
      </div>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Cerca contenuti..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Filter Panel */}
      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
              Filtra Contenuti
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tag</InputLabel>
                  <Select
                    value={pendingFilters.tag}
                    label="Tag"
                    onChange={(e) =>
                      setPendingFilters((p) => ({ ...p, tag: e.target.value }))
                    }
                  >
                    <MenuItem value="">Tutti</MenuItem>
                    <MenuItem value="summer">Summer</MenuItem>
                    <MenuItem value="winter">Winter</MenuItem>
                    <MenuItem value="promo">Promo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={pendingFilters.category}
                    label="Categoria"
                    onChange={(e) =>
                      setPendingFilters((p) => ({
                        ...p,
                        category: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">Tutte</MenuItem>
                    <MenuItem value="clothing">Abbigliamento</MenuItem>
                    <MenuItem value="accessories">Accessori</MenuItem>
                    <MenuItem value="lifestyle">Lifestyle</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Genere
                </Typography>
                <ToggleButtonGroup
                  value={pendingFilters.gender}
                  exclusive
                  onChange={(_, val) =>
                    setPendingFilters((p) => ({ ...p, gender: val ?? "" }))
                  }
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="">Tutti</ToggleButton>
                  <ToggleButton value="male">Uomo</ToggleButton>
                  <ToggleButton value="female">Donna</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Tipo Media
                </Typography>
                <ToggleButtonGroup
                  value={pendingFilters.type}
                  exclusive
                  onChange={(_, val) =>
                    setPendingFilters((p) => ({ ...p, type: val ?? "" }))
                  }
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="">Tutti</ToggleButton>
                  <ToggleButton value="photo">Foto</ToggleButton>
                  <ToggleButton value="video">Video</ToggleButton>
                  <ToggleButton value="logo">Loghi</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
            <div className="d-flex justify-end gap-2 mt-2">
              <Button variant="text" onClick={handleResetFilters}>
                Resetta Filtri
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleApplyFilters}
              >
                Applica Filtri
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => loadAssets()}>
            Riprova
          </Button>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAssets.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery
              ? "Nessun contenuto trovato per la tua ricerca"
              : "Nessun contenuto disponibile al momento"}
          </Typography>
        </Box>
      )}

      {/* Asset Grid */}
      {!loading && !error && filteredAssets.length > 0 && (
        <Grid container spacing={3}>
          {filteredAssets.map((asset) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={asset.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                {/* Thumbnail — click opens lightbox preview */}
                <CardMedia
                  component="img"
                  height={200}
                  image={getMediaThumbnail(asset)}
                  alt={asset.title}
                  sx={{ cursor: "pointer", objectFit: "cover" }}
                  onClick={() => setPreviewAsset(asset)}
                />
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2,
                  }}
                >
                  <div>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {asset.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(asset.created_at)}
                    </Typography>
                    {asset.type !== "photo" && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "inline-block",
                          ml: 1,
                          px: 1,
                          py: 0.25,
                          bgcolor: asset.type === "video" ? "#e3f2fd" : "#f3e5f5",
                          borderRadius: 1,
                          fontSize: "10px",
                          textTransform: "uppercase",
                        }}
                      >
                        {asset.type}
                      </Typography>
                    )}
                  </div>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownload(asset)}
                    sx={{ mt: 1.5, textTransform: "none" }}
                    fullWidth
                  >
                    Scarica Contenuto
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Lightbox Preview Dialog */}
      <Dialog
        open={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        maxWidth="lg"
        fullWidth
      >
        <IconButton
          onClick={() => setPreviewAsset(null)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <Close />
        </IconButton>
        <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#000", minHeight: 400 }}>
          {previewAsset?.type === "video" ? (
            <video
              controls
              autoPlay
              style={{ maxWidth: "100%", maxHeight: "80vh" }}
              src={previewAsset.url}
            >
              Il tuo browser non supporta il tag video.
            </video>
          ) : (
            previewAsset && (
              <img
                src={previewAsset.url}
                alt={previewAsset.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
