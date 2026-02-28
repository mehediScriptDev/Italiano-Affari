import api, { API_URL } from "./client";

export async function fetchNotifications() {
  const response = await api.get(`${API_URL}/notifications`);
  return response.status === 200 ? response.data : [];
}

export async function markNotificationAsRead(notificationId: number) {
  const response = await api.patch(
    `${API_URL}/notifications/${notificationId}/mark-as-read`
  );
  return response.status === 200 ? response.data : null;
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch(
    `${API_URL}/notifications/mark-all-as-read`
  );
  return response.status === 200 ? response.data : null;
}

export async function deleteNotification(notificationId: number) {
  const response = await api.delete(
    `${API_URL}/notifications/${notificationId}`
  );
  return response.status === 200 ? response.data : null;
}

export async function deleteAllNotifications() {
  const response = await api.delete(`${API_URL}/notifications`);
  return response.status === 200 ? response.data : null;
}
