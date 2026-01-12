"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationWithPayment = createReservationWithPayment;
exports.getReservationByVehiculeAndUser = getReservationByVehiculeAndUser;
exports.getPaymentByReservation = getPaymentByReservation;
exports.isVehicleAvailable = isVehicleAvailable;
exports.validatePayment = validatePayment;
exports.expirePendingPayments = expirePendingPayments;
const database_ts_1 = __importDefault(require("../config/database.ts"));
// --- Création d'une réservation + paiement ---
async function createReservationWithPayment(id_vehicule, id_user, date_debut, date_fin, montant) {
    const conn = await database_ts_1.default.getConnection();
    try {
        await conn.beginTransaction();
        const [resResult] = await conn.query("INSERT INTO reservations (id_vehicule, id_user, date_debut, date_fin, status) VALUES (?, ?, ?, ?, 'en_attente')", [id_vehicule, id_user, date_debut, date_fin]);
        const reservationId = resResult.insertId;
        await conn.query("INSERT INTO paiements (id_reservation, montant, status, created_at) VALUES (?, ?, 'initie', NOW())", [reservationId, montant]);
        await conn.commit();
        return reservationId;
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
}
// --- Récupérer une réservation par véhicule et utilisateur ---
async function getReservationByVehiculeAndUser(id_vehicule, id_user) {
    const [rows] = await database_ts_1.default.query("SELECT * FROM reservations WHERE id_vehicule = ? AND id_user = ? AND status IN ('en_attente','confirmee')", [id_vehicule, id_user]);
    return rows[0];
}
// --- Récupérer le paiement associé ---
async function getPaymentByReservation(id_reservation) {
    const [rows] = await database_ts_1.default.query("SELECT * FROM paiements WHERE id_reservation = ?", [id_reservation]);
    return rows[0];
}
// --- Vérifier la disponibilité d'un véhicule ---
async function isVehicleAvailable(id_vehicule, date_debut, date_fin) {
    const [rows] = await database_ts_1.default.query(`SELECT r.date_fin, r.status AS reservation_status, p.status AS paiement_status, p.created_at
     FROM reservations r
     LEFT JOIN paiements p ON r.id_reservation = p.id_reservation
     WHERE r.id_vehicule = ?
       AND ((? BETWEEN r.date_debut AND r.date_fin) 
         OR (? BETWEEN r.date_debut AND r.date_fin)
         OR (r.date_debut BETWEEN ? AND ?))`, [id_vehicule, date_debut, date_fin, date_debut, date_fin]);
    if (rows.length === 0)
        return { disponible: true };
    // Vérifier si toutes les réservations bloquantes ont expiré
    const now = new Date();
    for (const r of rows) {
        if (r.reservation_status === "confirmee")
            return { disponible: false, disponible_a_partir: r.date_fin };
        if (r.reservation_status === "en_attente" && r.paiement_status === "initie") {
            const created = new Date(r.created_at);
            const diffMs = now.getTime() - created.getTime();
            if (diffMs <= 30 * 60 * 1000)
                return { disponible: false, disponible_a_partir: r.date_fin };
        }
    }
    return { disponible: true };
}
// --- Valider un paiement ---
async function validatePayment(id_reservation) {
    const conn = await database_ts_1.default.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query("UPDATE paiements SET status = 'valide' WHERE id_reservation = ?", [id_reservation]);
        await conn.query("UPDATE reservations SET status = 'confirmee' WHERE id_reservation = ?", [id_reservation]);
        await conn.commit();
    }
    catch (err) {
        await conn.rollback();
        throw err;
    }
    finally {
        conn.release();
    }
}
// --- Expirer les paiements non validés après 30 minutes ---
async function expirePendingPayments() {
    const [rows] = await database_ts_1.default.query(`SELECT r.id_reservation, p.created_at 
     FROM reservations r
     JOIN paiements p ON r.id_reservation = p.id_reservation
     WHERE r.status = 'en_attente' AND p.status = 'initie'`);
    const now = new Date();
    for (const r of rows) {
        const created = new Date(r.created_at);
        const diffMs = now.getTime() - created.getTime();
        if (diffMs > 30 * 60 * 1000) {
            await database_ts_1.default.query("UPDATE paiements SET status = 'echoue' WHERE id_reservation = ?", [r.id_reservation]);
            await database_ts_1.default.query("UPDATE reservations SET status = 'terminee' WHERE id_reservation = ?", [r.id_reservation]);
        }
    }
}
