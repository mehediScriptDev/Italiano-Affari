"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ProfileSettings from "@/components/user/profile/profile-settings";
import PaymentAssets from "@/components/user/profile/payment-assets";
import SecurityComponent from "@/components/user/profile/security";
import TransactionHistory from "@/components/user/profile/transaction-history";
import Discounts from "@/components/user/profile/discounts";
import { useAppContext } from "@/lib/context/app-context";

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
      <Box sx={{ overflowX: "auto", whiteSpace: "nowrap" }}>
        <Tabs value={value} onChange={(_, v) => setValue(v)} textColor="secondary" indicatorColor="secondary" aria-label="tabs" sx={{ minWidth: "600px" }}>
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
      <TabPanel value={value} index={4}><SecurityComponent /></TabPanel>
    </Box>
  );
}
