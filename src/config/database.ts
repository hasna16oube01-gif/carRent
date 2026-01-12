import mysql, { Pool } from 'mysql2/promise';

// On crée le pool(gestionnaire de connexions sql) qui engelobbe les information de la DB pour éviter de faire une connexion pour chaque requête
const pool = mysql.createPool({ //const pour rendre pool immuable
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true, //Les requêtes attendtent si toutes les connexions sont occupés
  connectionLimit: 10, // Nombre max de connexions instantané
  queueLimit: 0 //Nombre max de requêtes en attente 0: illimité
});

export default pool; //Pour rendre pool exploitable dans d'autre fichiers
