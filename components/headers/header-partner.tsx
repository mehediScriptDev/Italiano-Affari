"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ListItemIcon, useMediaQuery, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { Handyman } from "@mui/icons-material";
import { openMobileMenu } from "@/lib/utils/toggle-mobile-menu";
import { useAppContext } from "@/lib/context/app-context";
import { useAuth } from "@/lib/context/auth-context";
import { downloadAssetFile } from "@/lib/api/partners";
import NavPartner from "./nav-partner";

export default function HeaderPartner() {
  const theme = useTheme();
  const { setToken } = useAuth();
  const { profile } = useAppContext();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const router = useRouter();

  const [anchorElProfile, setAnchorElProfile] = useState<HTMLElement | null>(null);

  const handleProfileClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => setAnchorElProfile(null);

  return (
    <>
      <header className="sticky top-0 z-999 h-15 bg-[#13131f] flex items-center" style={{ boxShadow: '0 2px 12px rgba(19, 19, 31, 0.3)' }}>
        <div className="container flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="https://cdn.psicopaticiservice.com/logo/materialeweb/psi-v3-white.png"
              alt="Logo"
              height={30}
              width={34}
            />
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar
              onClick={handleProfileClick}
              src={profile?.avatar}
              className="cursor-pointer sm:w-10! sm:h-10! w-9! h-9! bg-gray-500! ring-2 ring-white/20 hover:ring-white/40 transition-all duration-200"
            >
              {profile?.name?.charAt(0)}
            </Avatar>

            {/* Profile dropdown */}
            <Menu
              anchorEl={anchorElProfile}
              open={Boolean(anchorElProfile)}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  className: "!rounded-2xl !mt-2.5 !min-w-60",
                  style: { boxShadow: '0 8px 32px rgba(19, 19, 31, 0.12), 0 2px 8px rgba(19, 19, 31, 0.06)', border: '1px solid #eef0f4' },
                },
              }}
            >
              {/* Profile header */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 mb-1 cursor-pointer"
                onClick={handleProfileClose}
              >
                <Avatar src={profile?.avatar} className="w-9! h-9!">
                  {profile?.name?.charAt(0)}
                </Avatar>
                <div>
                  <p className="text-sm font-semibold m-0 leading-tight">{profile?.name}</p>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">{profile?.email}</p>
                </div>
              </div>

              <div className="h-px bg-[#e5e7ec] mx-3 mb-1" />

              <MenuItem
                onClick={() => router.push("/profile")}
                sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}
              >
                <ListItemIcon><AccountCircleIcon style={{ fontSize: "18px" }} /></ListItemIcon>
                Il mio account
              </MenuItem>

              <MenuItem
                onClick={() => downloadAssetFile()}
                sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px" }}
              >
                <ListItemIcon><Handyman style={{ fontSize: "18px" }} /></ListItemIcon>
                Strumenti Partner
              </MenuItem>

              <div className="h-px bg-[#e5e7ec] mx-3 my-1" />

              <MenuItem
                onClick={() => setToken()}
                sx={{ py: 1.2, px: 2, mx: "4px", borderRadius: "8px", fontSize: "14px", color: "#dc2626" }}
              >
                <ListItemIcon><LogoutIcon style={{ fontSize: "18px", color: "#dc2626" }} /></ListItemIcon>
                Esci
              </MenuItem>
            </Menu>

            {/* Mobile menu toggle */}
            <a
              className="flex lg:hidden cursor-pointer text-white"
              onClick={openMobileMenu}
            >
              <svg width={20} height={20} viewBox="0 0 20 20" fill="white">
                <rect y={3} width={20} height={2} />
                <rect y={9} width={20} height={2} />
                <rect y={15} width={20} height={2} />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {isMd && <NavPartner />}
    </>
  );
}
