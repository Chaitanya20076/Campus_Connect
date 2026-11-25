
import { chatWithCampusConnect } from "../services/chatbot/chatbotService.js";

export async function chatbotMessageController(req, res) {
  try {
    console.log("📥 Chatbot message received");

    const {
      message,
      conversationHistory = [],
    } = req.body || {};

    // Validate message
    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message",
      });
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      return res.status(400).json({
        success: false,
        message: "conversationHistory must be an array",
      });
    }

    // Prevent excessively large conversation histories
    if (conversationHistory.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 conversation history messages allowed",
      });
    }

    for (const item of conversationHistory) {
      if (
        !item ||
        !["user", "assistant"].includes(item.role) ||
        typeof item.content !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation history format",
        });
      }
    }

    const result = await chatWithCampusConnect({
      message: message.trim(),
      conversationHistory,
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("Chatbot controller error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "CampusConnect AI is temporarily unavailable",
    });
  }
}
