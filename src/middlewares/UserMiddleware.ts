import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extension de Request de express pour inclure user
export interface AuthRequest extends Request { //maintenant req.user donne {id,role}
  user?: {
    id: number; // id généré par JWT
    role: "client" | "admin";
  };
}

// Middleware d’authentification JWT qui sert à vérifier que l'utilisateur esr connecté
export const authUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization; // l'autorization est sous forme "Bearer Token"

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Format du token invalide" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: "client" | "admin";
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next(); // sans next la requête précédante reste bloquée
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour vérifier le rôle admin si nécessaire
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé : admin uniquement" });
  }
  next(); // si admin passe
};
