import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

type LLMType = "fireworks_minimax" | 'fireworks_glm'

export class LLM {
  private static instances: Partial<Record<LLMType, any>> = {};

  // Private constructor
  private constructor() { }

  /**
   * Get singleton instance of a model
   * @param type "fireworks_minimax" | "fireworks_glm"
   */
  public static getInstance(type: LLMType = "fireworks_minimax") {
    if (!LLM.instances[type]) {
      switch (type) {
        case "fireworks_minimax":
          if (!process.env.FIRE_WORKS_API_KEY) {
            throw new Error("FIRE_WORKS_API_KEY is not set");
          }
          LLM.instances[type] = new ChatFireworks({
            model: "accounts/fireworks/models/minimax-m2p7",
            temperature: 0.7,
            apiKey: process.env.FIRE_WORKS_API_KEY,
          });
          break;

        case "fireworks_glm":
          if (!process.env.FIRE_WORKS_API_KEY) {
            throw new Error("FIRE_WORKS_API_KEY is not set");
          }

          LLM.instances[type] = new ChatFireworks({
            model: "accounts/fireworks/models/glm-5p2",
            temperature: 0.7,
            apiKey: process.env.FIRE_WORKS_API_KEY,
          });
          break;

        default:
          throw new Error(`Unsupported LLM type: ${type}`);
      }
    }

    return LLM.instances[type];
  }
}


