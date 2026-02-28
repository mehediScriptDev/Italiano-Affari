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
      <CircularProgress color="secondary" size={40} />
    </Box>
  );
}
