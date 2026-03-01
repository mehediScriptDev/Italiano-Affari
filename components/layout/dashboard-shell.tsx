"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import MuiMenu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { ListItemIcon, Tooltip } from "@mui/material";
import {
  Dashboard,
  BarChart,
  Groups,
  Receipt,
  Contacts,
  AccountBalanceWallet,
  PhotoLibrary,
  AccountCircle,
  Logout,
  Handyman,
  Menu as MenuIcon,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";

import { menuItems, type MenuItem } from "@/lib/data/menu";
import { useAppContext } from "@/lib/context/app-context";
import { useAuth } from "@/lib/context/auth-context";
import { downloadAssetFile } from "@/lib/api/partners";

/* ── Icon map ─────────────────────────────────── */
const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <Dashboard fontSize="small" />,
  BarChart: <BarChart fontSize="small" />,
  Groups: <Groups fontSize="small" />,
  Receipt: <Receipt fontSize="small" />,
  Contacts: <Contacts fontSize="small" />,
  AccountBalanceWallet: <AccountBalanceWallet fontSize="small" />,
  PhotoLibrary: <PhotoLibrary fontSize="small" />,
};

/* ── Role-based config (extensible) ───────────── */
export interface SidebarConfig {
  logoSrc: string;
  logoText: string;
  items: MenuItem[];
}

export const partnerSidebarConfig: SidebarConfig = {
  logoSrc: "https://cdn.psicopaticiservice.com/logo/materialeweb/psi-v3-white.png",
  logoText: "Partner",
  items: menuItems,
};

/* Future: export const adminSidebarConfig: SidebarConfig = { ... }; */

/* ── Component ────────────────────────────────── */
interface DashboardShellProps {
  config: SidebarConfig;
  children: React.ReactNode;
}

export default function DashboardShell({ config, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAppContext();
  const { token, setToken } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href?: string) =>
    href ? pathname.split("/")[1] === href.split("/")[1] : false;

  const handleProfileOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);


  return (
    <>
      {/* ── Sidebar ───────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-1200 flex flex-col overflow-hidden",
          "bg-[#13131f] border-r border-white/6",
          "transition-transform duration-300 ease-in-out w-75",
          /* Mobile: off-screen by default, full width when open */
          "max-lg:-translate-x-full",
          mobileOpen ? "max-lg:translate-x-0" : "",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-15 shrink-0 border-b border-white/6">
          <img src={config.logoSrc} alt="Logo" className="w-8 h-8 shrink-0" />
          <span className="text-base lg:text-lg xl:text-xl font-bold text-white whitespace-nowrap">
            {config.logoText}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
          {config.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                  key={item.id}
                  href={item.href ?? "/"}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-md no-underline!",
                    "text-sm lg:text-base font-medium whitespace-nowrap cursor-pointer relative",
                    "transition-all duration-150 ease-out",
                    active
                      ? "text-white! bg-[#12715b] font-semibold"
                      : "text-white/65! hover:text-white! hover:bg-white/8",
                  ].join(" ")}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute -left-2 top-2 bottom-2 w-0.75 bg-[#12715b] rounded-r" />
                  )}
                  <span className="flex items-center justify-center size-6 shrink-0 text-xl">
                    {item.icon && iconMap[item.icon] ? iconMap[item.icon] : <Dashboard fontSize="small" />}
                  </span>
                  <span>{item.label}</span>
                </Link>
            );
          })}
        </nav>

        {/* Profile at bottom */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-t border-white/6 shrink-0 cursor-pointer text-white/65 hover:bg-white/8 transition-colors duration-150"
          onClick={handleProfileOpen}
        >
          <Avatar
            src={profile?.avatar}
            sx={{ width: 34, height: 34, fontSize: 14, bgcolor: "#12715b" }}
          >
            {profile?.name?.charAt(0)}
          </Avatar>
          <div className="overflow-hidden whitespace-nowrap">
            <div className="text-sm font-semibold text-white">{profile?.name}</div>
            <div className="text-xs text-white/45 truncate">{profile?.email}</div>
          </div>
        </div>

        {/* Logout button */}
        <div
          className="flex items-center gap-3 px-4 py-2 border-t border-white/6 shrink-0 cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150"
          onClick={() => setToken()}
        >
          <Logout fontSize="small" className="shrink-0" />
          <span className="text-sm font-medium">Esci</span>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-1199 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Topbar ────────────────────────────── */}
      <div
        className={[
          "fixed top-0 right-0 h-15 flex items-center justify-between px-4",
          "z-1100 bg-white border-b border-[#eef0f4] shadow-sm",
          "left-75",
          "max-lg:left-0!",
        ].join(" ")}
      >
        {/* Hamburger (mobile) — left side */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          className="lg:hidden!"
          size="small"
        >
          <MenuIcon />
        </IconButton>

        <div className="flex items-center gap-2 ml-auto">
          {/* Avatar */}
          <Avatar
            src={profile?.avatar}
            onClick={handleProfileOpen}
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
              bgcolor: "#13131f",
              fontSize: 14,
              boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
            }}
          >
            {profile?.name?.charAt(0)}
          </Avatar>
        </div>
      </div>

      {/* Profile dropdown */}
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            className: "rounded-2xl! mt-2.5! min-w-60!",
            style: {
              boxShadow: "0 8px 32px rgba(19,19,31,0.12), 0 2px 8px rgba(19,19,31,0.06)",
              border: "1px solid #eef0f4",
            },
          },
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 mb-1">
          <Avatar src={profile?.avatar} sx={{ width: 36, height: 36 }}>
            {profile?.name?.charAt(0)}
          </Avatar>
          <div>
            <p className="text-sm font-semibold m-0 leading-tight">{profile?.name}</p>
            <p className="text-xs text-slate-500 m-0 mt-0.5">{profile?.email}</p>
          </div>
        </div>
        <div className="h-px bg-[#e5e7ec] mx-3 mb-1" />
        <MuiMenuItem onClick={() => { handleProfileClose(); router.push("/profile"); }}
          sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}>
          <ListItemIcon><AccountCircle style={{ fontSize: 18 }} /></ListItemIcon>
          Il mio account
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { handleProfileClose(); downloadAssetFile(); }}
          sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}>
          <ListItemIcon><Handyman style={{ fontSize: 18 }} /></ListItemIcon>
          Strumenti Partner
        </MuiMenuItem>
        <div className="h-px bg-[#e5e7ec] mx-3 my-1" />
        <MuiMenuItem onClick={() => setToken()}
          sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px", color: "#dc2626" }}>
          <ListItemIcon><Logout style={{ fontSize: 18, color: "#dc2626" }} /></ListItemIcon>
          Esci
        </MuiMenuItem>
      </MuiMenu>

      {/* ── Content area ──────────────────────── */}
      <div
        className={[
          "min-h-screen bg-[#f6f8fb] pt-15",
          "ml-75",
          "max-lg:ml-0!",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
