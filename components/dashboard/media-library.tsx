"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close,
  Download,
  Fullscreen,
  GridView,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Pause,
  PlayArrow,
  Tune,
  ViewStream,
  VolumeOff,
  VolumeUp,
} from "@mui/icons-material";
import { fetchContents } from "@/lib/api/partners";
import { showToast } from "@/lib/utils/notifications";

/* â”€â”€â”€ Types â”€â”€â”€ */
interface ContentCategory { id: number; name: string }
interface ContentFilter   { id: number; name: string }
interface ContentUser {
  id: number; first_name: string; last_name: string;
  username: string; avatar?: { url: string } | null;
}
interface ContentItem {
  id: number; title: string; file_path: string; file_type: string;
  canva_url: string; gender: string; created_at: string;
  user: ContentUser; categories: ContentCategory[]; filters: ContentFilter[];
}
interface PaginatedResponse {
  current_page: number; data: ContentItem[];
  last_page: number; per_page: number; total: number;
}
interface Filters { tag: string; category: string; gender: string; mediaType: string }

const defaultFilters: Filters = { tag: "", category: "", gender: "", mediaType: "" };

/* â”€â”€â”€ Pulse animation keyframes â”€â”€â”€ */
const pulse = {
  "@keyframes pulse": {
    "0%,100%": { opacity: 1 },
    "50%": { opacity: 0.4 },
  },
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• COMPONENT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function MediaLibrary() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [contents, setContents]                         = useState<ContentItem[]>([]);
  const [allItems, setAllItems]                         = useState<ContentItem[]>([]);
  const [loading, setLoading]                           = useState(true);
  const [error, setError]                               = useState<string | null>(null);
  const [page, setPage]                                 = useState(1);
  const [totalPages, setTotalPages]                     = useState(1);
  const [filters, setFilters]                           = useState<Filters>(defaultFilters);
  const [pendingFilters, setPendingFilters]             = useState<Filters>(defaultFilters);
  const [viewMode, setViewMode]                         = useState<"grid" | "reels">("grid");
  const [reelIdx, setReelIdx]                           = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen]         = useState(false);

  /* per-video state */
  const [playing, setPlaying]     = useState<Record<number, boolean>>({});
  const [muted, setMuted]         = useState<Record<number, boolean>>({});
  const [progress, setProgress]   = useState<Record<number, number>>({});
  const videoRefs   = useRef<Record<number, HTMLVideoElement | null>>({});
  const reelVideoRef = useRef<HTMLVideoElement | null>(null);
  const [reelPlaying, setReelPlaying]   = useState(true);
  const [reelMuted, setReelMuted]       = useState(true);
  const [reelProgress, setReelProgress] = useState(0);

  /* â”€â”€ boot: fetch all pages for filter options â”€â”€ */
  useEffect(() => {
    (async () => {
      try {
        let all: ContentItem[] = [], pg = 1, last = 1;
        do {
          const r: PaginatedResponse = await fetchContents({ page: pg });
          all = [...all, ...r.data]; last = r.last_page; pg++;
        } while (pg <= last);
        setAllItems(all);
      } catch { /* silently fall back to page items */ }
    })();
  }, []);

  /* â”€â”€ paginated load â”€â”€ */
  const loadContents = useCallback(async (pg: number, f?: Filters) => {
    setLoading(true); setError(null);
    try {
      const af = f ?? filters;
      const params: Record<string, string | number> = { page: pg };
      if (af.tag)       params.tag      = af.tag;
      if (af.category)  params.category = af.category;
      if (af.gender)    params.gender   = af.gender;
      if (af.mediaType) params.type     = af.mediaType;
      const res: PaginatedResponse = await fetchContents(params);
      setContents(res.data); setTotalPages(res.last_page); setPage(res.current_page);
    } catch {
      setError("Impossibile caricare i contenuti. Riprova piÃ¹ tardi.");
      setContents([]);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadContents(1); /* eslint-disable-next-line */ }, []);

  /* reset reel index when contents change */
  useEffect(() => { setReelIdx(0); setReelProgress(0); }, [contents]);

  /* â”€â”€ filter options â”€â”€ */
  const availableTags = useMemo(() => {
    const src = allItems.length ? allItems : contents;
    const m = new Map<number, string>();
    src.forEach(i => i.filters?.forEach(f => m.set(f.id, f.name)));
    return Array.from(m, ([id, name]) => ({ id, name }));
  }, [allItems, contents]);

  const availableCategories = useMemo(() => {
    const src = allItems.length ? allItems : contents;
    const s = new Set<string>();
    src.forEach(i => i.categories?.forEach(c => s.add(c.name)));
    return Array.from(s).sort();
  }, [allItems, contents]);

  /* â”€â”€ helpers â”€â”€ */
  const isVid = (item: ContentItem) => item.file_type?.startsWith("video/");

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return d; }
  };

  const handleDownload = async (item: ContentItem) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(item.canva_url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      const ext = blob.type.split("/")[1]?.split("+")[0] ?? "";
      a.download = item.title.includes(".") ? item.title : `${item.title}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      showToast("Download avviato!", "success");
    } catch { showToast("Errore durante il download", "error"); }
  };

  /* â”€â”€ grid video controls â”€â”€ */
  const togglePlay = (id: number) => {
    const v = videoRefs.current[id]; if (!v) return;
    if (v.paused) { v.play(); setPlaying(p => ({ ...p, [id]: true })); }
    else          { v.pause(); setPlaying(p => ({ ...p, [id]: false })); }
  };
  const toggleMute = (id: number) => {
    const v = videoRefs.current[id]; if (!v) return;
    v.muted = !v.muted; setMuted(p => ({ ...p, [id]: v.muted }));
  };
  const openFull = (id: number) => {
    const v = videoRefs.current[id]; if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  };

  /* â”€â”€ reels controls â”€â”€ */
  const goReel = (dir: "up" | "down") => {
    setReelIdx(p => dir === "up" ? Math.max(0, p - 1) : Math.min(contents.length - 1, p + 1));
    setReelProgress(0); setReelPlaying(true);
  };
  const toggleReelMute = () => {
    if (!reelVideoRef.current) return;
    reelVideoRef.current.muted = !reelVideoRef.current.muted;
    setReelMuted(reelVideoRef.current.muted);
  };
  const toggleReelPlay = () => {
    if (!reelVideoRef.current) return;
    if (reelVideoRef.current.paused) { reelVideoRef.current.play(); setReelPlaying(true); }
    else { reelVideoRef.current.pause(); setReelPlaying(false); }
  };

  /* keyboard nav in reels */
  useEffect(() => {
    if (viewMode !== "reels") return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") goReel("up");
      if (e.key === "ArrowDown") goReel("down");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line
  }, [viewMode, contents.length]);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     FILTER PANEL (shared sidebar + drawer)
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  const renderFilterPanel = (inDrawer = false) => (
    <Box sx={{ p: inDrawer ? 2.5 : 0 }}>
      {inDrawer && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Filtri</Typography>
          <IconButton size="small" onClick={() => setFilterDrawerOpen(false)}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Tag */}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.8, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tag</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <Select value={pendingFilters.tag}
          onChange={e => setPendingFilters(p => ({ ...p, tag: e.target.value }))}
          displayEmpty
          sx={{ borderRadius: "10px", fontSize: 14, bgcolor: "#f9fafb",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7ec" } }}>
          <MenuItem value=""><em style={{ color: "#aaa" }}>Seleziona i tag...</em></MenuItem>
          {availableTags.map(t => <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Category */}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.8, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Categoria</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <Select value={pendingFilters.category}
          onChange={e => setPendingFilters(p => ({ ...p, category: e.target.value }))}
          displayEmpty
          sx={{ borderRadius: "10px", fontSize: 14, bgcolor: "#f9fafb",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7ec" } }}>
          <MenuItem value=""><em style={{ color: "#aaa" }}>Seleziona le categorie...</em></MenuItem>
          {availableCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>

      {/* Gender */}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.8, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Sesso</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {[["", "Tutti"], ["male", "Uomo"], ["female", "Donna"]].map(([v, l]) => (
          <Chip key={v} label={l}
            onClick={() => setPendingFilters(p => ({ ...p, gender: v }))}
            sx={{
              borderRadius: "20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.18s",
              ...(pendingFilters.gender === v
                ? { bgcolor: "#13131f", color: "#fff", border: "1.5px solid #13131f" }
                : { bgcolor: "#fff", color: "#444", border: "1.5px solid #e0e0e0" }),
            }} />
        ))}
      </Box>

      {/* Media type */}
      <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.8, color: "#555", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tipo Media</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {[["", "Tutti"], ["photo", "Foto"], ["video", "Video"]].map(([v, l]) => (
          <Chip key={v} label={l}
            onClick={() => setPendingFilters(p => ({ ...p, mediaType: v }))}
            sx={{
              borderRadius: "20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
              transition: "all 0.18s",
              ...(pendingFilters.mediaType === v
                ? { bgcolor: "#13131f", color: "#fff", border: "1.5px solid #13131f" }
                : { bgcolor: "#fff", color: "#444", border: "1.5px solid #e0e0e0" }),
            }} />
        ))}
      </Box>

      <Button fullWidth variant="contained"
        onClick={() => { setFilters(pendingFilters); loadContents(1, pendingFilters); setFilterDrawerOpen(false); }}
        sx={{ bgcolor: "#13131f", color: "#fff", borderRadius: "12px", py: 1.4,
          fontWeight: 700, fontSize: 15, textTransform: "none",
          "&:hover": { bgcolor: "#2a2a3a", transform: "translateY(-1px)" },
          transition: "all 0.18s" }}>
        Applica filtri
      </Button>

      {(filters.tag || filters.category || filters.gender || filters.mediaType) && (
        <Button fullWidth variant="text" size="small"
          onClick={() => { setFilters(defaultFilters); setPendingFilters(defaultFilters); loadContents(1, defaultFilters); setFilterDrawerOpen(false); }}
          sx={{ mt: 1, color: "#888", fontSize: 13, textTransform: "none",
            "&:hover": { color: "#13131f", bgcolor: "transparent" } }}>
          Rimuovi filtri attivi
        </Button>
      )}
    </Box>
  );

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     GRID CARD
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  const renderGridCard = (item: ContentItem) => {
    const vid = isVid(item);
    const isPlaying = playing[item.id] ?? false;
    const isMuted = muted[item.id] ?? true;
    const prog = progress[item.id] ?? 0;

    return (
      <Box key={item.id} sx={{
        bgcolor: "#fff", borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s",
        display: "flex", flexDirection: "column",
        "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 36px rgba(0,0,0,0.13)" },
      }}>
        {/* â”€â”€ Media area â”€â”€ */}
        <Box sx={{ position: "relative", width: "100%", paddingBottom: "125%", bgcolor: "#0a0a0f", overflow: "hidden" }}>

          {vid ? (
            <>
              <video
                ref={el => { videoRefs.current[item.id] = el; }}
                src={item.canva_url}
                muted loop playsInline preload="metadata"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                onPlay={() => setPlaying(p => ({ ...p, [item.id]: true }))}
                onPause={() => setPlaying(p => ({ ...p, [item.id]: false }))}
                onTimeUpdate={e => {
                  const v = e.currentTarget;
                  if (v.duration) setProgress(p => ({ ...p, [item.id]: (v.currentTime / v.duration) * 100 }));
                }}
              />

              {/* dim overlay on hover */}
              <Box sx={{
                position: "absolute", inset: 0, cursor: "pointer",
                background: isPlaying ? "transparent" : "rgba(0,0,0,0.25)",
                transition: "background 0.2s",
              }} onClick={() => togglePlay(item.id)} />

              {/* Play/Pause centre */}
              {!isPlaying && (
                <Box sx={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 52, height: 52, borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "transform 0.15s",
                  "&:hover": { transform: "translate(-50%,-50%) scale(1.1)" },
                }} onClick={() => togglePlay(item.id)}>
                  <PlayArrow sx={{ color: "#fff", fontSize: 30 }} />
                </Box>
              )}

              {/* Top controls */}
              <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.6 }}>
                <IconButton size="small" onClick={() => toggleMute(item.id)}
                  sx={{ bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff", width: 30, height: 30,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                  {isMuted ? <VolumeOff sx={{ fontSize: 15 }} /> : <VolumeUp sx={{ fontSize: 15 }} />}
                </IconButton>
                <IconButton size="small" onClick={() => openFull(item.id)}
                  sx={{ bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff", width: 30, height: 30,
                    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                  <Fullscreen sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>

              {/* VIDEO badge */}
              <Box sx={{
                position: "absolute", top: 8, left: 8,
                bgcolor: "rgba(18,113,91,0.85)", backdropFilter: "blur(4px)",
                color: "#fff", px: 1, py: 0.25, borderRadius: "6px",
                fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
              }}>VIDEO</Box>

              {/* Progress bar */}
              <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, bgcolor: "rgba(255,255,255,0.15)" }}>
                <Box sx={{ height: "100%", width: `${prog}%`, bgcolor: "#12715b", transition: "width 0.2s linear" }} />
              </Box>
            </>
          ) : (
            <>
              <img src={item.canva_url} alt={item.title} loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <Box sx={{
                position: "absolute", top: 8, left: 8,
                bgcolor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                color: "#fff", px: 1, py: 0.25, borderRadius: "6px",
                fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
              }}>FOTO</Box>
            </>
          )}
        </Box>

        {/* â”€â”€ Card footer â”€â”€ */}
        <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.title}
          </Typography>
          <Typography sx={{ color: "#888", fontSize: 13 }}>
            @{item.user?.username} Â· {fmt(item.created_at)}
          </Typography>
          {item.categories?.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.3 }}>
              {item.categories.slice(0, 2).map(c => (
                <Chip key={c.id} label={c.name} size="small"
                  sx={{ height: 18, fontSize: 10, fontWeight: 600,
                    bgcolor: "#f0fdf8", color: "#12715b", borderRadius: "6px" }} />
              ))}
              {item.categories.length > 2 && (
                <Chip label={`+${item.categories.length - 2}`} size="small"
                  sx={{ height: 18, fontSize: 10, fontWeight: 600,
                    bgcolor: "#f5f5f5", color: "#888", borderRadius: "6px" }} />
              )}
            </Box>
          )}
          <Button fullWidth variant="contained" size="small"
            startIcon={<Download sx={{ fontSize: 14 }} />}
            onClick={() => handleDownload(item)}
            sx={{
              mt: 0.8, bgcolor: "#12715b", color: "#fff", borderRadius: "9px",
              py: 0.8, fontWeight: 700, fontSize: 14, textTransform: "none",
              "&:hover": { bgcolor: "#0e5c49", transform: "translateY(-1px)" },
              transition: "all 0.18s",
            }}>
            Scarica <span className="hidden xl:block ml-2"> Contenuto</span>
          </Button>
        </Box>
      </Box>
    );
  };

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     REELS VIEW
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  const renderReelsView = () => {
    if (!contents.length) return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Typography color="text.secondary">Nessun contenuto da mostrare</Typography>
      </Box>
    );
    const item = contents[reelIdx];
    if (!item) return null;
    const vid = isVid(item);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

        {/* Up button */}
        <IconButton onClick={() => goReel("up")} disabled={reelIdx === 0}
          sx={{
            mb: 1, width: 38, height: 38, borderRadius: "50%",
            bgcolor: reelIdx === 0 ? "#f0f0f0" : "#13131f",
            color: reelIdx === 0 ? "#ccc" : "#fff",
            transition: "all 0.18s",
            "&:hover": { bgcolor: reelIdx === 0 ? "#f0f0f0" : "#2a2a3a", transform: "scale(1.1)" },
          }}>
          <KeyboardArrowUp />
        </IconButton>

        {/* Reel card */}
        <Box sx={{
          width: "100%", maxWidth: { xs: "100%", sm: 420 },
          borderRadius: { xs: "20px", sm: "22px" },
          overflow: "hidden", position: "relative",
          boxShadow: "0 16px 60px rgba(0,0,0,0.3)",
          bgcolor: "#000",
        }}>
          {/* Progress bar at top */}
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 10, bgcolor: "rgba(255,255,255,0.15)" }}>
            <Box sx={{ height: "100%", bgcolor: "#12715b",
              width: vid ? `${reelProgress}%` : "100%",
              transition: "width 0.2s linear" }} />
          </Box>

          {/* Counter + Index pills */}
          <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
            color: "#fff", px: 1.5, py: 0.4, borderRadius: "20px",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
            {reelIdx + 1} / {contents.length}
          </Box>

          {/* Controls top-left */}
          {vid && (
            <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 0.8 }}>
              <IconButton size="small" onClick={toggleReelPlay}
                sx={{ bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff",
                  width: 32, height: 32, "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                {reelPlaying ? <Pause sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
              </IconButton>
              <IconButton size="small" onClick={toggleReelMute}
                sx={{ bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff",
                  width: 32, height: 32, "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                {reelMuted ? <VolumeOff sx={{ fontSize: 16 }} /> : <VolumeUp sx={{ fontSize: 16 }} />}
              </IconButton>
            </Box>
          )}

          {/* Media */}
          <Box sx={{ position: "relative", width: "100%", height: { xs: "72vh", sm: "68vh" }, maxHeight: 720, minHeight: 460, cursor: "pointer" }}
            onClick={vid ? toggleReelPlay : undefined}>
            {vid ? (
              <video key={item.id}
                ref={reelVideoRef}
                src={item.canva_url}
                autoPlay loop playsInline muted={reelMuted}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onPlay={() => setReelPlaying(true)}
                onPause={() => setReelPlaying(false)}
                onTimeUpdate={e => {
                  const v = e.currentTarget;
                  if (v.duration) setReelProgress((v.currentTime / v.duration) * 100);
                }}
              />
            ) : (
              <img src={item.canva_url} alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            )}
            {/* Pause indicator */}
            {vid && !reelPlaying && (
              <Box sx={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 64, height: 64, borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <PlayArrow sx={{ color: "#fff", fontSize: 36 }} />
              </Box>
            )}
          </Box>

          {/* Bottom gradient overlay */}
          <Box sx={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            p: 2, pt: 6,
          }}>
            {/* Categories */}
            {item.categories?.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 1 }}>
                {item.categories.slice(0, 3).map(c => (
                  <Box key={c.id} sx={{ bgcolor: "rgba(18,113,91,0.75)", backdropFilter: "blur(4px)",
                    color: "#fff", px: 1, py: 0.2, borderRadius: "6px", fontSize: 10, fontWeight: 700 }}>
                    {c.name}
                  </Box>
                ))}
              </Box>
            )}

            {/* Title & user */}
            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: 15, sm: 17 }, lineHeight: 1.3, mb: 0.5 }}>
              {item.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: "50%", bgcolor: "#12715b",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.3)",
              }}>
                {item.user?.first_name?.[0]}{item.user?.last_name?.[0]}
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>
                @{item.user?.username} Â· {fmt(item.created_at)}
              </Typography>
            </Box>

            {/* Download */}
            <Button fullWidth variant="contained"
              startIcon={<Download sx={{ fontSize: 16 }} />}
              onClick={() => handleDownload(item)}
              sx={{
                bgcolor: "#12715b", color: "#fff", borderRadius: "12px",
                py: 1.1, fontWeight: 700, fontSize: 14, textTransform: "none",
                "&:hover": { bgcolor: "#0e5c49", transform: "translateY(-1px)" },
                transition: "all 0.18s", backdropFilter: "blur(4px)",
              }}>
              Scarica Contenuto
            </Button>
          </Box>
        </Box>

        {/* Down button */}
        <IconButton onClick={() => goReel("down")} disabled={reelIdx === contents.length - 1}
          sx={{
            mt: 1, width: 38, height: 38, borderRadius: "50%",
            bgcolor: reelIdx === contents.length - 1 ? "#f0f0f0" : "#13131f",
            color: reelIdx === contents.length - 1 ? "#ccc" : "#fff",
            transition: "all 0.18s",
            "&:hover": { bgcolor: reelIdx === contents.length - 1 ? "#f0f0f0" : "#2a2a3a", transform: "scale(1.1)" },
          }}>
          <KeyboardArrowDown />
        </IconButton>

        {/* Dot indicators (up to 9) */}
        <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
          {Array.from({ length: Math.min(contents.length, 9) }).map((_, i) => {
            const spread = contents.length > 9;
            const dotIdx = spread ? Math.round(i * (contents.length - 1) / 8) : i;
            const active = spread
              ? Math.abs(reelIdx / (contents.length - 1) - i / 8) < 0.08
              : reelIdx === i;
            return (
              <Box key={i} onClick={() => { setReelIdx(dotIdx); setReelProgress(0); }}
                sx={{
                  width: active ? 20 : 6, height: 6, borderRadius: "6px",
                  bgcolor: active ? "#12715b" : "#d0d0d0",
                  transition: "all 0.2s", cursor: "pointer",
                }} />
            );
          })}
        </Box>
      </Box>
    );
  };

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     MAIN RENDER
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  const activeFiltersCount = [filters.tag, filters.category, filters.gender, filters.mediaType].filter(Boolean).length;

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }, pt: { xs: 1.5, md: 2, lg: 2.5 }, pb: 4 }}>
      {/* â”€â”€ Header â”€â”€ */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: { xs: 2, md: 3 }, gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: "#13131f", lineHeight: 1.2 }}>
            Libreria Contenuti
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: { xs: 12, md: 14 }, mt: 0.3 }}>
            Sfoglia e scarica i contenuti ufficiali per le tue campagne
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          {/* Filter button (mobile only) */}
          {isMobile && (
            <Button variant="outlined" size="small"
              startIcon={<Tune sx={{ fontSize: 16 }} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                border: "1.5px solid #e0e0e0", color: "#13131f", borderRadius: "10px",
                textTransform: "none", fontWeight: 700, fontSize: 13, px: 1.5, py: 0.8,
                position: "relative",
              }}>
              Filtri
              {activeFiltersCount > 0 && (
                <Box sx={{
                  position: "absolute", top: -6, right: -6,
                  width: 18, height: 18, borderRadius: "50%",
                  bgcolor: "#12715b", color: "#fff", fontSize: 11, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {activeFiltersCount}
                </Box>
              )}
            </Button>
          )}

          {/* View toggle */}
          <IconButton onClick={() => { setViewMode(v => v === "grid" ? "reels" : "grid"); setReelIdx(0); }}
            sx={{
              bgcolor: "#13131f", color: "#fff", borderRadius: "11px",
              width: 40, height: 40,
              "&:hover": { bgcolor: "#2a2a3a", transform: "scale(1.08)" },
              transition: "all 0.18s",
            }}>
            {viewMode === "grid"
              ? <ViewStream sx={{ fontSize: 20 }} />
              : <GridView sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* â”€â”€ Loading â”€â”€ */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <CircularProgress sx={{ color: "#12715b" }} size={36} />
        </Box>
      )}

      {/* â”€â”€ Error â”€â”€ */}
      {error && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="error" sx={{ mb: 1.5, fontWeight: 600 }}>{error}</Typography>
          <Button variant="outlined" onClick={() => loadContents(page)}
            sx={{ borderColor: "#13131f", color: "#13131f", borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
            Riprova
          </Button>
        </Box>
      )}

      {/* â”€â”€ Content â”€â”€ */}
      {!loading && !error && (
        <Box sx={{ display: "flex", gap: { xs: 0, lg: 2.5 }, alignItems: "flex-start" }}>

          {/* Main area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {contents.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography sx={{ color: "#aaa", fontWeight: 600 }}>Nessun contenuto disponibile</Typography>
              </Box>
            ) : viewMode === "grid" ? (
              <>
                <Box sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  },
                  gap: { xs: 1.2, sm: 1.5, md: 2, lg: 2 },
                }}>
                  {contents.map(item => renderGridCard(item))}
                </Box>
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination count={totalPages} page={page}
                      onChange={(_, v) => { loadContents(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      shape="rounded" size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "9px", fontSize: 13 },
                        "& .Mui-selected": { bgcolor: "#13131f !important", color: "#fff" },
                      }} />
                  </Box>
                )}
              </>
            ) : (
              renderReelsView()
            )}
          </Box>

          {/* Desktop sidebar */}
          {!isMobile && (
            <Box sx={{ width: 260, flexShrink: 0, position: "sticky", top: 20 }}>
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", p: 2.5,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2, color: "#13131f" }}>Filtri</Typography>
                {renderFilterPanel(false)}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* â”€â”€ Mobile filter drawer â”€â”€ */}
      <Drawer anchor="bottom" open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: "24px 24px 0 0", maxHeight: "85vh", overflowY: "auto" } }}>
        {/* Handle pill */}
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: "#e0e0e0" }} />
        </Box>
        {renderFilterPanel(true)}
        <Box sx={{ pb: 2 }} />
      </Drawer>
    </Box>
  );
}

