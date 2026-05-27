const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();

function isDevMode() {
  const flag = process.env.OTP_DEV_MODE;
  return flag === "true" || flag === "1";
}

function generateOtp() {
  return otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });
}

function logOtpToTerminal(email, otp) {
  console.log("\n========== TYPE BATTLE DEV OTP ==========");
  console.log(`Email: ${email}`);
  console.log(`OTP:   ${otp}`);
  console.log("=========================================\n");
}

async function sendOtp(email) {
  const otp = generateOtp();

  if (isDevMode()) {
    logOtpToTerminal(email, otp);
    return { otp, devMode: true, sentViaEmail: false };
  }

  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  if (!mailUser || !mailPass) {
    throw new Error(
      "Email is not configured. Set MAIL_USER and MAIL_PASS in .env, or set OTP_DEV_MODE=true for local testing."
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });

  await transporter.sendMail({
    to: email,
    from: mailUser,
    subject: "Verify your email - Type Battle",
    text: `Your OTP for Type Battle registration is: ${otp}`,
    html: `<h2>Type Battle</h2><p>Your verification code is:</p><h1>${otp}</h1><p>This code expires in 10 minutes.</p>`,
  });

  return { otp, devMode: false, sentViaEmail: true };
}

module.exports = sendOtp;
