class SpotifyAuth {
  constructor() {
    this.clientId = "";
    this.redirectUri = "http://127.0.0.1:5500/";
    this.scope = "user-read-private user-read-email";
    this.authUrl = new URL("https://accounts.spotify.com/authorize");
    this.tokenUrl = "https://accounts.spotify.com/api/token";

    // Check for authentication callback on page load
    this.handleCallback();
  }

  generateRandomString(length) {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  async sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  }

  base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  async generateCodeChallenge() {
    const codeVerifier = this.generateRandomString(64);
    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64encode(hashed);
    return { codeVerifier, codeChallenge };
  }

  async authorizeUser() {
    try {
      const { codeVerifier, codeChallenge } =
        await this.generateCodeChallenge();

      // Store code verifier for later use
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
        // Clear the URL parameters after successful token exchange
        window.history.replaceState({}, document.title, "/");
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
    // You can customize this method to handle successful authentication
    console.log("Authentication completed successfully!");
    // Example: Hide login button, show user profile, etc.
    const loginButton = document.getElementById("button");
    if (loginButton) {
      loginButton.style.display = "none";
    }
  }

  // Utility method to check if the current token is valid
  isTokenValid() {
    const expiration = localStorage.getItem("token_expiration");
    if (!expiration) return false;

    // Return true if token is still valid (with 1 minute buffer)
    return new Date().getTime() < parseInt(expiration) - 60000;
  }

  // Get the current access token (refreshing if necessary)
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

// Initialize auth when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const spotifyAuth = new SpotifyAuth();
  const signInButton = document.getElementById("button");

  if (signInButton) {
    signInButton.addEventListener("click", () => {
      spotifyAuth.authorizeUser();
    });
  } else {
    console.error("Sign in button not found!");
  }
});

// Example of how to use the token to make API calls
async function makeSpotifyApiCall() {
  const auth = new SpotifyAuth();
  const token = await auth.getValidToken();

  if (!token) {
    console.error("No valid token available");
    return;
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("User profile:", data);
  } catch (error) {
    console.error("API call failed:", error);
  }
}
