const recommendations = {
  Happy: {
    title: 'Keep the light moving',
    description: 'Capture one thing that made today feel good.',
    action: 'Write a gratitude note',
  },
  Calm: {
    title: 'Stay with this calm',
    description: 'Take a quiet minute to notice what is helping you feel steady.',
    action: 'Write a reflection',
  },
  Okay: {
    title: 'Make space to check in',
    description: 'A short reflection can reveal what your day needs next.',
    action: 'Reflect for a moment',
  },
  Sad: {
    title: 'Let the feeling be seen',
    description: 'Writing a few honest words can make a heavy moment feel less alone.',
    action: 'Write it down',
  },
  Angry: {
    title: 'Create a little distance',
    description: 'Slow your breathing and name what is underneath the heat.',
    action: 'Start a mindful pause',
  },
  Anxious: {
    title: 'Return to the present',
    description: 'A gentle breathing exercise can help your body find a steadier rhythm.',
    action: 'Start breathing',
  },
  Tired: {
    title: 'Protect your energy',
    description: 'Release the pressure to solve everything and prepare for rest.',
    action: 'Write a quiet note',
  },
};

export function getRecommendation(emotion, intensity) {
  const recommendation = recommendations[emotion] || recommendations.Okay;
  if (intensity >= 8 && (emotion === 'Angry' || emotion === 'Anxious')) {
    return {
      ...recommendation,
      title: 'Take one slow minute',
      description: 'Let the intensity come down before deciding what you need next.',
      action: 'Start breathing',
    };
  }
  return recommendation;
}
