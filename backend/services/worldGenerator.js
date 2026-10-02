// backend/services/worldGenerator.js
const MOOD_ENVIRONMENT_MATRIX = {
  Happy:   { weather: 'Sunny',   lighting: 'bright',   musicCategory: 'Happy',  defaultEnv: 'Garden' },
  Calm:    { weather: 'Rainbow', lighting: 'soft',     musicCategory: 'Relax',  defaultEnv: 'Beach' },
  Okay:    { weather: 'Cloudy',  lighting: 'neutral',  musicCategory: 'Focus',  defaultEnv: 'Forest' },
  Sad:     { weather: 'Rainy',   lighting: 'gloomy',   musicCategory: 'Sleep',  defaultEnv: 'Forest' },
  Angry:   { weather: 'Stormy',  lighting: 'dramatic', musicCategory: 'Energy', defaultEnv: 'City' },
  Anxious: { weather: 'Foggy',   lighting: 'foggy',    musicCategory: 'Relax',  defaultEnv: 'Mountains' },
  Tired:   { weather: 'Snowy',   lighting: 'dim',      musicCategory: 'Sleep',  defaultEnv: 'Space' }
};

function generateWorldFromMood(emotion, intensity) {
  const baseConfig = MOOD_ENVIRONMENT_MATRIX[emotion] || MOOD_ENVIRONMENT_MATRIX.Okay;

  return {
    weather: baseConfig.weather,
    environment: baseConfig.defaultEnv,
    lighting: baseConfig.lighting,
    fogDensity: intensity > 6 ? 'high' : 'low',
    rainIntensity: (emotion === 'Sad' || emotion === 'Angry') ? intensity / 10 : 0,
    musicCategory: baseConfig.musicCategory
  };
}

module.exports = { generateWorldFromMood };