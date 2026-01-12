import express from "express";
import cors from "cors"; // Pour que le navigateur traite les deux port d'un seul
import path from "path";


import userRoutes from "./routes/UserRoute";
import vehiculeRoutes from "./routes/VehiculeRoute";
import reservationRoutes from "./routes/ReservationRoute";

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads', 'vehicules')));

app.use(cors()); // Autorise au frontend à parler au backend

app.use(express.json());

// ici on met les routes crées
app.use("/users", userRoutes);
app.use("/vehicules", vehiculeRoutes);
app.use("/reservations", reservationRoutes);


export default app;

