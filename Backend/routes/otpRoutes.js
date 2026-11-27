
import express from "express";
import { createOtp, verifyOtp } from "../services/otpStore.js";
import { sendOtpEmail } from "../services/brevoEmailService.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address."
      });
    }

    const result = createOtp(email);

    if (!result.success) {
      return res.status(429).json(result);
    }

    try {
      await sendOtpEmail(email, result.otp);
    } catch (error) {
      console.error("OTP email failed:", error.message);

      return res.status(502).json({
        success: false,
        message: "Unable to send OTP. Please try again."
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully.",
      resendAfterSeconds: 45
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
});

router.post("/verify", (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !/^\d{6}$/.test(String(otp || ""))) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit OTP."
      });
    }

    const result = verifyOtp(email, String(otp));

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: "Email verified successfully."
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
});

export default router;
