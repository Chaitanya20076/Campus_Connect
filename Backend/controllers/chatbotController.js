
import { chatWithCampusConnect } from "../services/chatbot/chatbotService.js";

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_HISTORY_ITEM_LENGTH = 2000;

export async function chatbotMessageController(req, res) {
  try {
    console.log("📥 Chatbot message received");

    const {
      message,
      conversationHistory = [],
    } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    if (!Array.isArray(conversationHistory)) {
      return res.status(400).json({
        success: false,
        message: "conversationHistory must be an array",
      });
    }

    if (conversationHistory.length > MAX_HISTORY_MESSAGES) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_HISTORY_MESSAGES} conversation history messages allowed`,
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

      if (item.content.length > MAX_HISTORY_ITEM_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Each conversation history message cannot exceed ${MAX_HISTORY_ITEM_LENGTH} characters`,
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
      message:
        error.message ||
        "CampusConnect AI is temporarily unavailable",
    });
  }
}
