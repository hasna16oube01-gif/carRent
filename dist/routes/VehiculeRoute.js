"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const VehiculeController_1 = require("../controllers/VehiculeController");
const router = express_1.default.Router();
// Client
router.get("/available", VehiculeController_1.viewVehicles);
// Admin
router.post("/add", VehiculeController_1.createVehicle);
router.put("/update", VehiculeController_1.modifyVehicleFlexible);
router.delete("/delete", VehiculeController_1.removeVehicle);
exports.default = router;
