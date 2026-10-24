import { initMongoDatabase } from '../src/backend/persistence/mongoInit';

async function run() {
  console.log('🍃 Connecting to MongoDB and verifying collections...');
  const result = await initMongoDatabase();

  if (result.connected) {
    console.log(`✅ Successfully connected to MongoDB database [${result.dbName}]!`);
    if (result.collectionsSeeded && result.collectionsSeeded > 0) {
      console.log(`📦 Seeded ${result.collectionsSeeded} canonical college cases (GIITS, COEP, PDIMTR, EVIT, VJTI).`);
    } else {
      console.log('📦 Verified existing collections & indexes. Database is ready.');
    }
    process.exit(0);
  } else {
    console.error(`❌ MongoDB connection failed: ${result.reason}`);
    console.log('ℹ️ Ensure MongoDB is running on mongodb://127.0.0.1:27017 or set MONGODB_URI.');
    process.exit(1);
  }
}

run();
