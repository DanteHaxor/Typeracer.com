/**
 * API / Socket URL switch.
 * When opened from localhost, uses the same origin (works with any PORT in .env).
 * Otherwise uses the deployed Render backend.
 */
export const environment = "deployed";

export const URLS = {
  local: "http://localhost:8080",
  deployed: "https://type-battle.onrender.com",
};

function resolveBaseURL() {
  if (typeof window !== "undefined") {
    const { hostname, protocol, port } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
    }
  }
  return URLS[environment] ?? URLS.deployed;
}

const baseURL = resolveBaseURL();

export default baseURL;
