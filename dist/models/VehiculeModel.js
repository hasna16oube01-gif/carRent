"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehiclesWithAvailability = getVehiclesWithAvailability;
exports.addVehicle = addVehicle;
exports.updateVehicleFlexible = updateVehicleFlexible;
exports.deleteVehicle = deleteVehicle;
const database_ts_1 = __importDefault(require("../config/database.ts"));
// Récupérer tous les véhicules avec disponibilité calculée
async function getVehiclesWithAvailability() {
    const [rows] = await database_ts_1.default.query(`SELECT v.id_vehicule, v.marque, v.modele, v.prix_par_jour, v.image_url,
            CASE 
                WHEN MAX(r.date_fin) < NOW() OR MAX(r.date_fin) IS NULL THEN 1
                ELSE 0
            END AS disponible,
            MAX(r.date_fin) AS disponible_a_partir
     FROM vehicules v
     LEFT JOIN reservations r ON v.id_vehicule = r.id_vehicule
     GROUP BY v.id_vehicule, v.marque, v.modele, v.prix_par_jour, v.image_url`);
    return rows;
}
// Ajouter un véhicule (admin)
async function addVehicle(marque, modele, prix_par_jour, image_url) {
    const [result] = await database_ts_1.default.query("INSERT INTO vehicules (marque, modele, prix_par_jour, image_url) VALUES (?, ?, ?, ?)", [marque, modele, prix_par_jour, image_url]);
    return result.insertId;
}
// Modifier un véhicule de manière flexible
async function updateVehicleFlexible(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0)
        return; // rien à modifier
    const values = Object.values(fields);
    const setClause = keys.map(k => `${k} = ?`).join(", ");
    await database_ts_1.default.query(`UPDATE vehicules SET ${setClause} WHERE id_vehicule = ?`, [...values, id]);
}
// Supprimer un véhicule (admin)
async function deleteVehicle(id) {
    await database_ts_1.default.query("DELETE FROM vehicules WHERE id_vehicule = ?", [id]);
}
