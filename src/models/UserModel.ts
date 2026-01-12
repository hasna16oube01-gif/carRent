import pool from "../config/database.ts"; //Appeler le fichier définissant le pool sql

export interface User { //On définit l'interface User pour utiliser ses classes
  id: number;
  nom_utilisateur: string;
  email: string;
  mdp?: string; // présent uniquement pour login/register
  role: "client" | "admin"; //Union des deux types
}

// Récupére email et mdp haché pour vérifier l'utilisateur lors du login 
export async function getUserByEmail(email: string): Promise<User | undefined> { //On définit deux résultats: soit on trouver un User ou la fonction retourne undefined
  const [rows] = await pool.query( //Sql retourne données sous forme [rows, fields] donc [rows permet de séléctionner ce que nous intéresse sinon on définit une variable result et on prend le premier élément
    "SELECT id_user, email, mdp, role FROM users WHERE email = ?",
    [email]
  );
  return (rows as User[])[0]; //as User pour dire à typeScript que rows a la même forme que User, on prend le premier car SQL rend toujours un tableau même si y a qu'un seul élément
}

// Créer un utilisateur client (register)
export async function createUser(nom_utilisateur: string, email: string, hashedPassword: string): Promise<number> {
  const [result] = await pool.query(
    "INSERT INTO users (nom_utilisateur, email, mdp, role) VALUES (?, ?, ?, 'client')",
    [nom_utilisateur, email, hashedPassword]
  );
  return (result as any).insertId; //cette ligne ne sert que si on veut creer un JWT car elle retourne l'id généré de User crée, donc on peut l'omettre dans ce code mais laissons la, si on l'omet on met Prmoise<void>
}

// Récupérer un utilisateur par ID (utilisable au cas des id généré par JWT) //on l'utilise pas pour le moment
export async function getUserById(id: number): Promise<User | undefined> {
  const [rows] = await pool.query(
    "SELECT id_user, email, role FROM users WHERE id_user = ?",
    [id]
  );
  return (rows as User[])[0];
}

