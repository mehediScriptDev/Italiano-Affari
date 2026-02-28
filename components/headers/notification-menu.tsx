"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Menu, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import type { Notification } from "@/lib/types";

interface NotificationMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export default function NotificationMenu({ anchorEl, open, onClose, notifications }: NotificationMenuProps) {
  const [notificationsFlag, setNotificationFlag] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const router = useRouter();

  const handleOpenDialog = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleConfirm = () => {
    handleCloseDialog();
  };

  return (
    <>
      <Menu
        sx={{ top: "5px" }}
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div className="p-2">
          <h3>Notifiche</h3>
          <div className="d-flex gap-1 mb-0">
            <Button
              style={{ borderRadius: "20px", color: notificationsFlag === "all" ? "white" : "black" }}
              variant={notificationsFlag === "all" ? "contained" : "outlined"}
              onClick={() => setNotificationFlag("all")}
            >
              Tutte
            </Button>
            <Button
              style={{ borderRadius: "20px", color: notificationsFlag === "pending" ? "white" : "black" }}
              variant={notificationsFlag === "pending" ? "contained" : "outlined"}
              onClick={() => setNotificationFlag("pending")}
            >
              In Attesa
            </Button>
          </div>
          <div className="d-flex justify-end my-1">
            <p onClick={() => router.push("/notification-percentage")} style={{ textDecoration: "underline", cursor: "pointer" }} className="fw-bold">
              Mostra tutto
            </p>
          </div>
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications
              .filter((n) => notificationsFlag === "all" || !n.is_read)
              .map((notification) => (
                <div key={notification.id} className="mb-4">
                  <p>{notification.message}</p>
                  <p className="mt-0">
                    <strong>{notification.current_percentage}% → {notification.proposed_percentage}%</strong>
                  </p>
                  <div className="d-flex justify-between mt-1">
                    <div className="d-flex gap-2 align-center">
                      <Button size="small" variant="contained" onClick={() => handleOpenDialog(notification)}>Sì</Button>
                      <Button size="small" variant="outlined" onClick={() => handleConfirm()}>No</Button>
                    </div>
                    <div className="d-flex align-center">
                      {!notification.is_read && (
                        <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "black", borderRadius: "50%" }} />
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p>Non ci sono notifiche.</p>
          )}
        </div>
      </Menu>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Conferma Azione</DialogTitle>
        <DialogContent>
          <DialogContentText>Sei sicuro di voler confermare questa notifica?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Annulla</Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">Conferma</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
