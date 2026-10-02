import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import theme, { currentTimeOfDay } from '../theme/moodWorldTheme';

const WorldContext = createContext(null);

const defaultWorld = {
  emotion: 'Okay',
  intensity: 5,
  timeOfDay: currentTimeOfDay(),
  previousEmotion: 'Okay',
};

export function WorldProvider({ children }) {
  const [worldState, setWorldState] = useState(defaultWorld);

  const updateWorld = useCallback((next = {}) => {
    setWorldState((current) => {
      const nextEmotion = next.emotion ?? current.emotion;
      const nextIntensity = next.intensity ?? current.intensity;
      const nextTimeOfDay = next.timeOfDay ?? current.timeOfDay;

      return {
        emotion: nextEmotion,
        intensity: nextIntensity,
        timeOfDay: nextTimeOfDay,
        previousEmotion: current.emotion,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      ...worldState,
      updateWorld,
    }),
    [worldState, updateWorld]
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const context = useContext(WorldContext);

  if (!context) {
    throw new Error('useWorld must be used inside a WorldProvider');
  }

  return context;
}

export function updateWorldStateFromMood(emotion, intensity, timeOfDay = currentTimeOfDay()) {
  return {
    emotion,
    intensity,
    timeOfDay,
    previousEmotion: theme.moods[emotion] ? 'Okay' : 'Okay',
  };
}
