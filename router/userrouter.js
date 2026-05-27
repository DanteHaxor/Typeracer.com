const express = require("express");
const UserModel = require("../models/user.model");
require("dotenv").config();
const { blacklistToken } = require("../config/redis");
const sendOtp = require("../config/mailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BlockuserModel = require("../models/block.model");
const userrouter = express.Router();

const pendingOtps = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;

function getPendingOtp(email) {
  const entry = pendingOtps.get(email);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    pendingOtps.delete(email);
    return null;
  }
  return entry;
}

userrouter.get("/", (req, res) => {
  res.send("user Router");
});

userrouter.get("/leaderboard", async (req, res) => {
  try {
    const users = await UserModel.find({ role: "user" })
      .sort({ wpm: -1 })
      .limit(10)
      .select("name wpm races updatedAt");
    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!", err: error.message });
  }
});

userrouter.post("/register_validate", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .send({ msg: "User with same email address already exits." });
    }

    const hash = await bcrypt.hash(password, 5);
    const { otp, devMode, sentViaEmail } = await sendOtp(email);

    pendingOtps.set(email, {
      otp,
      hash,
      name,
      expires: Date.now() + OTP_TTL_MS,
    });

    const msg = sentViaEmail
      ? "OTP sent to your email."
      : "OTP generated (dev mode). Check the server terminal and browser console (F12).";

    res.status(200).send({
      msg,
      devMode,
      ...(devMode ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: error.message || "Could not send OTP. Check email configuration.",
    });
  }
});

userrouter.post("/register", async (req, res) => {
  const { name, email, password, otp } = req.body;
  try {
    const pending = getPendingOtp(email);
    if (!pending) {
      return res
        .status(400)
        .send({ msg: "OTP expired or not found. Please sign up again." });
    }
    if (String(otp) !== String(pending.otp)) {
      return res.status(400).send({ msg: "Incorrect OTP." });
    }

    const user = new UserModel({
      name: name || pending.name,
      email,
      password: password || pending.hash,
    });
    await user.save();
    pendingOtps.delete(email);
    res.status(200).send({ msg: "Registration Succesful" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!", err: error.message });
  }
});

userrouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await UserModel.findOne({ email });
    if (!data) {
      return res
        .status(409)
        .send({ msg: "User does not exits. Please register!" });
    }

    const blocked = await BlockuserModel.findOne({ user_id: data.id });
    if (blocked) {
      return res.status(409).send({ msg: "Your account has been blocked" });
    }

    const match = await bcrypt.compare(password, data.password);
    if (match) {
      const token = jwt.sign(
        { email: data.email, role: data.role },
        "typebattle",
        { expiresIn: "1h" }
      );
      return res
        .status(200)
        .send({ msg: "Login successfull", token, user: data });
    }
    res.status(404).send({ msg: "Incorrect Password" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!", err: error.message });
  }
});

userrouter.get("/updateRaceCount/:id", async (req, res) => {
  const user_id = req.params.id;
  try {
    await UserModel.findByIdAndUpdate({ _id: user_id }, { $inc: { races: 1 } });
    const user = await UserModel.findOne({ _id: user_id });
    res.status(200).send({ msg: "races updated", user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!", err: error.message });
  }
});

userrouter.get("/updateWPM", async (req, res) => {
  const { user_id, wpm } = req.query;
  const wpmNum = Number(wpm);
  try {
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    if (wpmNum > (user.wpm || 0)) {
      await UserModel.findByIdAndUpdate(user_id, { wpm: wpmNum });
    }
    const updated = await UserModel.findById(user_id);
    res.status(200).send({ msg: "wpm updated", user: updated });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "Something went wrong!", err: error.message });
  }
});

userrouter.get("/logout", async (req, res) => {
  const token = req.headers.authorization;
  try {
    await blacklistToken(token);
    res.status(200).send({ msg: "logout successfull" });
  } catch (error) {
    console.log("logout warning:", error.message);
    res.status(200).send({ msg: "logout successfull" });
  }
});

module.exports = userrouter;
