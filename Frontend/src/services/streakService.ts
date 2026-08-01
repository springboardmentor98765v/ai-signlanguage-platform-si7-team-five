import { StreakDetails } from '../types';
import { mockStreakDetails } from '../mockData';

class StreakService {
  private streakData: StreakDetails = { ...mockStreakDetails };

  async getStreakDetails(): Promise<StreakDetails> {
    await new Promise((r) => setTimeout(r, 150));
    return { ...this.streakData };
  }

  async recordDailyPractice(): Promise<StreakDetails> {
    const updatedWeekly = this.streakData.weeklyCalendar.map((item) =>
      item.isToday ? { ...item, completed: true } : item
    );
    const newStreak = this.streakData.todayCompleted ? this.streakData.currentStreak : this.streakData.currentStreak + 1;
    this.streakData = {
      ...this.streakData,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, this.streakData.longestStreak),
      todayCompleted: true,
      weeklyCalendar: updatedWeekly,
    };
    return { ...this.streakData };
  }
}

export const streakService = new StreakService();
