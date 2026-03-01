export interface MenuItem {
  id?: number;
  href?: string;
  label: string;
  icon?: string;
  subItems?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { id: 1, href: "/dashboard", label: "Dashboard", icon: "Dashboard" },
  { id: 2, href: "/report", label: "Statistiche", icon: "BarChart" },
  { id: 3, href: "/agent-management", label: "Gestione Agenti", icon: "Groups" },
  { id: 4, href: "/orders", label: "Ordini / Report", icon: "Receipt" },
  { id: 5, href: "/contacts", label: "Contatti", icon: "Contacts" },
  { id: 6, href: "/wallet", label: "Portafoglio", icon: "AccountBalanceWallet" },
  { id: 7, href: "/media-library", label: "Libreria Contenuti", icon: "PhotoLibrary" },
];

export const icons = [
  { href: "#", iconClass: "unicon-logo-medium icon-2" },
  { href: "#", iconClass: "unicon-logo-x-filled icon-2" },
  { href: "#", iconClass: "unicon-logo-instagram icon-2" },
  { href: "#", iconClass: "unicon-logo-pinterest icon-2" },
];
