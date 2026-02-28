export interface MenuItem {
  id?: number;
  href?: string;
  label: string;
  subItems?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { id: 1, href: "/dashboard", label: "Dashboard" },
  { id: 2, href: "/report", label: "Statistiche" },
  { id: 3, href: "/agent-management", label: "Gestione Agenti" },
  { id: 4, href: "/orders", label: "Ordini / Report" },
  { id: 5, href: "/contacts", label: "Contatti" },
  { id: 6, href: "https://contents.psicopatici.com/", label: "Libreria Contenuti" },
];

export const icons = [
  { href: "#", iconClass: "unicon-logo-medium icon-2" },
  { href: "#", iconClass: "unicon-logo-x-filled icon-2" },
  { href: "#", iconClass: "unicon-logo-instagram icon-2" },
  { href: "#", iconClass: "unicon-logo-pinterest icon-2" },
];
