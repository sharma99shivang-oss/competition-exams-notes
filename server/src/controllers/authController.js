import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  accessToken,
  refreshToken,
  cookieOptions,
} from "../utils/tokens.js";

// ===== Helper =====
const deliver = async (res, user, status = 200) => {
  const newRefreshToken = refreshToken(user);

  // FIX: Never use user.save() here.
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshTokens: [
          ...(user.refreshTokens || []).slice(-4),
          newRefreshToken,
        ],
      },
    },
    { new: true }
  );

  const updatedUser = await User.findById(user._id);

  return res
    .status(status)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json({
      accessToken: accessToken(updatedUser),
      user: updatedUser.safe(),
    });
};

// ===== Signup =====
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    await deliver(res, user, 201);
  } catch (e) {
    next(e);
  }
};

// ===== Login =====
export const login = async (req, res, next) => {
  try {
    const { email, password, adminOnly } = req.body;

    const user = await User.findOne({ email }).select(
      "+password +refreshTokens"
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (adminOnly && user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    await deliver(res, user);
  } catch (e) {
    next(e);
  }
};

// ===== Logout =====
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await User.updateOne(
        { refreshTokens: token },
        { $pull: { refreshTokens: token } }
      );
    }

    res
      .clearCookie("refreshToken", {
        ...cookieOptions,
        maxAge: undefined,
      })
      .json({
        message: "Logged out securely",
      });
  } catch (e) {
    next(e);
  }
};

// ===== Refresh Token =====
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    // First time visitor -> no cookie
    if (!token) {
      return res.json({
        authenticated: false,
        accessToken: null,
        user: null,
      });
    }

    const data = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET ||
        "development-refresh-secret-change-me"
    );

    const user = await User.findById(data.id).select("+refreshTokens");

    if (!user || !user.refreshTokens.includes(token)) {
      return res.json({
        authenticated: false,
        accessToken: null,
        user: null,
      });
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);

    await User.findByIdAndUpdate(user._id, {
      $set: { refreshTokens: user.refreshTokens },
    });

    return deliver(res, user);
  } catch {
    return res.json({
      authenticated: false,
      accessToken: null,
      user: null,
    });
  }
};

// ===== Current User =====
export const me = (req, res) => {
  res.json({
    user: req.user.safe(),
  });
};

// ===== Forgot Password =====
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (user) {
      user.resetPasswordToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

      await user.save();
    }

    res.json({
      message: "If this email exists, reset instructions have been prepared.",
    });
  } catch (e) {
    next(e);
  }
};

// ===== Reset Password =====
export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +refreshTokens");

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or expired",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];

    await user.save();

    await deliver(res, user);
  } catch (e) {
    next(e);
  }
};