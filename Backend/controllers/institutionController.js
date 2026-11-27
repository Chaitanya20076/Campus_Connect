import {
  verifyCollegeExistence,
} from "../services/institutionVerificationService.js";

export async function verifyCollegeController(req, res) {
  try {
    const { collegeName } = req.body || {};

    if (
      typeof collegeName !== "string" ||
      collegeName.trim().length < 3
    ) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: "Please enter a valid college name.",
      });
    }

    console.log("🎓 College verification:", collegeName.trim());

    const result = await verifyCollegeExistence(collegeName);

    return res.status(200).json(result);
  } catch (error) {
    console.error("College verification error:", error);

    return res.status(500).json({
      success: false,
      verified: false,
      message:
        error.message || "Unable to verify college right now.",
    });
  }
}