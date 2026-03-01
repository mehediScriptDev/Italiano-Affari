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
  ChevronLeft,
  ChevronRight,
  AccountCircle,
  Logout,
  Handyman,
  Menu as MenuIcon,
  NotificationsNone,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import { menuItems, type MenuItem } from "@/lib/data/menu";
import { useAppContext } from "@/lib/context/app-context";
import { useAuth } from "@/lib/context/auth-context";
import { fetchNotifications } from "@/lib/api/notifications";
import { downloadAssetFile } from "@/lib/api/partners";
import NotificationRightMenu from "@/components/notifications/notification-right-menu";
import type { Notification } from "@/lib/types";

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
  logoText: "Partners",
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

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  /* Notifications */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    let id: ReturnType<typeof setInterval> | null = null;
    const fetch = async () => {
      try {
        const res = await fetchNotifications();
        setNotifications(res.data ?? []);
      } catch { /* ignore */ }
    };
    fetch();
    id = setInterval(fetch, 60_000);
    return () => { if (id) clearInterval(id); };
  }, [token]);

  /* Close mobile sidebar on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href?: string) =>
    href ? pathname.split("/")[1] === href.split("/")[1] : false;

  const handleProfileOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      {/* ── Sidebar ───────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-1200 flex flex-col overflow-hidden",
          "bg-[#13131f] border-r border-white/6",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-18" : "w-75",
          /* Mobile: off-screen by default, full width when open */
          "max-lg:-translate-x-full max-lg:w-75!",
          mobileOpen ? "max-lg:translate-x-0" : "",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-15 shrink-0 border-b border-white/6">
          <img src={config.logoSrc} alt="Logo" className="w-8 h-8 shrink-0" />
          <span
            className={[
              "text-base font-bold text-white whitespace-nowrap transition-opacity duration-200",
              collapsed ? "opacity-0 pointer-events-none max-lg:opacity-100 max-lg:pointer-events-auto" : "opacity-100",
            ].join(" ")}
          >
            {config.logoText}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
          {config.items.map((item) => {
            const active = isActive(item.href);
            return (
              <Tooltip
                key={item.id}
                title={collapsed ? item.label : ""}
                placement="right"
                arrow
                disableHoverListener={!collapsed}
              >
                <Link
                  href={item.href ?? "/"}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-xl no-underline!",
                    "text-sm font-medium whitespace-nowrap cursor-pointer relative",
                    "transition-all duration-150 ease-out",
                    active
                      ? "text-white! bg-[#12715b]/25 font-semibold"
                      : "text-white/65! hover:text-white! hover:bg-white/8",
                    collapsed
                      ? "justify-center px-2.5! max-lg:justify-start max-lg:px-3!"
                      : "",
                  ].join(" ")}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute -left-2 top-2 bottom-2 w-[3px] bg-[#12715b] rounded-r" />
                  )}
                  <span className="flex items-center justify-center size-6 shrink-0 text-xl">
                    {item.icon && iconMap[item.icon] ? iconMap[item.icon] : <Dashboard fontSize="small" />}
                  </span>
                  <span
                    className={[
                      "transition-opacity duration-200",
                      collapsed ? "opacity-0 pointer-events-none max-lg:opacity-100 max-lg:pointer-events-auto" : "opacity-100",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              </Tooltip>
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
          <div
            className={[
              "overflow-hidden whitespace-nowrap transition-opacity duration-200",
              collapsed ? "opacity-0 pointer-events-none w-0 max-lg:opacity-100 max-lg:pointer-events-auto max-lg:w-auto" : "opacity-100",
            ].join(" ")}
          >
            <div className="text-[13px] font-semibold text-white">{profile?.name}</div>
            <div className="text-[11px] text-white/45 truncate">{profile?.email}</div>
          </div>
        </div>

        {/* Collapse toggle (desktop only) */}
        <div
          className="hidden lg:flex items-center justify-center p-3 border-t border-white/6 shrink-0 cursor-pointer text-white/65 hover:text-white transition-colors duration-150"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
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
          "fixed top-0 right-0 h-15 flex items-center justify-end px-6",
          "z-1100 bg-white border-b border-[#eef0f4] shadow-sm",
          "transition-[left] duration-300 ease-in-out",
          collapsed ? "left-18" : "left-75",
          "max-lg:left-0!",
        ].join(" ")}
      >
        {/* Hamburger (mobile) */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          className="lg:hidden! mr-auto"
          size="small"
        >
          <MenuIcon />
        </IconButton>

        <div className="flex items-center gap-2">
          {/* Notifications bell */}
          <IconButton onClick={() => setRightMenuOpen(true)}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsNone />
            </Badge>
          </IconButton>

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

      {/* Notification right menu */}
      {rightMenuOpen && (
        <NotificationRightMenu
          open={rightMenuOpen}
          onClose={() => setRightMenuOpen(false)}
          notifications={notifications.filter((n) => n.type === "system")}
          setNotifications={setNotifications}
        />
      )}

      {/* ── Content area ──────────────────────── */}
      <div
        className={[
          "min-h-screen bg-[#f6f8fb] pt-15",
          "transition-[margin-left] duration-300 ease-in-out",
          collapsed ? "ml-18" : "ml-75",
          "max-lg:ml-0!",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}
