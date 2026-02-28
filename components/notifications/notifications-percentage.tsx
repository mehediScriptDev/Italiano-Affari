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
      <div className="bg-white shadowBox mb-2 mt-1 max-w-300 mx-auto rounded-[10px]">
        <div className="p-2">
          <h3>Notifiche</h3>
          <div className="flex gap-1 mb-0">
            <Button className={`rounded-[20px] ${flag === "all" ? "text-white" : "text-black"}`} variant={flag === "all" ? "contained" : "outlined"} onClick={() => setFlag("all")}>Tutte</Button>
            <Button className={`rounded-[20px] ${flag === "pending" ? "text-white" : "text-black"}`} variant={flag === "pending" ? "contained" : "outlined"} onClick={() => setFlag("pending")}>In Attesa</Button>
          </div>

          {loading ? (
            <p>Caricamento notifiche...</p>
          ) : (
            <div className="scrollable-container mt-4">
              {notifications.length > 0 ? (
                notifications
                  .filter((n) => flag === "all" || !n.is_read)
                  .map((notification) => (
                    <div key={notification.id} className="flex mb-5 gap-2 items-center">
                        <div className="flex items-center">
                        {!notification.is_read && <span className="inline-block w-3 h-3 bg-black rounded-full" />}
                      </div>
                      <div className="flex-1"><p>{notification.message}</p></div>
                      <p className="mt-0 flex items-center">
                        <strong>{notification.current_percentage}% → {notification.proposed_percentage}%</strong>
                      </p>
                      <div className="flex gap-1 items-center iconButton self-center">
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

          <div className="flex justify-center"><Button variant="contained">Mostra di più</Button></div>
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
