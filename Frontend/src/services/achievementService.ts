import { AchievementBadge, BadgeCategory } from '../types';
import { mockDetailedBadges } from '../mockData';

class AchievementService {
  private badges: AchievementBadge[] = [...mockDetailedBadges];

  async getBadges(category?: BadgeCategory | 'All'): Promise<AchievementBadge[]> {
    await new Promise((r) => setTimeout(r, 200));
    if (!category || category === 'All') {
      return [...this.badges];
    }
    return this.badges.filter((b) => b.category === category);
  }

  async getBadgeDetails(id: string): Promise<AchievementBadge | null> {
    const found = this.badges.find((b) => b.id === id);
    return found ? { ...found } : null;
  }

  async simulateUnlock(id: string): Promise<AchievementBadge | null> {
    this.badges = this.badges.map((b) =>
      b.id === id
        ? { ...b, unlocked: true, progress: 100, currentCount: b.totalRequired, unlockedAt: new Date().toISOString().split('T')[0] }
        : b
    );
    return this.getBadgeDetails(id);
  }
}

export const achievementService = new AchievementService();
