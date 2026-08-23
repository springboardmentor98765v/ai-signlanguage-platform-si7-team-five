import { NotificationItem } from '../types';
import { apiBaseUrl } from '../utils/api';

class NotificationService {
  private getHeaders() {
    const token = localStorage.getItem('asl_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const resp = await fetch(`${apiBaseUrl}/notifications/me`, { headers: this.getHeaders() });
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.map((n: any) => ({
        id: String(n.id),
        title: n.title,
        message: n.message,
        type: n.event_type === 'badge_earned' ? 'achievement' : 'system',
        read: n.is_read,
        time: new Date(n.created_at + 'Z').toLocaleString(),
      }));
    } catch {
      return [];
    }
  }

  async markAsRead(id: string): Promise<NotificationItem[]> {
    try {
      await fetch(`${apiBaseUrl}/notifications/${id}/read`, { 
        method: 'PUT',
        headers: this.getHeaders()
      });
      return this.getNotifications();
    } catch {
      return this.getNotifications();
    }
  }

  async markAllAsRead(): Promise<NotificationItem[]> {
    // Current backend doesn't have a mark all as read API, fallback to individual or reload
    return this.getNotifications();
  }

  async clearAll(): Promise<NotificationItem[]> {
    return [];
  }

  async deleteNotification(id: string): Promise<NotificationItem[]> {
    return this.getNotifications();
  }
}

export const notificationService = new NotificationService();
