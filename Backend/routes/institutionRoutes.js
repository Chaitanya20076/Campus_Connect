import express from "express";
import {
  verifyCollegeController,
} from "../controllers/institutionController.js";

const router = express.Router();

router.post(
  "/verify-college",
  verifyCollegeController
);

export default router;