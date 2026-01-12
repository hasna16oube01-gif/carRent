import pool from "../config/database.ts";

export interface Vehicle {
  id: number;
  marque: string;
  modele: string;
  disponible?: boolean;
  disponible_a_partir?: string; // si occupé
  prix_par_jour: number;
  image_url: string;
}

// Récupérer tous les véhicules avec disponibilité calculée
export async function getVehiclesWithAvailability(): Promise<Vehicle[]> {
  const [rows] = await pool.query(
    `
    SELECT 
      v.id_vehicule,
      v.marque,
      v.modele,
      v.prix_par_jour,
      v.image_url,

      CASE
        WHEN NOT EXISTS (
          SELECT 1
          FROM reservations r
          WHERE r.id_vehicule = v.id_vehicule
            AND r.statut IN ('initiee', 'confirmee')
            AND NOW() BETWEEN r.date_debut AND r.date_fin
        )
        THEN 1
        ELSE 0
      END AS disponible,

      (
        SELECT MIN(r2.date_fin)
        FROM reservations r2
        WHERE r2.id_vehicule = v.id_vehicule
          AND r2.statut IN ('initiee', 'confirmee')
          AND r2.date_fin > NOW()
      ) AS disponible_a_partir

    FROM vehicules v
    `
  );

  return rows as Vehicle[];
}

// Ajouter un véhicule (admin)
export async function addVehicle(marque: string, modele: string, prix_par_jour: number, image_url: string): Promise<number> {
  const [result] = await pool.query(
    "INSERT INTO vehicules (marque, modele, prix_par_jour, image_url) VALUES (?, ?, ?, ?)",
    [marque, modele, prix_par_jour, image_url]
  );
  return (result as any).insertId;
}

// Modifier un véhicule de manière flexible
export async function updateVehicleFlexible(id: number, fields: Partial<{ marque: string; modele: string; prix_par_jour: number; image_url: string }>): Promise<void> {
  const keys = Object.keys(fields);
  if (keys.length === 0) return; // rien à modifier

  const values = Object.values(fields);
  const setClause = keys.map(k => `${k} = ?`).join(", ");

  await pool.query(
    `UPDATE vehicules SET ${setClause} WHERE id_vehicule = ?`,
    [...values, id]
  );
}

// Supprimer un véhicule (revoir cette fonction)
export async function deleteVehicle(id: number): Promise<void> {
  await pool.query(
    "DELETE FROM vehicules WHERE id_vehicule = ?", 
    [id]);
}
