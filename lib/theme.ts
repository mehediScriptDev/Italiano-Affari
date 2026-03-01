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
    primary: { main: "#13131f" },
    secondary: { main: "#12715b" },
    tertiary: { main: "#f6f8fb" },
    dashboard: { main: "#13131f" },
    background: {
      default: "#f6f8fb",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    button: {
      textTransform: "none" as const,
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          fontWeight: 600,
          letterSpacing: "0.01em",
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&.MuiButton-containedSecondary": {
            background: "#12715b",
            color: "#ffffff",
            "&:hover": {
              background: "#0f5e4a",
              boxShadow: "0 4px 14px rgba(18, 113, 91, 0.35)",
            },
          },
        },
        outlined: {
          "&.MuiButton-outlinedSecondary": {
            borderColor: "#12715b",
            color: "#12715b",
            "&:hover": {
              backgroundColor: "rgba(18, 113, 91, 0.04)",
              borderColor: "#12715b",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
          boxShadow:
            "0 24px 48px rgba(19, 19, 31, 0.12), 0 4px 16px rgba(19, 19, 31, 0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            "& fieldset": {
              borderColor: "#e5e7ec",
              transition: "border-color 0.2s ease",
            },
            "&:hover fieldset": {
              borderColor: "#c4c8d0",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#13131f",
              borderWidth: "1.5px",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(19, 19, 31, 0.06)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: "12px !important",
          boxShadow:
            "0 8px 32px rgba(19, 19, 31, 0.12), 0 2px 8px rgba(19, 19, 31, 0.06) !important",
          border: "1px solid #eef0f4 !important",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 500,
          fontSize: "14px",
          minHeight: "48px",
          "&.Mui-selected": {
            fontWeight: 600,
            color: "#13131f",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: "2.5px",
          borderRadius: "2px",
          backgroundColor: "#13131f",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#c4c8d0",
          "&.Mui-checked": {
            color: "#13131f",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "#eef0f4",
        },
        bar: {
          borderRadius: "8px",
          background: "linear-gradient(135deg, #13131f 0%, #1e1e30 100%)",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#13131f",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: "2px solid rgba(255,255,255,0.15)",
          boxShadow: "0 2px 8px rgba(19, 19, 31, 0.12)",
        },
      },
    },
  },
});

export default theme;
