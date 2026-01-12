"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = getUserByEmail;
exports.createUser = createUser;
exports.getUserById = getUserById;
const database_ts_1 = __importDefault(require("../config/database.ts"));
// Récupérer un utilisateur par email (login)
async function getUserByEmail(email) {
    const [rows] = await database_ts_1.default.query("SELECT id_user, email, mdp, role FROM users WHERE email = ?", [email]);
    return rows[0];
}
// Créer un utilisateur client (register)
async function createUser(nom_utilisateur, email, hashedPassword) {
    const [result] = await database_ts_1.default.query("INSERT INTO users (nom_utilisateur, email, mdp, role) VALUES (?, ?, ?, 'client')", [nom_utilisateur, email, hashedPassword]);
    return result.insertId;
}
// Récupérer un utilisateur par ID (JWT)
async function getUserById(id) {
    const [rows] = await database_ts_1.default.query("SELECT id_user, email, role FROM users WHERE id_user = ?", [id]);
    return rows[0];
}
