import { makeSpotifyApiCall } from "./src/api/user.js";
import { SpotifyAuth } from "./src/auth/auth.js";
import { loadSVG } from "./src/utils/SVG-loader.js";

document.addEventListener("DOMContentLoaded", () => {
  const spotifyAuth = new SpotifyAuth();
  const signInButton = document.getElementById("button");
  const userButton = document.getElementById("user_button");

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
      makeSpotifyApiCall();
    });
  }
});
