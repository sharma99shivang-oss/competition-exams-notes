import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  getWishlist,
  addWishlist,
  removeWishlist,
  checkWishlist,
} from "../controllers/wishlistController.js";

const router = Router();

// Login required for all wishlist APIs
router.use(protect);

// GET /api/wishlist
router.get("/", getWishlist);

// GET /api/wishlist/:examId/check
router.get("/:examId/check", checkWishlist);

// POST /api/wishlist/:examId
router.post("/:examId", addWishlist);

// DELETE /api/wishlist/:examId
router.delete("/:examId", removeWishlist);

export default router;