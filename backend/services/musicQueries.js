const languageLabels = {
  hindi: 'Hindi Indian',
  pakistani: 'Pakistani',
  mixed: 'Hindi Pakistani',
};

const moodLabels = {
  Happy: 'happy uplifting feel good',
  Calm: 'calm peaceful soothing',
  Okay: 'easy listening relaxed',
  Sad: 'emotional reflective',
  Angry: 'grounding slow release',
  Anxious: 'calming relaxing meditation',
  Tired: 'sleep ambient peaceful',
};

function buildMusicQuery({ emotion = 'Okay', intensity = 5, language = 'mixed', type = 'songs' }) {
  const languageLabel = languageLabels[language] || languageLabels.mixed;
  const moodLabel = moodLabels[emotion] || moodLabels.Okay;
  const typeLabel = type === 'ambient' ? 'ambient soundscape' : type === 'instrumental' ? 'instrumental' : 'song';
  const intensityLabel = intensity >= 8 && ['Angry', 'Anxious'].includes(emotion) ? 'gentle slow' : '';
  return `${languageLabel} ${moodLabel} ${intensityLabel} ${typeLabel} official`.replace(/\s+/g, ' ').trim();
}

module.exports = { buildMusicQuery };
