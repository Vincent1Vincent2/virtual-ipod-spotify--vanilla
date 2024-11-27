import { SpotifyAuth } from "./src/auth/auth.js";
import { loadSVG } from "./src/utils/SVG-OverlayLoader.js";

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

  const svgRef = document.querySelector(".ipod-svg");
  if (svgRef) {
    loadSVG(svgRef);
  }
});
