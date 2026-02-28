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
          className="uc-header uc-navbar-sticky-wrap z-999 uc-dark uc-sticky h-15 bg-black flex justify-center"
        >
            <div className="flex justify-center w-full">
            <nav
              className="uc-navbar-container uc-navbar-float ft-tertiary z-1 uc-navbar-transparent h-15 flex items-center justify-between bg-black max-w-300 w-full mx-auto"
              style={{ padding: isSm ? "0px 20px" : "0px" }}
            >
              <div className="uc-navbar-left flex items-center">
                <Link href="/" style={{ width: isSm ? 150 : 220 }}>
                  <img
                    src="https://cdn.psicopaticiservice.com/logo/materialeweb/psi-v3-white.png"
                    alt="Logo" height={30} width={34}
                  />
                </Link>
              </div>

              <div className="uc-navbar-right flex items-center" style={{ gap: isSm ? "18px" : "23px" }}>
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
                >
                  <div onClick={handleProfileClose} className="mb-1 flex items-center px-4 py-1.5 gap-0.75">
                    <Avatar src={profile?.avatar} sx={{ width: "32px", height: "32px" }}>
                      {profile?.name?.charAt(0)}
                    </Avatar>
                    <div>
                      <p className="font-bold">{profile?.name}</p>
                      <p className="mt-0 text-xs">{profile?.email}</p>
                    </div>
                  </div>
                  <MenuItem onClick={() => router.push("/profile")}>
                    <ListItemIcon><AccountCircleIcon style={{ fontSize: "19px" }} /></ListItemIcon>
                    Il mio account
                  </MenuItem>
                  <MenuItem onClick={() => downloadAssetFile()}>
                    <ListItemIcon><Handyman style={{ fontSize: "19px" }} /></ListItemIcon>
                    Strumenti Partner
                  </MenuItem>
                  <MenuItem onClick={() => setToken()} className="border-t border-[#e2e8f0] pt-2.5">
                    <ListItemIcon><LogoutIcon style={{ fontSize: "19px" }} /></ListItemIcon>
                    Esci
                  </MenuItem>
                </Menu>

                <a className="block lg:hidden uc-icon uc-navbar-toggle-icon text-white" onClick={openMobileMenu}>
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
