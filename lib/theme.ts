"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    dashboard: Palette["primary"];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    dashboard?: PaletteOptions["primary"];
  }
}

const theme = createTheme({
  palette: {
    primary: { main: "#161618" },
    secondary: { main: "#12715b" },
    tertiary: { main: "#f6f8fb" },
    dashboard: { main: "#000000" },
  },
});

export default theme;
