import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    generateToken(res, user._id);

    const { password: _, ...userData } = user.toObject();
res.status(201).json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    generateToken(res, user._id);

   const { password: _, ...userData } = user.toObject();
res.json(userData);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ✅ LOGOUT
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "Logged out" });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};