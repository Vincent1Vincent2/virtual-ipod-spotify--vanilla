import {
  base64encode,
  generateRandomString,
  sha256,
} from "../utils/functions.js";

export class SpotifyAuth {
  constructor() {
    this.clientId = "3b5fd71beb4c445f9a51f13f11ada78c";
    this.redirectUri = "http://127.0.0.1:5500/";
    this.scope =
      "user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-follow-modify user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-modify user-library-read user-read-email user-read-private";

    this.authUrl = new URL("https://accounts.spotify.com/authorize");
    this.tokenUrl = "https://accounts.spotify.com/api/token";
    this.handleCallback();
  }

  async generateCodeChallenge() {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    return { codeVerifier, codeChallenge };
  }

  async authorizeUser() {
    try {
      const { codeVerifier, codeChallenge } =
        await this.generateCodeChallenge();
      window.localStorage.setItem("code_verifier", codeVerifier);

      const params = {
        response_type: "code",
        client_id: this.clientId,
        scope: this.scope,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        redirect_uri: this.redirectUri,
      };

      this.authUrl.search = new URLSearchParams(params).toString();
      window.location.href = this.authUrl.toString();
    } catch (error) {
      console.error("Authorization failed:", error);
    }
  }

  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      try {
        await this.getToken(code);
        window.history.replaceState({}, document.title, "/");
        window.location.href = "/pages/home.html";
      } catch (error) {
        console.error("Token exchange failed:", error);
      }
    }
  }

  async getToken(code) {
    try {
      const codeVerifier = localStorage.getItem("code_verifier");

      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        }),
      };

      const response = await fetch(this.tokenUrl, payload);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // Store token expiration time
      const expiresIn = data.expires_in * 1000; // Convert to milliseconds
      const expirationTime = new Date().getTime() + expiresIn;
      localStorage.setItem("token_expiration", expirationTime);

      // Optional: Trigger an event or callback when authentication is complete
      this.onAuthComplete(data);

      return data;
    } catch (error) {
      console.error("Token exchange failed:", error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      };

      const response = await fetch(this.tokenUrl, payload);
      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      const expiresIn = data.expires_in * 1000;
      const expirationTime = new Date().getTime() + expiresIn;
      localStorage.setItem("token_expiration", expirationTime);

      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }

  onAuthComplete(tokenData) {
    console.log("Authentication completed successfully!");
    const loginButton = document.getElementById("button");
    if (loginButton) {
      loginButton.style.display = "none";
    }
  }

  isTokenValid() {
    const expiration = localStorage.getItem("token_expiration");
    if (!expiration) return false;
    return new Date().getTime() < parseInt(expiration) - 60000;
  }

  async getValidToken() {
    if (!this.isTokenValid()) {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error("Could not refresh token:", error);
        return null;
      }
    }
    return localStorage.getItem("access_token");
  }
}
