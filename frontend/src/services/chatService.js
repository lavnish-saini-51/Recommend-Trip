import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Sends a message (scoped to a destination) along with conversation
 * history to the ML service and returns the assistant's reply.
 *
 * @param {object} destination - Selected destination's real attributes.
 * @param {string} message - The user's new message.
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @returns {Promise<string>} the assistant's reply text
 * @throws {Error} with a user-friendly message on failure
 */
export async function sendChatMessage(destination, message, conversationHistory) {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat`, {
      destination: {
        city: destination.city,
        country: destination.country,
        region: destination.region,
        short_description: destination.short_description,
        budget_level: destination.budget_level,
        avg_annual_temp: destination.avg_annual_temp,
      },
      message,
      conversation_history: conversationHistory,
    });
    return response.data.reply;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.detail || "Failed to get a reply.");
    } else if (error.request) {
      throw new Error("Could not reach the chat service. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}