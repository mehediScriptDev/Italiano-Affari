"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useAppContext } from "@/lib/context/app-context";
import ProfileSettings from "./profile-settings";
import PaymentAssets from "./payment-assets";
import SecurityComponent from "./security";
import TransactionHistory from "./transaction-history";
import Discounts from "./discounts";

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`} aria-labelledby={`full-width-tab-${index}`} style={{ maxWidth: "1200px" }} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface ProfilePageProps {
  index?: number;
}

export default function ProfilePage({ index = 0 }: ProfilePageProps) {
  const [value, setValue] = useState(index);
  const { profile } = useAppContext();

  return (
    <Box sx={{ maxWidth: "1200px", margin: "auto", mb: 5, px: 2 }}>
      <Box sx={{ mb: 3 }}>
        <h5 style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px", margin: 0 }}>Il mio account</h5>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>Gestisci il tuo profilo e le impostazioni</p>
      </Box>
      <Box sx={{
        overflowX: "auto",
        whiteSpace: "nowrap",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        mb: 2,
        px: 1,
      }}>
        <Tabs
          value={value}
          onChange={(_, v) => setValue(v)}
          textColor="secondary"
          indicatorColor="secondary"
          aria-label="tabs"
          sx={{
            minWidth: "600px",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              fontSize: "14px",
              minHeight: "48px",
              letterSpacing: "0.1px",
            },
            "& .Mui-selected": { fontWeight: 600 },
          }}
        >
          <Tab value={0} label="Profilo" />
          <Tab value={1} label="Pagamenti" />
          <Tab value={2} label="Storico Pagamenti" />
          <Tab value={3} label="Promozioni" />
          <Tab value={4} label="Sicurezza" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}><ProfileSettings /></TabPanel>
      <TabPanel value={value} index={1}><PaymentAssets /></TabPanel>
      <TabPanel value={value} index={2}><TransactionHistory /></TabPanel>
      <TabPanel value={value} index={3}><Discounts /></TabPanel>
      {/*<TabPanel value={value} index={4}><SecurityComponent /></TabPanel>*/}
    </Box>
  );
}
