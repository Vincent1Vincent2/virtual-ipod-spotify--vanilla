import { SpotifyAuth } from "../auth/auth.js";
import { MediaList } from "../components/MediaList.js";

export async function getUserArtists() {
  try {
    const spotifyAuth = new SpotifyAuth();
    const token = await spotifyAuth.getValidToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(
      "https://api.spotify.com/v1/me/artists?" +
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
    const mediaList = MediaList(data.items);

    // Append to document
    document.getElementById("content").appendChild(mediaList);
  } catch (error) {
    console.error("Failed to fetch saved tracks:", error);
    throw error;
  }
}
