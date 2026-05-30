/**
 * Redis test: npm run check:redis
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Redis = require('ioredis');

const url = (process.env.REDIS_URL || 'redis://127.0.0.1:6379').trim();

async function run() {
  console.log('Bağlanılıyor:', url.replace(/:[^:@/]+@/, ':****@'));
  const redis = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 8000 });
  const pong = await redis.ping();
  if (pong !== 'PONG') throw new Error('Beklenmeyen ping yanıtı');
  console.log('OK — Redis bağlantısı başarılı.');
  await redis.quit();
}

run().catch((e) => {
  console.error('Bağlantı hatası:', e.message);
  console.error('\n→ Redis başlat: docker compose up -d redis');
  console.error('→ .env: REDIS_URL=redis://127.0.0.1:6379');
  process.exit(1);
});
