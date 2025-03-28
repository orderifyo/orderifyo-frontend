// src/lib/api.ts
// const API_URL = "http://localhost:8001"; // Update with your actual API URL in production
const API_URL = "http://ai.intelzeal.com";
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
}

export const api = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response from API");
      }

      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },
};