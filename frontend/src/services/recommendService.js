import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Sends structured user preferences to the ML service and returns
 * the ranked list of recommended destinations.
 *
 * @param {object} preferences - Matches the FastAPI RecommendRequest schema.
 * @returns {Promise<Array>} recommendations array
 * @throws {Error} with a user-friendly message on failure
 */
export async function getRecommendations(preferences) {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommend`, preferences);
    return response.data.recommendations;
  } catch (error) {
    if (error.response) {
      // Server responded with an error status (e.g. 404, 500 from FastAPI)
      throw new Error(error.response.data?.detail || "Failed to get recommendations.");
    } else if (error.request) {
      // Request was made but no response received (server down, network issue)
      throw new Error("Could not reach the recommendation service. Please check your connection.");
    } else {
      throw new Error("An unexpected error occurred.");
    }
  }
}