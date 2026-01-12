import { Request, Response } from "express";
import { getVehiclesWithAvailability, addVehicle, updateVehicleFlexible, deleteVehicle } from "../models/VehiculeModel";

// Client → voir véhicules disponibles
export async function viewVehicles(req: Request, res: Response) {
  const vehicles = await getVehiclesWithAvailability();
  res.json(vehicles);
}

// Admin → ajouter véhicule
export async function createVehicle(req: Request, res: Response) {
  const { marque, modele, prix_par_jour, image_url } = req.body;
  if (!marque || !modele || !prix_par_jour || !image_url) 
    return res.status(400).json({ message: "Tous les champs sont requis" });

  const id = await addVehicle(marque, modele, prix_par_jour, image_url);
  res.status(201).json({ message: "Véhicule ajouté", id });
}

// Admin → modifier véhicule de façon flexible
export async function modifyVehicleFlexible(req: Request, res: Response) {
  const { id, ...fields } = req.body;

  if (!id) return res.status(400).json({ message: "ID requis" });
  if (Object.keys(fields).length === 0)
    return res.status(400).json({ message: "Au moins un champ à modifier requis" });

  await updateVehicleFlexible(id, fields);
  res.json({ message: "Véhicule modifié" });
}

// Admin → supprimer véhicule
export async function removeVehicle(req: Request, res: Response) {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "ID requis" });

  await deleteVehicle(id);
  res.json({ message: "Véhicule supprimé" });
}
