import dotenv from 'dotenv';
dotenv.config();
import cron from "node-cron"; //Pour planifier la vérification des véhicules dispo
import { expirePendingPayments } from "./models/ReservationModel";


import app from './app';


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/* test temporaire*/
import pool from './config/database';

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('MySQL connection OK');
  } catch (error) {
    console.error('MySQL connection FAILED', error);
  }
})();


//Vérification chaque 5min
cron.schedule("*/5 * * * *", async () => {
  try {
    await expirePendingPayments();
    console.log(`[${new Date().toISOString()}] Pending payments expired successfully`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error expiring pending payments:`, err);
  }
});
