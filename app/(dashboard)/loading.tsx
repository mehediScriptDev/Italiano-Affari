import { Box, CircularProgress } from "@mui/material";

export default function DashboardLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        width: "100%",
      }}
    >
      <CircularProgress sx={{ color: "#13131f" }} size={36} thickness={3.5} />
    </Box>
  );
}
