/**
 * MongoDB test: npm run check:mongo
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

function normalizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  if (uri.startsWith('MONGODB_URI=')) uri = uri.slice('MONGODB_URI='.length).trim();
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

const uri = normalizeMongoUri(process.env.MONGODB_URI);

if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
  console.error('HATA: .env içinde tek satır: MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

const opts = {
  serverSelectionTimeoutMS: 25000,
  family: 4,
};

async function run() {
  console.log('Bağlanılıyor:', uri.replace(/:[^:@/]+@/, ':****@'));
  await mongoose.connect(uri, opts);
  console.log('OK — MongoDB bağlantısı başarılı.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('Bağlantı hatası:', e.message);
  if (e.message.includes('timed out')) {
    console.error('\n→ Atlas Network Access: 0.0.0.0/0 ekle');
    console.error('→ Veya yerel: docker compose up -d ve .env: mongodb://127.0.0.1:27017/focusnet');
  }
  if (e.message.includes('authentication')) {
    console.error('\n→ Atlas Database Access: kullanıcı şifresini kontrol et');
  }
  if (e.message.includes('querySrv')) {
    console.error('\n→ .env.example içindeki Seçenek 2 (uzun mongodb:// satırı) kullan');
    console.error('→ replicaSet=atlas-w1vs86-shard-0 olmalı (piz2dze DEĞİL)');
  }
  process.exit(1);
});
