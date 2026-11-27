
import crypto from "crypto";

const otpRecords = new Map();

const OTP_EXPIRY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 45 * 1000;
const MAX_ATTEMPTS = 5;

function hashOtp(email, otp) {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error("OTP_HASH_SECRET is missing");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${email.toLowerCase()}:${otp}`)
    .digest("hex");
}

export function createOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = otpRecords.get(normalizedEmail);

  if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN) {
    const remaining = Math.ceil(
      (RESEND_COOLDOWN - (Date.now() - existing.createdAt)) / 1000
    );

    return {
      success: false,
      message: `Please wait ${remaining} seconds before requesting another OTP.`,
      resendAfterSeconds: remaining
    };
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  otpRecords.set(normalizedEmail, {
    otpHash: hashOtp(normalizedEmail, otp),
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRY,
    attempts: 0
  });

  return {
    success: true,
    otp,
    resendAfterSeconds: 45
  };
}

export function verifyOtp(email, otp) {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpRecords.get(normalizedEmail);

  if (!record) {
    return {
      success: false,
      message: "No OTP found. Please request a new OTP."
    };
  }

  if (Date.now() > record.expiresAt) {
    otpRecords.delete(normalizedEmail);

    return {
      success: false,
      message: "OTP expired. Please request a new one."
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpRecords.delete(normalizedEmail);

    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP."
    };
  }

  record.attempts += 1;

  const submittedHash = hashOtp(normalizedEmail, otp);

  const valid =
    submittedHash.length === record.otpHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(record.otpHash, "hex")
    );

  if (!valid) {
    return {
      success: false,
      message: "Incorrect OTP. Please try again."
    };
  }

  otpRecords.delete(normalizedEmail);

  return { success: true };
}
