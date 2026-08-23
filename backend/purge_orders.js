require('dotenv').config();
const mongoose = require('mongoose');

async function purgeOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for order purge...");

    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
    const TableSession = mongoose.model('TableSession', new mongoose.Schema({}, { strict: false }));
    const Table = mongoose.model('Table', new mongoose.Schema({}, { strict: false }));

    const deletedOrders = await Order.deleteMany({});
    console.log(`Deleted ${deletedOrders.deletedCount} orders`);

    const deletedSessions = await TableSession.deleteMany({});
    console.log(`Deleted ${deletedSessions.deletedCount} table sessions`);

    const updatedTables = await Table.updateMany(
      {},
      { $set: { status: 'available', guestCount: 0 } }
    );
    console.log(`Reset ${updatedTables.modifiedCount} tables to AVAILABLE state`);

    console.log("\n✨ FRESH START COMPLETE! Database is 100% fresh with 0 orders.");
    process.exit(0);
  } catch (e) {
    console.error("Purge error:", e);
    process.exit(1);
  }
}

purgeOrders();
