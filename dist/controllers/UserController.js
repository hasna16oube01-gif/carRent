"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModel_1 = require("../models/UserModel");
// REGISTER (client uniquement)
async function register(req, res) {
    const { nom_utilisateur, email, mdp } = req.body;
    if (!email || !mdp) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    const existingUser = await (0, UserModel_1.getUserByEmail)(email);
    if (existingUser) {
        return res.status(409).json({ message: "Utilisateur déjà existant" });
    }
    const hashedPassword = await bcrypt_1.default.hash(mdp, 10);
    await (0, UserModel_1.createUser)(nom_utilisateur, email, hashedPassword);
    res.status(201).json({ message: "Compte créé avec succès" });
}
// LOGIN (client ou admin)
async function login(req, res) {
    const { email, mdp } = req.body;
    if (!email || !mdp) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    const user = await (0, UserModel_1.getUserByEmail)(email);
    if (!user || !user.mdp) {
        return res.status(401).json({ message: "Identifiants invalides" });
    }
    const isValid = await bcrypt_1.default.compare(mdp, user.mdp);
    if (!isValid) {
        return res.status(401).json({ message: "Identifiants invalides" });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
}
