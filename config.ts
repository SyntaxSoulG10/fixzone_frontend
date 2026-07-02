/**
 * Central application configuration.
 * Set NEXT_PUBLIC_API_BASE_URL in .env.local to change the backend URL.
 * Never hardcode localhost URLs anywhere else in the codebase — always import this.
 */
const APP_CONFIG = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081",
};

export default APP_CONFIG;
