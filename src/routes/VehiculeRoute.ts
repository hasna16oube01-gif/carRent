import express from "express";
import {
  viewVehicles,
  createVehicle,
  modifyVehicleFlexible,
  removeVehicle
} from "../controllers/VehiculeController";
import { authUser, isAdmin } from "../middlewares/UserMiddleware";
import {
  validateVehicleBody,
  validateVehicleUpdate,
  validateVehicleDelete
} from "../middlewares/VehiculeMiddleware";

const router = express.Router();

/**
 * Routes clients
 */
// Voir véhicules disponibles
router.get("/available", authUser, viewVehicles);

/**
 * Routes admin
 */
router.post("/add", authUser, isAdmin, validateVehicleBody, createVehicle);
router.put("/update", authUser, isAdmin, validateVehicleUpdate, modifyVehicleFlexible);
router.delete("/delete", authUser, isAdmin, validateVehicleDelete, removeVehicle);

export default router;
