"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewVehicles = viewVehicles;
exports.createVehicle = createVehicle;
exports.modifyVehicleFlexible = modifyVehicleFlexible;
exports.removeVehicle = removeVehicle;
const VehiculeModel_1 = require("../models/VehiculeModel");
// Client → voir véhicules disponibles
async function viewVehicles(req, res) {
    const vehicles = await (0, VehiculeModel_1.getVehiclesWithAvailability)();
    res.json(vehicles);
}
// Admin → ajouter véhicule
async function createVehicle(req, res) {
    const { marque, modele, prix_par_jour, image_url } = req.body;
    if (!marque || !modele || !prix_par_jour || !image_url)
        return res.status(400).json({ message: "Tous les champs sont requis" });
    const id = await (0, VehiculeModel_1.addVehicle)(marque, modele, prix_par_jour, image_url);
    res.status(201).json({ message: "Véhicule ajouté", id });
}
// Admin → modifier véhicule de façon flexible
async function modifyVehicleFlexible(req, res) {
    const { id, ...fields } = req.body;
    if (!id)
        return res.status(400).json({ message: "ID requis" });
    if (Object.keys(fields).length === 0)
        return res.status(400).json({ message: "Au moins un champ à modifier requis" });
    await (0, VehiculeModel_1.updateVehicleFlexible)(id, fields);
    res.json({ message: "Véhicule modifié" });
}
// Admin → supprimer véhicule
async function removeVehicle(req, res) {
    const { id } = req.body;
    if (!id)
        return res.status(400).json({ message: "ID requis" });
    await (0, VehiculeModel_1.deleteVehicle)(id);
    res.json({ message: "Véhicule supprimé" });
}
