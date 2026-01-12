import { Router } from "express";
import {
  viewReservation,
  initReservation,
  confirmPayment
} from "../controllers/ReservationController";
import { authUser } from "../middlewares/UserMiddleware";
import { validateReservation } from "../middlewares/ReservationMiddleware";

const router = Router();

/**
 * Voir sa réservation pour un véhicule
 * - Route protégée : utilisateur connecté
 * - id_user est pris depuis JWT
 */
router.get(
  "/:id_vehicule",
  authUser,
  viewReservation
);

/**
 * Initier une réservation + paiement
 * - Route protégée : utilisateur connecté
 * - validateReservation middleware vérifie la validité du body
 */
router.post(
  "/",
  authUser,
  validateReservation,
  initReservation
);

/**
 * Valider un paiement
 * - Route protégée : utilisateur connecté
 * - Optionnel : vérifier que l'utilisateur possède la réservation
 */
router.post(
  "/confirm",
  authUser,
  confirmPayment
);

export default router;
