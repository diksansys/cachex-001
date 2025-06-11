// src/common/config/env.ts
import dotenv from "dotenv";

dotenv.config();

const requiredKeys = {
  "app.env": "NODE_ENV",
  "app.backend.port": "BACKEND_PORT",
  "app.frontend.origin": "FRONTEND_ORIGIN",
  "jwt.secret": "JWT_SECRET",
  "jwt.access_token.expires_in": "JWT_ACCESS_TOKEN_EXPIRES_IN",
  "jwt.refresh_token_expires_in": "JWT_REFRESH_TOKEN_EXPIRES_IN",
};

class Env {
  private config: Record<string, string>;

  constructor() {
    this.config = {};

    for (const [alias, actualKey] of Object.entries(requiredKeys)) {
      const val = process.env[actualKey];
      if (!val) {
        console.error(`[ENV] Missing required key: ${actualKey}`);
        throw new Error(`Missing required env variable: ${actualKey}`);
      }
      this.config[alias] = val;
    }
  }

  public get(key: keyof typeof requiredKeys): string {
    return this.config[key];
  }
}

export default new Env();
