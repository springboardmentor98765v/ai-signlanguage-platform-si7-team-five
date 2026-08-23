import { StreakDetails } from '../types';
import { apiBaseUrl } from '../utils/api';

class StreakService {
  private getHeaders() {
    const token = localStorage.getItem('asl_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Helper for empty streak structure when API fails or starts empty
  private emptyStreak(): StreakDetails {
    const today = new Date();
    // Build an empty week calendar ending today
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      week.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toISOString().split('T')[0],
        completed: false,
        isToday,
      });
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      todayCompleted: false,
      nextMilestoneDays: 7,
      nextMilestoneReward: '7-Day Master Badge',
      weeklyCalendar: week,
    };
  }

  async getStreakDetails(): Promise<StreakDetails> {
    try {
      const resp = await fetch(`${apiBaseUrl}/business/streak/me`, { headers: this.getHeaders() });
      if (!resp.ok) return this.emptyStreak();
      const data = await resp.json();
      
      const today = new Date();
      let todayCompleted = false;
      const week = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const isToday = i === 0;
        const dateStr = d.toISOString().split('T')[0];
        
        let completed = false;
        if (data.last_practice_date) {
           const lastPractice = new Date(data.last_practice_date + 'T00:00:00');
           if (lastPractice.toISOString().split('T')[0] === dateStr) {
               completed = true;
               if (isToday) todayCompleted = true;
           }
           // Simple approximation for past days logic based on streak
           else if (isToday) {
               // Did not practice today
           }
           else {
               const daysSinceLastPractice = Math.floor((today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));
               if (daysSinceLastPractice < i && data.current_streak >= (i - daysSinceLastPractice + 1)) {
                 completed = true;
               } else if (daysSinceLastPractice === i) {
                 completed = true; // this was the last practice date
               }
           }
        }
        
        week.push({
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dateStr: dateStr,
          completed: completed,
          isToday,
        });
      }
      
      return {
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        todayCompleted,
        nextMilestoneDays: 7 - ((data.current_streak || 0) % 7 || 7),
        nextMilestoneReward: 'Milestone Badge',
        weeklyCalendar: week,
      };
    } catch {
      return this.emptyStreak();
    }
  }

  async recordDailyPractice(): Promise<StreakDetails> {
    // Actually handled implicitly when the backend logs an attempt. 
    // This frontend method acts as a force-refresh.
    return this.getStreakDetails();
  }
}

export const streakService = new StreakService();
