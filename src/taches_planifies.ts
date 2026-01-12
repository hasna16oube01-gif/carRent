import cron from "node-cron";
import { expirePendingPayments } from "./models/ReservationModel";

cron.schedule("*/5 * * * *", async () => {
  try {
    await expirePendingPayments();
    console.log(`[${new Date().toISOString()}] Pending payments expired successfully`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error expiring pending payments:`, err);
  }
});
