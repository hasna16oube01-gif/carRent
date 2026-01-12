import { Request, Response, NextFunction } from "express";

export const validateReservation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_vehicule, date_debut, date_fin, montant } = req.body;

  if (!id_vehicule || !date_debut || !date_fin || !montant) {
    return res.status(400).json({
      message: "Données de réservation incomplètes"
    });
  }

  next();
};
