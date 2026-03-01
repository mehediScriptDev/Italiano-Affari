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
        gap: 3,
      }}
    >
      <img
        src="/assets/images/logo_psicopatici.png"
        alt="Logo"
        style={{ width: "160px", opacity: 0.9 }}
      />
      <CircularProgress sx={{ color: "#13131f" }} size={36} thickness={3.5} />
    </Box>
  );
}
