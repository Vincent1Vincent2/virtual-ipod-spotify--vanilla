import { SpotifyAuth } from "../auth/auth.js";
import { Media_list } from "../components/Media-list.js";

export async function getUserPlaylists() {
  try {
    const spotifyAuth = new SpotifyAuth();
    const token = await spotifyAuth.getValidToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const response = await fetch(
      "https://api.spotify.com/v1/me/playlists?" +
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
    const mediaList = Media_list(data.items);

    // Append to document
    document.getElementById("content").appendChild(mediaList);
  } catch (error) {
    console.error("Failed to fetch saved tracks:", error);
    throw error;
  }
}
