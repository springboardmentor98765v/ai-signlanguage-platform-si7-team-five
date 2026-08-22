import { NotificationItem } from '../types';
import { mockNotifications } from '../mockData';

class NotificationService {
  private notifications: NotificationItem[] = [...mockNotifications];

  async getNotifications(): Promise<NotificationItem[]> {
    // Simulates API delay for realistic loading skeleton states
    await new Promise((r) => setTimeout(r, 200));
    return [...this.notifications];
  }

  async markAsRead(id: string): Promise<NotificationItem[]> {
    this.notifications = this.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item
    );
    return [...this.notifications];
  }

  async markAllAsRead(): Promise<NotificationItem[]> {
    this.notifications = this.notifications.map((item) => ({ ...item, read: true }));
    return [...this.notifications];
  }

  async clearAll(): Promise<NotificationItem[]> {
    this.notifications = [];
    return [];
  }

  async deleteNotification(id: string): Promise<NotificationItem[]> {
    this.notifications = this.notifications.filter((item) => item.id !== id);
    return [...this.notifications];
  }
}

export const notificationService = new NotificationService();
