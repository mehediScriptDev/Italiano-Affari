"use client";

import { Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ProfileSettings from "./profile-settings";
import PaymentAssets from "./payment-assets";
import TransactionHistory from "./transaction-history";
import Discounts from "./discounts";

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

interface ProfilePageProps {
  index?: number;
}

export default function ProfilePage({ index = 0 }: ProfilePageProps) {
  const [value, setValue] = useState(index);

  return (
    <div className="w-100 paddingContainer mt-3 mb-8">
      {/* Page header */}
      <div className="mb-2">
        <h1 className="page-title">Il mio account</h1>
        <p className="page-subtitle">Gestisci il tuo profilo e le impostazioni</p>
      </div>

      {/* Tab bar card */}
      <div className="dash-card mb-2 overflow-x-auto">
        <Tabs
          value={value}
          onChange={(_, v) => setValue(v)}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{
            minWidth: "600px",
            px: 1,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "14px", minHeight: "48px" },
            "& .Mui-selected": { fontWeight: 600 },
          }}
        >
          <Tab value={0} label="Profilo" />
          <Tab value={1} label="Pagamenti" />
          <Tab value={2} label="Storico Pagamenti" />
          <Tab value={3} label="Promozioni" />
        </Tabs>
      </div>

      <TabPanel value={value} index={0}><ProfileSettings /></TabPanel>
      <TabPanel value={value} index={1}><PaymentAssets /></TabPanel>
      <TabPanel value={value} index={2}><TransactionHistory /></TabPanel>
      <TabPanel value={value} index={3}><Discounts /></TabPanel>
    </div>
  );
}
