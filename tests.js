"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReservationModel_1 = require("./models/ReservationModel");
async function testReservationFlow() {
    try {
        const idVehicule = 1; // véhicule à tester
        const idUser = 42; // utilisateur test
        const dateDebut = "2025-12-31";
        const dateFin = "2026-01-03";
        const montant = 150;
        console.log("1️⃣ Création de la réservation avec paiement initie...");
        const reservationId = await (0, ReservationModel_1.createReservationWithPayment)(idVehicule, idUser, dateDebut, dateFin, montant);
        console.log(`✅ Réservation créée avec ID: ${reservationId}`);
        console.log("\n2️⃣ Vérification des statuts initiaux...");
        const reservationInitial = await (0, ReservationModel_1.getReservationByVehicleAndUser)(idVehicule, idUser);
        const paymentInitial = reservationInitial ? await (0, ReservationModel_1.getPaymentByReservation)(reservationInitial.id) : null;
        console.log("Reservation status:", reservationInitial?.status);
        console.log("Payment status:", paymentInitial?.status);
        console.log("\n3️⃣ Validation du paiement...");
        if (reservationInitial) {
            await (0, ReservationModel_1.validatePayment)(reservationInitial.id);
        }
        console.log("\n4️⃣ Vérification des statuts après validation...");
        const reservationFinal = await (0, ReservationModel_1.getReservationByVehicleAndUser)(idVehicule, idUser);
        const paymentFinal = reservationFinal ? await (0, ReservationModel_1.getPaymentByReservation)(reservationFinal.id) : null;
        console.log("Reservation status:", reservationFinal?.status);
        console.log("Payment status:", paymentFinal?.status);
        console.log("\n🎉 Test terminé !");
    }
    catch (err) {
        console.error("Erreur pendant le test :", err);
    }
}
// Exécution du test
testReservationFlow();
