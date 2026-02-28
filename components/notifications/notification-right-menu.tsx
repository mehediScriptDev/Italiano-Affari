"use client";

import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ClearIcon from "@mui/icons-material/Clear";
import "@/styles/notification-right-menu.css";
import {
  deleteAllNotifications, deleteNotification,
  markAllNotificationsAsRead, markNotificationAsRead,
} from "@/lib/api/notifications";
import type { Notification } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}

export default function NotificationRightMenu({ onClose, notifications, setNotifications }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const formatTimeElapsed = (dateString?: string) => {
    if (!dateString) return "";
    const notificationDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (notificationDate >= today) return "Oggi";
    if (notificationDate >= yesterday) return "Ieri";
    const diffDays = Math.ceil(Math.abs(today.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} giorni fa`;
  };

  useEffect(() => { setIsOpen(true); }, []);

  const handleNotificationRead = (id: number) => {
    markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markAllNotificationsAsRead();
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotification(id);
  };

  const handleDeleteAllNotifications = () => {
    setNotifications([]);
    deleteAllNotifications();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); onClose(); }, 300);
  };

  return (
    <>
      {isOpen && <div className={`overlay ${isOpen ? "open" : ""}`} onClick={handleClose} />}
      <div className={`notification-menu ${isOpen ? "open" : ""} ${isClosing ? "closing" : ""}`}>
        <div className="notification-header d-flex justify-between">
          <div>
            <h4 className="mb-1">Notifiche</h4>
            <div className="d-flex gap-2">
              <p style={{ fontSize: "14px", color: "#377aca", cursor: "pointer" }} className="mb-0 fw-medium" onClick={handleAllNotificationsRead}>Segna tutto come letto</p>
              <p style={{ color: "red", fontSize: "14px", cursor: "pointer" }} className="mt-0 fw-medium" onClick={handleDeleteAllNotifications}>Clear</p>
            </div>
          </div>
          <IconButton className="p-0" onClick={handleClose}><CloseIcon style={{ color: "black" }} /></IconButton>
        </div>

        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className={`notification-item ${notification.is_read ? "read" : "unread"}`}>
                <div className="d-flex"><NotificationsNoneIcon style={{ fontSize: "30px" }} /></div>
                <div className="d-flex flex-column flex-1">
                  <h5 className="mb-0">{notification.title}</h5>
                  <p style={{ color: "#7d899e" }} className="mb-0">{formatTimeElapsed(notification.created_at)}</p>
                  <p className="mt-0">{notification.message}</p>
                  {!notification.is_read && (
                    <p style={{ textDecoration: "underline", cursor: "pointer" }} className="fw-medium mt-2" onClick={() => handleNotificationRead(notification.id)}>Visualizza</p>
                  )}
                </div>
                <div className="d-flex flex-column">
                  <IconButton className="p-0" onClick={() => handleDeleteNotification(notification.id)}>
                    <ClearIcon style={{ color: "black" }} />
                  </IconButton>
                </div>
              </div>
            ))
          ) : (
            <p>Non ci sono notifiche.</p>
          )}
        </div>
      </div>
    </>
  );
}
