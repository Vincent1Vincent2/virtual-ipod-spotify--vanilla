import { getUserPlaylists } from "./src/api/playlists.js";
import { getSavedTracks } from "./src/api/tacks.js";
import { getUserData } from "./src/api/user.js";
import { SpotifyAuth } from "./src/auth/auth.js";
import { loadSVG } from "./src/utils/SVG-loader.js";

document.addEventListener("DOMContentLoaded", () => {
  const spotifyAuth = new SpotifyAuth();
  const signInButton = document.getElementById("button");
  const userButton = document.getElementById("user_button");

  const userPlaylistButton = document.getElementById("user_playlist_button");
  const savedTracksButton = document.getElementById("saved_tracks");

  if (signInButton) {
    signInButton.addEventListener("click", () => {
      spotifyAuth.authorizeUser();
    });
  } else {
    console.error("Sign in button not found!");
  }

  const svgRef = document.querySelector(".ipod-svg");
  console.log(svgRef);
  if (svgRef) {
    console.log("yes");
    loadSVG(svgRef);
  }

  if (userButton) {
    userButton.addEventListener("click", () => {
      getUserData();
    });
  }
  if (savedTracksButton) {
    savedTracksButton.addEventListener("click", () => {
      getSavedTracks();
    });
  }
  if (userPlaylistButton) {
    userPlaylistButton.addEventListener("click", () => {
      getUserPlaylists();
    });
  }
});
