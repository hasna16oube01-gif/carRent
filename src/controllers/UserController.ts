import { Request, Response } from "express";
import bcrypt from "bcrypt"; //librarie pour hashage
import jwt from "jsonwebtoken"; //pour générer des tokens de sessions sécurisés
import { createUser, getUserByEmail } from "../models/UserModel";

// REGISTER (client uniquement)
export async function register(req: Request, res: Response) { 
  const { nom_utilisateur, email, mdp } = req.body;

  if (!email || !mdp) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const existingUser = await getUserByEmail(email);  
  if (existingUser) {
    return res.status(409).json({ message: "Utilisateur déjà existant" });
  }

  const hashedPassword = await bcrypt.hash(mdp, 10);
  await createUser(nom_utilisateur, email, hashedPassword);

  return res.status(201).json({ message: "Compte créé avec succès" });
}

// LOGIN (client ou admin)
export async function login(req: Request, res: Response) {
  const { email, mdp } = req.body;

  if (!email || !mdp) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const user = await getUserByEmail(email);
  if (!user || !user.mdp) { //on vérifie si user existe et si le mdp est vide
    return res.status(401).json({ message: "Identifiants invalides" });
  }

  const isValid = await bcrypt.compare(mdp, user.mdp);
  if (!isValid) {
    return res.status(401).json({ message: "Mot de pass invalide" });
  }

  const token = jwt.sign(
    { id: user.id_user, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" } // L'utilisateur a une heure avant de devoir se reconnecter
  );

  res.json({ token, role: user.role });
}
