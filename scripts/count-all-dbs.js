/**
 * Atlas'ta hangi veritabaninda kac user var: npm run count:dbs
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

function normalizeMongoUri(raw) {
  let uri = String(raw || '').trim();
  if (uri.startsWith('MONGODB_URI=')) uri = uri.slice('MONGODB_URI='.length).trim();
  return uri;
}

/** Ayni cluster, farkli veritabani adi */
function uriWithDatabase(baseUri, dbName) {
  const u = new URL(baseUri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
  const auth =
    u.username && u.password
      ? `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}@`
      : '';
  const host = u.host;
  const proto = baseUri.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
  const qs = u.search ? u.search : '?retryWrites=true&w=majority';
  return `${proto}://${auth}${host}/${dbName}${qs.startsWith('?') ? qs : '?' + qs}`;
}

/** Render gibi: path'te veritabani yok */
function uriWithoutDatabase(baseUri) {
  const u = new URL(baseUri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
  const auth =
    u.username && u.password
      ? `${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}@`
      : '';
  const host = u.host;
  const proto = baseUri.startsWith('mongodb+srv') ? 'mongodb+srv' : 'mongodb';
  const qs = u.search || '?retryWrites=true&w=majority';
  return `${proto}://${auth}${host}/${qs.startsWith('?') ? qs : '?' + qs}`;
}

const userSchema = new mongoose.Schema({ email: String });
const User = mongoose.model('User', userSchema);

async function countInDb(uri, label) {
  await mongoose.disconnect().catch(() => {});
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 25000, family: 4 });
  const db = mongoose.connection.db.databaseName;
  const n = await User.countDocuments();
  console.log(`[${label}] veritabani="${db}" kullanici=${n}`);
  await mongoose.disconnect();
}

async function run() {
  const envUri = normalizeMongoUri(process.env.MONGODB_URI);
  if (!envUri) {
    console.error('.env icinde MONGODB_URI yok');
    process.exit(1);
  }

  await countInDb(envUri, 'PC .env');
  await countInDb(uriWithoutDatabase(envUri), 'DB adi YOK (Render hatasi gibi)');
  await countInDb(uriWithDatabase(envUri, 'focusnet'), 'focusnet');
  await countInDb(uriWithDatabase(envUri, 'test'), 'test');

  console.log('\nMobil kayitlari Render "DB yok" URI ile test veritabanina gider.');
  console.log('Render MONGODB_URI sonuna /focusnet ekleyin.');
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
