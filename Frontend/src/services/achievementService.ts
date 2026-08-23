import { AchievementBadge, BadgeCategory } from '../types';
import { apiBaseUrl } from '../utils/api';

// Frontend fallback/metadata for badges (to keep UI rich when backend only returns codes)
const BADGE_METADATA: Record<string, Partial<AchievementBadge>> = {
  'first-lesson': { iconName: '🎓', category: 'Beginner', totalRequired: 1 },
  'alphabet-master': { iconName: '🔤', category: 'Mastery', totalRequired: 26 },
  'perfect-score': { iconName: '⭐', category: 'Mastery', totalRequired: 1 },
  'seven-day-streak': { iconName: '🔥', category: 'Consistency', totalRequired: 7 },
  'fast-learner': { iconName: '⚡', category: 'Speed', totalRequired: 5 },
  'first-certification': { iconName: '📜', category: 'Mastery', totalRequired: 1 },
  'accessibility-champion': { iconName: '🌟', category: 'Special', totalRequired: 10 },
  'community-helper': { iconName: '🤝', category: 'Special', totalRequired: 1 },
};

class AchievementService {
  private getHeaders() {
    const token = localStorage.getItem('asl_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getBadges(category?: BadgeCategory | 'All'): Promise<AchievementBadge[]> {
    try {
      const resp = await fetch(`${apiBaseUrl}/business/badges/me`, { headers: this.getHeaders() });
      if (!resp.ok) return [];
      const backendBadges = await resp.json();
      
      const parsedBadges: AchievementBadge[] = backendBadges.map((b: any) => {
        const meta = BADGE_METADATA[b.code] || { iconName: '🏆', category: 'Beginner', totalRequired: 1 };
        return {
          id: b.code,
          title: b.name,
          description: b.description,
          iconName: meta.iconName as string,
          category: meta.category as BadgeCategory,
          unlocked: true,
          progress: meta.totalRequired as number,
          totalRequired: meta.totalRequired as number,
          currentCount: meta.totalRequired as number,
          unlockedAt: b.earned_at.split('T')[0],
        };
      });

      if (!category || category === 'All') {
        return parsedBadges;
      }
      return parsedBadges.filter((b) => b.category === category);
    } catch {
      return [];
    }
  }

  async getBadgeDetails(id: string): Promise<AchievementBadge | null> {
    const badges = await this.getBadges();
    return badges.find((b) => b.id === id) || null;
  }

  async simulateUnlock(id: string): Promise<AchievementBadge | null> {
    // Triggered usually by the backend now organically during practice.
    return this.getBadgeDetails(id);
  }
}

export const achievementService = new AchievementService();

