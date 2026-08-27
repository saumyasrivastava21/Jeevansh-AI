const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { ApiError } = require("../utils/apiResponse");
const { OpenAI } = require("openai");

const router = express.Router();

// POST /api/chatbot/message
// Authenticated endpoint — proxies user message to NVIDIA Nemotron and returns LLM text
router.post("/message", protect, async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return next(new ApiError(400, "Message is required"));
    }

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
    const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";

    if (!NVIDIA_API_KEY) {
      return next(new ApiError(500, "NVIDIA API key is not configured on the server"));
    }

    const client = new OpenAI({
      baseURL: NVIDIA_BASE_URL,
      apiKey: NVIDIA_API_KEY,
    });

    // Build conversation history
    const systemMessage = {
      role: "system",
      content:
        "You are Jeevansh AI's medical assistant. You help patients understand their AI-generated medical scan results, explain medical conditions, describe treatment options, and answer healthcare questions clearly and compassionately. Always remind users that your responses are for informational purposes only and do not replace professional medical advice. Respond in plain natural language — no JSON.",
    };

    const conversationMessages = [systemMessage];

    // Append prior conversation history if provided (up to last 10 exchanges)
    if (Array.isArray(history)) {
      const trimmedHistory = history.slice(-20); // max 10 exchanges (20 messages)
      for (const msg of trimmedHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          conversationMessages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Append current user message
    conversationMessages.push({ role: "user", content: message.trim() });

    const completion = await client.chat.completions.create({
      model: NVIDIA_MODEL,
      messages: conversationMessages,
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 1024,
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return next(new ApiError(502, "NVIDIA returned an empty response"));
    }

    res.json({ success: true, reply });
  } catch (error) {
    console.error("[Chatbot] NVIDIA API error:", error?.message || error);
    next(new ApiError(502, `AI chatbot service error: ${error?.message || "Unknown error"}`));
  }
});

module.exports = router;
