import pool from "../config/database.ts";

export interface Reservation {
  id: number;
  id_vehicule: number;
  id_user: number;
  date_debut: string;
  date_fin: string;
  status: "en attente" | "confirmee" | "terminee";
}

export interface Payment {
  id_reservation: number;
  montant: number;
  status: "initie" | "valide" | "echoue";
  created_at: string;
}

// --- Création d'une réservation + paiement ---
export async function createReservationWithPayment(
  id_vehicule: number,
  id_user: number,
  date_debut: string,
  date_fin: string,
  montant: number
): Promise<number> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [resResult] = await conn.query(
      "INSERT INTO reservations (id_vehicule, id_user, date_debut, date_fin, statut) VALUES (?, ?, ?, ?, 'en attente')",
      [id_vehicule, id_user, date_debut, date_fin]
    );
    const reservationId = (resResult as any).insertId;

    await conn.query(
      "INSERT INTO payment (id_reservation, montant, statut, created_at) VALUES (?, ?, 'initie', NOW())",
      [reservationId, montant]
    );

    await conn.commit();
    return reservationId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// --- Récupérer une réservation par véhicule et utilisateur ---
export async function getReservationByVehiculeAndUser(id_vehicule: number, id_user: number): Promise<Reservation | undefined> {
  const [rows] = await pool.query(
    "SELECT * FROM reservations WHERE id_vehicule = ? AND id_user = ? AND statut IN ('en attente','confirmee')",
    [id_vehicule, id_user]
  );
  return (rows as Reservation[])[0];
}

// --- Récupérer le paiement associé ---
export async function getReservationById(id_reservation: number) {
    const [rows] = await pool.query(
        "SELECT r.*, p.montant, p.statut as payment_status, p.created_at FROM reservations r JOIN payment p ON r.id_reservation = p.id_reservation WHERE r.id_reservation = ?",
        [id_reservation]
    );
    return (rows as any)[0];
}

// --- Vérifier la disponibilité d'un véhicule ---
export async function isVehicleAvailable(id_vehicule: number, date_debut: string, date_fin: string): Promise<{disponible: boolean, disponible_a_partir?: string}> {
  const [rows] = await pool.query(
    `SELECT r.date_fin, r.statut AS reservation_statut, p.statut AS payment_statut, p.created_at
     FROM reservations r
     LEFT JOIN payment p ON r.id_reservation = p.id_reservation
     WHERE r.id_vehicule = ?
       AND ((? BETWEEN r.date_debut AND r.date_fin) 
         OR (? BETWEEN r.date_debut AND r.date_fin)
         OR (r.date_debut BETWEEN ? AND ?))`,
    [id_vehicule, date_debut, date_fin, date_debut, date_fin]
  );

  if ((rows as any).length === 0) return { disponible: true };

  // Vérifier si toutes les réservations bloquantes ont expiré
  const now = new Date();
  for (const r of rows as any[]) {
    if (r.reservation_status === "confirmee") return { disponible: false, disponible_a_partir: r.date_fin };
    if (r.reservation_status === "en attente" && r.paiement_status === "initie") {
      const created = new Date(r.created_at);
      const diffMs = now.getTime() - created.getTime();
      if (diffMs <= 30*60*1000) return { disponible: false, disponible_a_partir: r.date_fin };
    }
  }
  return { disponible: true };
}

// --- Valider un paiement ---
export async function validatePayment(id_reservation: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE payment SET statut = 'valide' WHERE id_reservation = ?",
      [id_reservation]
    );

    await conn.query(
      "UPDATE reservations SET statut = 'confirmee' WHERE id_reservation = ?",
      [id_reservation]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// --- Expirer les paiements non validés après 30 minutes ---
export async function expirePendingPayments(): Promise<void> {
  const [rows] = await pool.query(
    `SELECT r.id_reservation, p.created_at 
     FROM reservations r
     JOIN payment p ON r.id_reservation = p.id_reservation
     WHERE r.statut = 'en attente' AND p.statut = 'initie'`
  );

  const now = new Date();
  for (const r of rows as any[]) {
    const created = new Date(r.created_at);
    const diffMs = now.getTime() - created.getTime();
    if (diffMs > 30*60*1000) {
      await pool.query("UPDATE payment SET statut = 'echoue' WHERE id_reservation = ?", [r.id_reservation]);
      await pool.query("UPDATE reservations SET statut = 'terminee' WHERE id_reservation = ?", [r.id_reservation]);
    }
  }
}
