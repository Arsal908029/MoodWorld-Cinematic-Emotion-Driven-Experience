async function searchYouTube({ query, excludeVideoIds = [] }) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    const error = new Error('YouTube music is not configured. Add YOUTUBE_API_KEY to the backend environment.');
    error.statusCode = 503;
    throw error;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '25',
    videoEmbeddable: 'true',
    q: query,
    key: apiKey,
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'YouTube search failed.');
    error.statusCode = response.status;
    throw error;
  }

  const excluded = new Set(excludeVideoIds);
  const results = (data.items || [])
    .filter((item) => item.id?.videoId && !excluded.has(item.id.videoId))
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet?.title || 'Mood soundtrack',
      channelTitle: item.snippet?.channelTitle || 'YouTube',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

  if (!results.length) {
    const error = new Error('No fresh songs were found for this mood.');
    error.statusCode = 404;
    throw error;
  }
  return results[Math.floor(Math.random() * results.length)];
}

module.exports = { searchYouTube };
