"use client";

import { useState, useEffect } from "react";
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import "@/styles/notification.css";
import { useAuth } from "@/lib/context/auth-context";
import { fetchNotifications } from "@/lib/api/notifications";
import type { Notification } from "@/lib/types";

export default function NotificationsPercentage() {
  const { token } = useAuth();
  const [flag, setFlag] = useState<"all" | "pending">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchNotifications();
        setNotifications(res.data.filter((i: Notification) => i.type === "operation"));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const handleConfirm = () => {
    if (selected) {
      setNotifications((prev) => prev.map((n) => n.id === selected.id ? { ...n, is_read: true } : n));
    }
    setDialogOpen(false);
    setSelected(null);
  };

  return (
    <div className="px-2">
      <div className="bg-white shadowBox mb-2 mt-1" style={{ maxWidth: "1200px", margin: "auto", borderRadius: "10px" }}>
        <div className="p-2">
          <h3>Notifiche</h3>
          <div className="d-flex gap-1 mb-0">
            <Button style={{ borderRadius: "20px", color: flag === "all" ? "white" : "black" }} variant={flag === "all" ? "contained" : "outlined"} onClick={() => setFlag("all")}>Tutte</Button>
            <Button style={{ borderRadius: "20px", color: flag === "pending" ? "white" : "black" }} variant={flag === "pending" ? "contained" : "outlined"} onClick={() => setFlag("pending")}>In Attesa</Button>
          </div>

          {loading ? (
            <p>Caricamento notifiche...</p>
          ) : (
            <div className="scrollable-container mt-4">
              {notifications.length > 0 ? (
                notifications
                  .filter((n) => flag === "all" || !n.is_read)
                  .map((notification) => (
                    <div key={notification.id} className="d-flex mb-5 gap-2 align-center">
                        <div className="d-flex align-center">
                        {!notification.is_read && (
                          <span style={{ display: "inline-block", width: "12px", height: "12px", backgroundColor: "black", borderRadius: "50%" }} />
                        )}
                      </div>
                      <div className="flex-1"><p>{notification.message}</p></div>
                      <p className="mt-0 d-flex align-center">
                        <strong>{notification.current_percentage}% → {notification.proposed_percentage}%</strong>
                      </p>
                      <div className="d-flex gap-1 align-center iconButton" style={{ alignSelf: "center" }}>
                        <Button size="small" variant="contained" onClick={() => { setSelected(notification); setDialogOpen(true); }}>Sì</Button>
                        <Button size="small" variant="outlined" onClick={() => handleConfirm()}>No</Button>
                      </div>
                    </div>
                  ))
              ) : (
                <p>Non ci sono notifiche.</p>
              )}
            </div>
          )}

          <div className="d-flex justify-center"><Button variant="contained">Mostra di più</Button></div>
        </div>
      </div>

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setSelected(null); }}>
        <DialogTitle>Conferma Azione</DialogTitle>
        <DialogContent><DialogContentText>Sei sicuro di voler confermare?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setSelected(null); }} color="primary">Annulla</Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">Conferma</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
