export const achievementCatalog = [
  {
    id: 'first-check-in',
    title: 'First Sky',
    badge: '🌤️',
    description: 'Complete your first mood check-in.',
    condition: (user, history = []) => (history.length || 0) >= 1,
  },
  {
    id: 'steady-breather',
    title: 'Steady Breather',
    badge: '🫁',
    description: 'Log 3 calm check-ins in a row.',
    condition: (user, history = []) => history.filter((entry) => entry.emotion === 'Calm').length >= 3,
  },
  {
    id: 'seven-day-sky',
    title: '7-Day Sky',
    badge: '🔥',
    description: 'Build a 7-day streak.',
    condition: (user) => (user?.streak || 0) >= 7,
  },
  {
    id: 'bright-morning',
    title: 'Bright Morning',
    badge: '☀️',
    description: 'Log a happy mood at intensity 8 or higher.',
    condition: (user, history = []) => history.some((entry) => entry.emotion === 'Happy' && entry.intensity >= 8),
  },
];

export function computeAchievements(user, history = []) {
  return achievementCatalog
    .filter((item) => item.condition(user, history))
    .map((item) => ({
      id: item.id,
      title: item.title,
      badge: item.badge,
      description: item.description,
      unlockedAt: new Date().toISOString(),
    }));
}
