import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f6f8fb",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <img
        src="/assets/images/logo_psicopatici.png"
        alt="Logo"
        style={{ width: "160px", opacity: 0.85 }}
      />
      <CircularProgress color="secondary" size={40} />
    </Box>
  );
}
