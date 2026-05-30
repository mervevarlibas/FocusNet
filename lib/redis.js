const Redis = require('ioredis');

const LEADERBOARD_TOP_KEY = 'focusnet:leaderboard:top';
const LEADERBOARD_TOP_TTL_SEC = 60;

let client = null;

function redisUrl() {
  return (process.env.REDIS_URL || 'redis://127.0.0.1:6379').trim();
}

function getRedis() {
  if (!client) throw new Error('Redis henüz bağlanmadı');
  return client;
}

async function connectRedis() {
  client = new Redis(redisUrl(), {
    maxRetriesPerRequest: 2,
    connectTimeout: 8000,
  });

  client.on('error', (err) => {
    console.error('Redis hatası:', err.message);
  });

  const pong = await client.ping();
  if (pong !== 'PONG') throw new Error('Redis ping başarısız');
  return client;
}

async function redisPing() {
  if (!client) return false;
  try {
    return (await client.ping()) === 'PONG';
  } catch {
    return false;
  }
}

async function getCachedLeaderboardTop() {
  const raw = await getRedis().get(LEADERBOARD_TOP_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

async function setCachedLeaderboardTop(top) {
  await getRedis().set(
    LEADERBOARD_TOP_KEY,
    JSON.stringify(top),
    'EX',
    LEADERBOARD_TOP_TTL_SEC
  );
}

async function invalidateLeaderboardCache() {
  await getRedis().del(LEADERBOARD_TOP_KEY);
}

async function disconnectRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  getCachedLeaderboardTop,
  setCachedLeaderboardTop,
  invalidateLeaderboardCache,
  redisPing,
  redisUrl,
  LEADERBOARD_TOP_KEY,
};
