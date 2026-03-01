"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ListItemIcon, useMediaQuery, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Handyman } from "@mui/icons-material";
import NotificationRightMenu from "@/components/notifications/notification-right-menu";

import { openMobileMenu } from "@/lib/utils/toggle-mobile-menu";
import { useAppContext } from "@/lib/context/app-context";
import { useAuth } from "@/lib/context/auth-context";
import { fetchNotifications } from "@/lib/api/notifications";
import { downloadAssetFile } from "@/lib/api/partners";
import type { Notification } from "@/lib/types";
import NotificationMenu from "./notification-menu";
import NavPartner from "./nav-partner";

export default function HeaderPartner() {
  const theme = useTheme();
  const { token, setToken } = useAuth();
  const { profile } = useAppContext();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const [notificationAnchorEl, setNotificationAnchorEl] = useState<HTMLElement | null>(null);
  const [openNotification, setOpenNotification] = useState(false);
  const [openRightMenu, setOpenRightMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchData = async () => {
      try {
        const response = await fetchNotifications();
        setNotifications(response.data);
      } catch (e) {
        console.error("Error fetching notifications:", e);
      }
    };

    if (token) {
      fetchData();
      intervalId = setInterval(fetchData, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  const handleNotificationClick = (event: MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    setOpenNotification(true);
  };

  const handleNotificationClose = () => {
    setOpenNotification(false);
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => setAnchorElProfile(null);

  return (
    <>
      <div className="mb-4">
        <header
          className="uc-header uc-navbar-sticky-wrap z-999 uc-dark uc-sticky"
          style={{ height: "60px", backgroundColor: "black", display: "flex", justifyContent: "center" }}
        >
            <div className="d-flex justify-center w-100">
            <nav
              className="uc-navbar-container uc-navbar-float ft-tertiary z-1 uc-navbar-transparent"
              style={{
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "black",
                padding: isSm ? "0px 20px" : "0px",
                maxWidth: "1200px",
                width: "100%",
                margin: "0 auto",
              }}
            >
              <div className="uc-navbar-left" style={{ display: "flex", alignItems: "center" }}>
                <Link href="/" style={{ width: isSm ? 150 : 220 }}>
                  <img
                    src="https://cdn.psicopaticiservice.com/logo/materialeweb/psi-v3-white.png"
                    alt="Logo" height={30} width={34}
                  />
                </Link>
              </div>

              <div
                className="uc-navbar-right"
                style={{ display: "flex", alignItems: "center", gap: isSm ? "18px" : "23px" }}
              >
                <Avatar
                  onClick={handleProfileClick}
                  src={profile?.avatar}
                  sx={{ cursor: "pointer", backgroundColor: "gray", width: isSm ? 35 : 40, height: isSm ? 35 : 40 }}
                >
                  {profile?.name?.charAt(0)}
                </Avatar>

                {openNotification && (
                  <NotificationMenu
                    anchorEl={notificationAnchorEl}
                    open={openNotification}
                    onClose={handleNotificationClose}
                    notifications={notifications.filter((i) => i.type === "operation")}
                  />
                )}

                {openRightMenu && (
                  <NotificationRightMenu
                    open={openRightMenu}
                    onClose={() => setOpenRightMenu(false)}
                    notifications={notifications.filter((i) => i.type === "system")}
                    setNotifications={setNotifications}
                  />
                )}

                <Menu
                  anchorEl={anchorElProfile}
                  open={Boolean(anchorElProfile)}
                  onClose={handleProfileClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: "12px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        mt: 1,
                        minWidth: 220,
                      },
                    },
                  }}
                >
                  <div onClick={handleProfileClose} style={{ padding: "12px 16px", gap: "10px" }} className="mb-1 d-flex align-center">
                    <Avatar src={profile?.avatar} sx={{ width: "36px", height: "36px" }}>
                      {profile?.name?.charAt(0)}
                    </Avatar>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{profile?.name}</p>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>{profile?.email}</p>
                    </div>
                  </div>
                  <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "0 12px" }} />
                  <MenuItem onClick={() => router.push("/profile")} sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}>
                    <ListItemIcon><AccountCircleIcon style={{ fontSize: "18px" }} /></ListItemIcon>
                    Il mio account
                  </MenuItem>
                  <MenuItem onClick={() => downloadAssetFile()} sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}>
                    <ListItemIcon><Handyman style={{ fontSize: "18px" }} /></ListItemIcon>
                    Strumenti Partner
                  </MenuItem>
                  <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "4px 12px" }} />
                  <MenuItem onClick={() => setToken()} sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px", color: "#dc2626" }}>
                    <ListItemIcon><LogoutIcon style={{ fontSize: "18px", color: "#dc2626" }} /></ListItemIcon>
                    Esci
                  </MenuItem>
                </Menu>

                <a className="d-block lg:d-none uc-icon uc-navbar-toggle-icon text-white" onClick={openMobileMenu}>
                  <svg width={20} height={20} viewBox="0 0 20 20">
                    <rect className="line-1" y={3} width={20} height={2} />
                    <rect className="line-2" y={9} width={20} height={2} />
                    <rect className="line-3" y={9} width={20} height={2} />
                    <rect className="line-4" y={15} width={20} height={2} />
                  </svg>
                </a>
              </div>
            </nav>
          </div>
        </header>

        {isMd && <NavPartner />}
      </div>
    </>
  );
}
