import Wishlist from "../models/Wishlist.js";
import Exam from "../models/Exam.js";

const ok = (res, data) => res.json({ success: true, data });

/* ================= GET WISHLIST ================= */
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
            "exams"
        );

        ok(res, {
            exams: wishlist?.exams || [],
        });
    } catch (e) {
        next(e);
    }
};

/* ================= ADD TO WISHLIST ================= */
export const addWishlist = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res
                .status(404)
                .json({ success: false, message: "Exam not found" });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                exams: [examId],
            });
        } else if (!wishlist.exams.includes(examId)) {
            wishlist.exams.push(examId);
            await wishlist.save();
        }

        ok(res, {
            message: "Added to wishlist",
            exams: wishlist.exams,
        });
    } catch (e) {
        next(e);
    }
};

/* ================= REMOVE FROM WISHLIST ================= */
export const removeWishlist = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res
                .status(404)
                .json({ success: false, message: "Wishlist not found" });
        }

        wishlist.exams = wishlist.exams.filter(
            (id) => id.toString() !== examId
        );

        await wishlist.save();

        ok(res, {
            message: "Removed from wishlist",
            exams: wishlist.exams,
        });
    } catch (e) {
        next(e);
    }
};

/* ================= CHECK WISHLIST ================= */
export const checkWishlist = async (req, res, next) => {
    try {
        const { examId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        ok(res, {
            exists:
                wishlist?.exams.some((id) => id.toString() === examId) || false,
        });
    } catch (e) {
        next(e);
    }
};