import { Request, Response } from "express";
import { 
  getReservationByVehiculeAndUser, 
  getReservationById, 
  createReservationWithPayment,
  isVehicleAvailable,
  validatePayment
} from "../models/ReservationModel";
import { AuthRequest } from "../middlewares/UserMiddleware"; //Pour token JWS


// Voir infos réservation pour un véhicule
export async function viewReservation(req: Request, res: Response) {
  const { id_vehicule } = req.params;
  const id_user = req.user!.id; // ✅ venir du JWT
  
  const vehicleRes = await getReservationByVehiculeAndUser(Number(id_vehicule), Number(id_user));
  let paymentInfo = null;
  let tempsRestant = null;

  if (vehicleRes) {
    paymentInfo = await getReservationById(vehicleRes.id);
    if (paymentInfo?.payment_status === "initie") {
      const diffMs = new Date().getTime() - new Date(paymentInfo.created_at).getTime();
      tempsRestant = Math.max(0, 30*60*1000 - diffMs); // ms restant
    }
  }

  res.json({ reservation: vehicleRes, paymentInfo, tempsRestant });
}

// Initier réservation
export async function initReservation(req: AuthRequest, res: Response) {
  const { id_vehicule, date_debut, date_fin, montant } = req.body;
  const id_user = req.user!.id; // 🔥 vient du JWT

  const available = await isVehicleAvailable(id_vehicule, date_debut, date_fin);
  if (!available.disponible) {
    return res.status(400).json({
      message: "Véhicule indisponible",
      disponible_a_partir: available.disponible_a_partir
    });
  }

  const reservationId = await createReservationWithPayment(
    id_vehicule,
    id_user,
    date_debut,
    date_fin,
    montant
  );

  res.status(201).json({
    message: "Réservation initiée",
    reservationId
  });
}


// Valider paiement
export async function confirmPayment(req: Request, res: Response) {
  const { id_reservation } = req.body;
  await validatePayment(id_reservation);
  res.json({ message: "Paiement validé et réservation confirmée" });
}

