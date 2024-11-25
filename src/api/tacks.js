import { SpotifyAuth } from "../auth/auth.js";

export async function getSavedTracks() {
  try {
    const spotifyAuth = new SpotifyAuth();
    const token = await spotifyAuth.getValidToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(
      "https://api.spotify.com/v1/me/tracks?" +
        new URLSearchParams({
          limit: "10",
          offset: "0",
        }),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log(data);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch saved tracks:", error);
    throw error;
  }
}
