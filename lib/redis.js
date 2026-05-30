const Redis = require('ioredis');

const LEADERBOARD_TOP_KEY = 'focusnet:leaderboard:top';
const LEADERBOARD_TOP_TTL_SEC = 60;

let client = null;
let redisEnabled = false;

function redisUrl() {
  return (process.env.REDIS_URL || 'redis://127.0.0.1:6379').trim();
}

function isRedisEnabled() {
  return redisEnabled;
}

function getRedis() {
  if (!client || !redisEnabled) throw new Error('Redis kullanılamıyor');
  return client;
}

async function connectRedis() {
  if (process.env.REDIS_DISABLED === '1') {
    redisEnabled = false;
    return false;
  }

  try {
    client = new Redis(redisUrl(), {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    client.on('error', () => {});
    const pong = await client.ping();
    redisEnabled = pong === 'PONG';
    if (!redisEnabled) await disconnectRedis();
    return redisEnabled;
  } catch {
    redisEnabled = false;
    client = null;
    return false;
  }
}

async function redisPing() {
  if (!redisEnabled || !client) return false;
  try {
    return (await client.ping()) === 'PONG';
  } catch {
    return false;
  }
}

async function getCachedLeaderboardTop() {
  if (!redisEnabled) return null;
  try {
    const raw = await getRedis().get(LEADERBOARD_TOP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function setCachedLeaderboardTop(top) {
  if (!redisEnabled) return;
  try {
    await getRedis().set(
      LEADERBOARD_TOP_KEY,
      JSON.stringify(top),
      'EX',
      LEADERBOARD_TOP_TTL_SEC
    );
  } catch {
    /* önbellek isteğe bağlı */
  }
}

async function invalidateLeaderboardCache() {
  if (!redisEnabled) return;
  try {
    await getRedis().del(LEADERBOARD_TOP_KEY);
  } catch {
    /* önbellek isteğe bağlı */
  }
}

async function disconnectRedis() {
  if (client) {
    try {
      await client.quit();
    } catch {
      /* */
    }
    client = null;
  }
  redisEnabled = false;
}

module.exports = {
  connectRedis,
  disconnectRedis,
  getCachedLeaderboardTop,
  setCachedLeaderboardTop,
  invalidateLeaderboardCache,
  redisPing,
  isRedisEnabled,
  redisUrl,
  LEADERBOARD_TOP_KEY,
};
