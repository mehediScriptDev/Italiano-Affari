"use client";

import ContentLoader from "react-content-loader";
import {
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, InfoOutlined } from "@mui/icons-material";
import { Sparklines, SparklinesCurve } from "react-sparklines";
import type { ChartPreviewData } from "@/lib/types";
import type { SxProps, Theme } from "@mui/material";

const ChartSkeleton = () => (
  <Card
    sx={{
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
    }}
  >
    <CardContent sx={{ p: "20px 24px !important" }}>
      <ContentLoader
        speed={2}
        width="100%"
        height={100}
        viewBox="0 0 400 100"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <rect x="0" y="8" rx="8" ry="8" width="44" height="44" />
        <rect x="56" y="10" rx="3" ry="3" width="120" height="10" />
        <rect x="56" y="28" rx="3" ry="3" width="80" height="18" />
        <rect x="0" y="70" rx="3" ry="3" width="300" height="20" />
      </ContentLoader>
    </CardContent>
  </Card>
);

interface ChartPreviewProps {
  obj: ChartPreviewData | null;
  icon: React.ReactNode;
  label: string;
  sx?: SxProps<Theme>;
}

export default function ChartPreview({ obj, icon, label, sx }: ChartPreviewProps) {
  if (!obj) return <ChartSkeleton />;

  const data = Object.values(obj.data);
  const formatted = obj.total.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isPositive = obj.trend === "positive";

  const infoText =
    'In caso di statistica di vendite i dati visualizzati riguardano solo gli ordini marcati come "Completati", ovvero un ordine è marcato come completato soltanto dopo che il prodotto è stato consegnato dal corriere al cliente.';

  return (
    <Card
      sx={{
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        position: "relative",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transform: "translateY(-1px)",
        },
        ...sx,
      }}
    >
      <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
        <Tooltip title={infoText} arrow placement="left">
          <IconButton size="small" sx={{ opacity: 0.4, "&:hover": { opacity: 0.7 } }}>
            <InfoOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <CardContent sx={{ p: "20px 24px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f6f8fb",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: "#64748b", fontSize: "12px", fontWeight: 500, letterSpacing: "0.3px", textTransform: "uppercase" }}
            >
              {label}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px", mt: "2px" }}>
              <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#000", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
                {formatted}
              </Typography>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                  px: "6px",
                  py: "2px",
                  borderRadius: "6px",
                  backgroundColor: isPositive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  color: isPositive ? "#059669" : "#dc2626",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {isPositive ? (
                  <ArrowUpward sx={{ fontSize: 13 }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 13 }} />
                )}
                {obj.difference}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: "14px", mx: "-4px" }}>
          <Sparklines data={data} height={28} margin={4}>
            <SparklinesCurve
              color={isPositive ? "#059669" : "#dc2626"}
              style={{ strokeWidth: 1.5, fill: "none" }}
            />
          </Sparklines>
        </Box>
      </CardContent>
    </Card>
  );
}
