import { Request, Response, NextFunction } from "express";

export const validateVehicleBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { marque, modele, prix_par_jour, image_url } = req.body;

  if (!marque || !modele || !prix_par_jour || !image_url) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  next();
};

// Pour update flexible, juste vérifier l'id
export const validateVehicleUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, ...fields } = req.body;

  if (!id) return res.status(400).json({ message: "ID requis" });
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "Au moins un champ à modifier requis" });
  }

  next();
};

// Pour delete
export const validateVehicleDelete = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID requis" });

  next();
};
