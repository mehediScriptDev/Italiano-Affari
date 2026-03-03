"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Skeleton,
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

// ── Types ──────────────────────────────────────────────

interface ContentCategory {
  id: number;
  name: string;
}

interface ContentFilter {
  id: number;
  name: string;
}

interface ContentUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  avatar?: { url: string } | null;
}

interface ContentItem {
  id: number;
  title: string;
  file_path: string;
  file_type: string;
  canva_url: string;
  gender: string;
  created_at: string;
  user: ContentUser;
  categories: ContentCategory[];
  filters: ContentFilter[];
}

interface PaginatedResponse {
  current_page: number;
  data: ContentItem[];
  last_page: number;
  per_page: number;
  total: number;
}

interface Filters {
  tag: string;
  category: string;
  gender: string;
  mediaType: string;
}

// ── Constants ────────────

const DEFAULT_FILTERS: Filters = { tag: "", category: "", gender: "", mediaType: "" };

const PAGE_SIZE = 12;

const GENDER_OPTIONS: [string, string][] = [
  ["", "Tutti"],
  ["male", "Uomo"],
  ["female", "Donna"],
];

const MEDIA_TYPE_OPTIONS: [string, string][] = [
  ["", "Tutti"],
  ["photo", "Foto"],
  ["video", "Video"],
];

const COLORS = {
  primary: "#13131f",
  primaryHover: "#2a2a3a",
  secondary: "#12715b",
  secondaryDark: "#0e5c49",
  muted: "#64748b",
  surface: "#fff",
  border: "#e0e0e0",
  inputBg: "#f9fafb",
  inputBorder: "#e5e7ec",
  chipActive: "#f0fdf8",
  chipMuted: "#f5f5f5",
  text: "#444",
  textLight: "#888",
  dark: "#0a0a0f",
} as const;

// ── Helpers ────────────────────────────────────────────

const isVideo = (item: ContentItem) => item.file_type?.startsWith("video/");

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const countActiveFilters = (f: Filters) =>
  [f.tag, f.category, f.gender, f.mediaType].filter(Boolean).length;

async function downloadContent(item: ContentItem) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(item.canva_url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const ext = blob.type.split("/")[1]?.split("+")[0] ?? "";
    const filename = item.title.includes(".") ? item.title : `${item.title}.${ext}`;

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    showToast("Download avviato!", "success");
  } catch {
    showToast("Errore durante il download", "error");
  }
}

// ── Chip Toggle (reusable) ─────────────────────────────

function ChipToggle({
  value,
  selected,
  label,
  color = COLORS.primary,
  onClick,
}: {
  value: string;
  selected: boolean;
  label: string;
  color?: string;
  onClick: (v: string) => void;
}) {
  return (
    <Chip
      label={label}
      onClick={() => onClick(value)}
      sx={{
        borderRadius: "20px",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.18s",
        ...(selected
          ? { bgcolor: color, color: COLORS.surface, border: `1.5px solid ${color}` }
          : { bgcolor: COLORS.surface, color: COLORS.text, border: `1.5px solid ${COLORS.border}` }),
      }}
    />
  );
}

// ── Filter Panel ───────────────────────────────────────

function FilterPanel({
  inDrawer,
  pendingFilters,
  setPendingFilters,
  filters,
  availableTags,
  availableCategories,
  onApply,
  onReset,
  onClose,
}: {
  inDrawer: boolean;
  pendingFilters: Filters;
  setPendingFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filters: Filters;
  availableTags: { id: number; name: string }[];
  availableCategories: string[];
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const selectSx = {
    borderRadius: "10px",
    fontSize: 14,
    bgcolor: COLORS.inputBg,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.inputBorder },
  };

  const labelSx = {
    fontWeight: 700,
    fontSize: 13,
    mb: 0.8,
    color: "#555",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  };

  return (
    <Box sx={{ p: inDrawer ? 2.5 : 0 }}>
      {inDrawer && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>Filtri</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Typography sx={labelSx}>Tag</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <Select
          value={pendingFilters.tag}
          onChange={(e) => setPendingFilters((p) => ({ ...p, tag: e.target.value }))}
          displayEmpty
          sx={selectSx}
        >
          <MenuItem value="">
            <em style={{ color: "#aaa" }}>Seleziona i tag...</em>
          </MenuItem>
          {availableTags.map((t) => (
            <MenuItem key={t.id} value={t.name}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={labelSx}>Categoria</Typography>
      <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
        <Select
          value={pendingFilters.category}
          onChange={(e) => setPendingFilters((p) => ({ ...p, category: e.target.value }))}
          displayEmpty
          sx={selectSx}
        >
          <MenuItem value="">
            <em style={{ color: "#aaa" }}>Seleziona le categorie...</em>
          </MenuItem>
          {availableCategories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={labelSx}>Sesso</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {GENDER_OPTIONS.map(([v, l]) => (
          <ChipToggle
            key={v}
            value={v}
            label={l}
            selected={pendingFilters.gender === v}
            onClick={(val) => setPendingFilters((p) => ({ ...p, gender: val }))}
          />
        ))}
      </Box>

      <Typography sx={labelSx}>Tipo Media</Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {MEDIA_TYPE_OPTIONS.map(([v, l]) => (
          <ChipToggle
            key={v}
            value={v}
            label={l}
            selected={pendingFilters.mediaType === v}
            onClick={(val) => setPendingFilters((p) => ({ ...p, mediaType: val }))}
          />
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={onApply}
        sx={{
          bgcolor: COLORS.primary,
          color: COLORS.surface,
          borderRadius: "12px",
          py: 1.4,
          fontWeight: 700,
          fontSize: 15,
          textTransform: "none",
          "&:hover": { bgcolor: COLORS.primaryHover, transform: "translateY(-1px)" },
          transition: "all 0.18s",
        }}
      >
        Applica filtri
      </Button>

      {countActiveFilters(filters) > 0 && (
        <Button
          fullWidth
          variant="text"
          size="small"
          onClick={onReset}
          sx={{
            mt: 1,
            color: COLORS.textLight,
            fontSize: 13,
            textTransform: "none",
            "&:hover": { color: COLORS.primary, bgcolor: "transparent" },
          }}
        >
          Rimuovi filtri attivi
        </Button>
      )}
    </Box>
  );
}

// ── Grid Card ──────────────────────────────────────────

function GridCard({ item }: { item: ContentItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [prog, setProg] = useState(0);

  const vid = isVideo(item);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const openFullscreen = () => {
    const v = videoRef.current;
    if (v?.requestFullscreen) v.requestFullscreen();
  };

  return (
    <Box
      sx={{
        bgcolor: COLORS.surface,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s",
        display: "flex",
        flexDirection: "column",
        "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 36px rgba(0,0,0,0.13)" },
      }}
    >
      {/* Media area */}
      <Box sx={{ position: "relative", width: "100%", paddingBottom: "125%", bgcolor: COLORS.dark, overflow: "hidden" }}>
        {vid ? (
          <VideoMedia
            item={item}
            videoRef={videoRef}
            isPlaying={isPlaying}
            isMuted={isMuted}
            progress={prog}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(ct, dur) => dur && setProg((ct / dur) * 100)}
            onTogglePlay={togglePlay}
            onToggleMute={toggleMute}
            onFullscreen={openFullscreen}
          />
        ) : (
          <ImageMedia item={item} />
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </Typography>

        <Typography sx={{ color: COLORS.textLight, fontSize: 13 }}>
          @{item.user?.username} · {formatDate(item.created_at)}
        </Typography>

        {item.categories?.length > 0 && <CategoryChips categories={item.categories} />}

        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<Download sx={{ fontSize: 14 }} />}
          onClick={() => downloadContent(item)}
          sx={{
            mt: 0.8,
            bgcolor: COLORS.secondary,
            color: COLORS.surface,
            borderRadius: "9px",
            py: 0.8,
            fontWeight: 700,
            fontSize: 14,
            textTransform: "none",
            "&:hover": { bgcolor: COLORS.secondaryDark, transform: "translateY(-1px)" },
            transition: "all 0.18s",
          }}
        >
          Scarica <span className="hidden xl:block ml-2"> Contenuto</span>
        </Button>
      </Box>
    </Box>
  );
}

// ── Grid Card Sub-components ───────────────────────────

function VideoMedia({
  item,
  videoRef,
  isPlaying,
  isMuted,
  progress,
  onPlay,
  onPause,
  onTimeUpdate,
  onTogglePlay,
  onToggleMute,
  onFullscreen,
}: {
  item: ContentItem;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
}) {
  const glassBtn = {
    bgcolor: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    width: 30,
    height: 30,
    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
  };

  return (
    <>
      <video
        ref={videoRef}
        src={item.canva_url}
        muted
        loop
        playsInline
        preload="metadata"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          cursor: "pointer",
          background: isPlaying ? "transparent" : "rgba(0,0,0,0.25)",
          transition: "background 0.2s",
        }}
        onClick={onTogglePlay}
      />

      {!isPlaying && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 52,
            height: 52,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.15s",
            "&:hover": { transform: "translate(-50%,-50%) scale(1.1)" },
          }}
          onClick={onTogglePlay}
        >
          <PlayArrow sx={{ color: "#fff", fontSize: 30 }} />
        </Box>
      )}

      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.6 }}>
        <IconButton size="small" onClick={onToggleMute} sx={glassBtn}>
          {isMuted ? <VolumeOff sx={{ fontSize: 15 }} /> : <VolumeUp sx={{ fontSize: 15 }} />}
        </IconButton>
        <IconButton size="small" onClick={onFullscreen} sx={glassBtn}>
          <Fullscreen sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <MediaBadge label="VIDEO" color={`rgba(18,113,91,0.85)`} />

      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, bgcolor: "rgba(255,255,255,0.15)" }}>
        <Box sx={{ height: "100%", width: `${progress}%`, bgcolor: COLORS.secondary, transition: "width 0.2s linear" }} />
      </Box>
    </>
  );
}

function ImageMedia({ item }: { item: ContentItem }) {
  return (
    <>
      <img
        src={item.canva_url}
        alt={item.title}
        loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <MediaBadge label="FOTO" color="rgba(0,0,0,0.55)" />
    </>
  );
}

function MediaBadge({ label, color }: { label: string; color: string }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        bgcolor: color,
        backdropFilter: "blur(4px)",
        color: "#fff",
        px: 1,
        py: 0.25,
        borderRadius: "6px",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.06em",
      }}
    />
  );
}

function CategoryChips({ categories }: { categories: ContentCategory[] }) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.3 }}>
      {categories.slice(0, 2).map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          size="small"
          sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: COLORS.chipActive, color: COLORS.secondary, borderRadius: "6px" }}
        />
      ))}
      {categories.length > 2 && (
        <Chip
          label={`+${categories.length - 2}`}
          size="small"
          sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: COLORS.chipMuted, color: COLORS.textLight, borderRadius: "6px" }}
        />
      )}
    </Box>
  );
}

// ── Reels View ─────────────────────────────────────────

function ReelsView({ contents }: { contents: ContentItem[] }) {
  const reelVideoRef = useRef<HTMLVideoElement | null>(null);
  const [reelIdx, setReelIdx] = useState(0);
  const [reelPlaying, setReelPlaying] = useState(true);
  const [reelMuted, setReelMuted] = useState(true);
  const [reelProgress, setReelProgress] = useState(0);

  useEffect(() => {
    setReelIdx(0);
    setReelProgress(0);
  }, [contents]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") goReel("up");
      if (e.key === "ArrowDown") goReel("down");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contents.length]);

  const goReel = (dir: "up" | "down") => {
    setReelIdx((p) => (dir === "up" ? Math.max(0, p - 1) : Math.min(contents.length - 1, p + 1)));
    setReelProgress(0);
    setReelPlaying(true);
  };

  const toggleReelPlay = () => {
    const v = reelVideoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleReelMute = () => {
    const v = reelVideoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setReelMuted(v.muted);
  };

  if (!contents.length) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <Typography color="text.secondary">Nessun contenuto da mostrare</Typography>
      </Box>
    );
  }

  const item = contents[reelIdx];
  if (!item) return null;
  const vid = isVideo(item);

  const navBtnSx = (disabled: boolean) => ({
    width: 38,
    height: 38,
    borderRadius: "50%",
    bgcolor: disabled ? "#f0f0f0" : COLORS.primary,
    color: disabled ? "#ccc" : "#fff",
    transition: "all 0.18s",
    "&:hover": { bgcolor: disabled ? "#f0f0f0" : COLORS.primaryHover, transform: "scale(1.1)" },
  });

  const glassBtn = {
    bgcolor: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    width: 32,
    height: 32,
    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <IconButton onClick={() => goReel("up")} disabled={reelIdx === 0} sx={{ mb: 1, ...navBtnSx(reelIdx === 0) }}>
        <KeyboardArrowUp />
      </IconButton>

      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", sm: 420 },
          borderRadius: { xs: "20px", sm: "22px" },
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 16px 60px rgba(0,0,0,0.3)",
          bgcolor: "#000",
        }}
      >
        {/* Progress bar */}
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 10, bgcolor: "rgba(255,255,255,0.15)" }}>
          <Box
            sx={{
              height: "100%",
              bgcolor: COLORS.secondary,
              width: vid ? `${reelProgress}%` : "100%",
              transition: "width 0.2s linear",
            }}
          />
        </Box>

        {/* Counter */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            px: 1.5,
            py: 0.4,
            borderRadius: "20px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {reelIdx + 1} / {contents.length}
        </Box>

        {/* Video controls */}
        {vid && (
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10, display: "flex", gap: 0.8 }}>
            <IconButton size="small" onClick={toggleReelPlay} sx={glassBtn}>
              {reelPlaying ? <Pause sx={{ fontSize: 16 }} /> : <PlayArrow sx={{ fontSize: 16 }} />}
            </IconButton>
            <IconButton size="small" onClick={toggleReelMute} sx={glassBtn}>
              {reelMuted ? <VolumeOff sx={{ fontSize: 16 }} /> : <VolumeUp sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        )}

        {/* Media */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "72vh", sm: "68vh" },
            maxHeight: 720,
            minHeight: 460,
            cursor: vid ? "pointer" : "default",
          }}
          onClick={vid ? toggleReelPlay : undefined}
        >
          {vid ? (
            <video
              key={item.id}
              ref={reelVideoRef}
              src={item.canva_url}
              autoPlay
              loop
              playsInline
              muted={reelMuted}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onPlay={() => setReelPlaying(true)}
              onPause={() => setReelPlaying(false)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (v.duration) setReelProgress((v.currentTime / v.duration) * 100);
              }}
            />
          ) : (
            <img
              src={item.canva_url}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}

          {vid && !reelPlaying && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlayArrow sx={{ color: "#fff", fontSize: 36 }} />
            </Box>
          )}
        </Box>

        {/* Bottom overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            p: 2,
            pt: 6,
          }}
        >
          {item.categories?.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap", mb: 1 }}>
              {item.categories.slice(0, 3).map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    bgcolor: "rgba(18,113,91,0.75)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    px: 1,
                    py: 0.2,
                    borderRadius: "6px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {c.name}
                </Box>
              ))}
            </Box>
          )}

          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: 15, sm: 17 }, lineHeight: 1.3, mb: 0.5 }}>
            {item.title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: COLORS.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              {item.user?.first_name?.[0]}
              {item.user?.last_name?.[0]}
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600 }}>
              @{item.user?.username} · {formatDate(item.created_at)}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            startIcon={<Download sx={{ fontSize: 16 }} />}
            onClick={() => downloadContent(item)}
            sx={{
              bgcolor: COLORS.secondary,
              color: "#fff",
              borderRadius: "12px",
              py: 1.1,
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              "&:hover": { bgcolor: COLORS.secondaryDark, transform: "translateY(-1px)" },
              transition: "all 0.18s",
              backdropFilter: "blur(4px)",
            }}
          >
            Scarica Contenuto
          </Button>
        </Box>
      </Box>

      <IconButton
        onClick={() => goReel("down")}
        disabled={reelIdx === contents.length - 1}
        sx={{ mt: 1, ...navBtnSx(reelIdx === contents.length - 1) }}
      >
        <KeyboardArrowDown />
      </IconButton>

      {/* Dot indicators */}
      <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
        {Array.from({ length: Math.min(contents.length, 9) }).map((_, i) => {
          const spread = contents.length > 9;
          const dotIdx = spread ? Math.round((i * (contents.length - 1)) / 8) : i;
          const active = spread
            ? Math.abs(reelIdx / (contents.length - 1) - i / 8) < 0.08
            : reelIdx === i;

          return (
            <Box
              key={i}
              onClick={() => {
                setReelIdx(dotIdx);
                setReelProgress(0);
              }}
              sx={{
                width: active ? 20 : 6,
                height: 6,
                borderRadius: "6px",
                bgcolor: active ? COLORS.secondary : "#d0d0d0",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────

export default function MediaLibrary() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<"grid" | "reels">("grid");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const fetchAllItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let all: ContentItem[] = [];
      let pg = 1, last = 1;
      do {
        const r: PaginatedResponse = await fetchContents({ page: pg });
        all = [...all, ...r.data];
        last = r.last_page;
        pg++;
      } while (pg <= last);
      setAllItems(all);
    } catch {
      setError("Impossibile caricare i contenuti. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  useEffect(() => {
    if (filterDrawerOpen) setPendingFilters(filters);
  }, [filterDrawerOpen]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filters.tag && !item.filters?.some((f) => f.name === filters.tag)) return false;
      if (filters.category && !item.categories?.some((c) => c.name === filters.category)) return false;
      if (filters.gender && item.gender !== filters.gender) return false;
      if (filters.mediaType === "video" && !isVideo(item)) return false;
      if (filters.mediaType === "photo" && isVideo(item)) return false;
      return true;
    });
  }, [allItems, filters]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const availableTags = useMemo(() => {
    const map = new Map<number, string>();
    allItems.forEach((i) => i.filters?.forEach((f) => map.set(f.id, f.name)));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [allItems]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => i.categories?.forEach((c) => set.add(c.name)));
    return Array.from(set).sort();
  }, [allItems]);

  const applyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPendingFilters(DEFAULT_FILTERS);
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const activeCount = countActiveFilters(filters);

  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 }, pt: { xs: 1.5, md: 2, lg: 2.5 }, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: { xs: 2, md: 3 }, gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 }, color: COLORS.primary, lineHeight: 1.2 }}>
            Libreria Contenuti
          </Typography>
          <Typography sx={{ color: COLORS.muted, fontSize: { xs: 12, md: 14 }, mt: 0.3 }}>
            Sfoglia e scarica i contenuti ufficiali per le tue campagne
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          {isMobile && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Tune sx={{ fontSize: 16 }} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                border: `1.5px solid ${COLORS.border}`,
                color: COLORS.primary,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 1.5,
                py: 0.8,
                position: "relative",
              }}
            >
              Filtri
              {activeCount > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    bgcolor: COLORS.secondary,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              )}
            </Button>
          )}

          <IconButton
            onClick={() => setViewMode((v) => (v === "grid" ? "reels" : "grid"))}
            sx={{
              bgcolor: COLORS.primary,
              color: "#fff",
              borderRadius: "11px",
              width: 40,
              height: 40,
              "&:hover": { bgcolor: COLORS.primaryHover, transform: "scale(1.08)" },
              transition: "all 0.18s",
            }}
          >
            {viewMode === "grid" ? <ViewStream sx={{ fontSize: 20 }} /> : <GridView sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* Content — sidebar always visible, only cards area swaps */}
      <Box sx={{ display: "flex", gap: { xs: 0, lg: 2.5 }, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Skeleton */}
          {loading && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: { xs: 1.2, sm: 1.5, md: 2, lg: 2 },
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} sx={{ bgcolor: COLORS.surface, borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <Box sx={{ position: "relative", width: "100%", paddingBottom: "125%", overflow: "hidden" }}>
                    <Skeleton variant="rectangular" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "none" }} />
                  </Box>
                  <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
                    <Skeleton variant="text" height={22} width="70%" sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" height={16} width="50%" sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rounded" height={32} sx={{ borderRadius: "9px", mt: 0.5 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Error */}
          {error && !loading && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="error" sx={{ mb: 1.5, fontWeight: 600 }}>
                {error}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => fetchAllItems()}
                sx={{ borderColor: COLORS.primary, color: COLORS.primary, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
              >
                Riprova
              </Button>
            </Box>
          )}

          {/* Cards / Reels */}
          {!loading && !error && (
            <>
              {pagedItems.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography sx={{ color: "#aaa", fontWeight: 600 }}>Nessun contenuto disponibile</Typography>
                </Box>
              ) : viewMode === "grid" ? (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(2, 1fr)",
                        sm: "repeat(3, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(3, 1fr)",
                        xl: "repeat(4, 1fr)",
                      },
                      gap: { xs: 1.2, sm: 1.5, md: 2, lg: 2 },
                    }}
                  >
                    {pagedItems.map((item) => (
                      <GridCard key={item.id} item={item} />
                    ))}
                  </Box>

                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => {
                          setPage(v);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        shape="rounded"
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          "& .MuiPaginationItem-root": { fontWeight: 700, borderRadius: "9px", fontSize: 13 },
                          "& .Mui-selected": { bgcolor: `${COLORS.primary} !important`, color: "#fff" },
                        }}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <ReelsView contents={pagedItems} />
              )}
            </>
          )}
        </Box>

        {/* Desktop sidebar — always visible */}
        {!isMobile && (
          <Box sx={{ width: 260, flexShrink: 0, position: "sticky", top: 20 }}>
            <Box sx={{ bgcolor: COLORS.surface, borderRadius: "16px", p: 2.5, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2, color: COLORS.primary }}>Filtri</Typography>
              <FilterPanel
                inDrawer={false}
                pendingFilters={pendingFilters}
                setPendingFilters={setPendingFilters}
                filters={filters}
                availableTags={availableTags}
                availableCategories={availableCategories}
                onApply={applyFilters}
                onReset={resetFilters}
                onClose={() => {}}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Mobile filter drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: "24px 24px 0 0", maxHeight: "85vh", overflowY: "auto" } }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: COLORS.border }} />
        </Box>
        <FilterPanel
          inDrawer
          pendingFilters={pendingFilters}
          setPendingFilters={setPendingFilters}
          filters={filters}
          availableTags={availableTags}
          availableCategories={availableCategories}
          onApply={applyFilters}
          onReset={resetFilters}
          onClose={() => setFilterDrawerOpen(false)}
        />
        <Box sx={{ pb: 2 }} />
      </Drawer>
    </Box>
  );
}

