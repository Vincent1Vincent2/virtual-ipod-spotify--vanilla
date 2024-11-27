import { SpotifyAuth } from "./auth/auth.js";
import { PlaybackController } from "./player/playbackController.js";
import { SpotifyPlayer } from "./player/SpotifyPlayer.js";
import { loadSVG } from "./utils/SVG-OverlayLoader.js";

window.onSpotifyWebPlaybackSDKReady = () => {
  initCount++;
  console.log(`SDK Ready called ${initCount} times`);
  console.trace("SDK Ready call stack"); // This will show where it's being called from
  initializeSpotify();
};

let initCount = 0;
let playerInstance = null;
let webApiInstance = null;

async function waitForSpotifySDK(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Timeout waiting for Spotify SDK"));
    }, timeout);

    window.onSpotifyWebPlaybackSDKReady = () => {
      clearTimeout(timeoutId);
      initCount++;
      console.log(`SDK Ready called ${initCount} times`);
      resolve();
    };
  });
}

async function initializeSpotify() {
  try {
    // Wait for SDK first
    await waitForSpotifySDK();

    // Initialize auth and API
    const spotifyAuth = new SpotifyAuth();
    webApiInstance = new PlaybackController(spotifyAuth);

    // Only create new player if none exists
    if (!playerInstance) {
      console.log("Creating new player instance...");
      playerInstance = new SpotifyPlayer(spotifyAuth);

      playerInstance.on("ready", async ({ device_id }) => {
        console.log(`Player ready with device ID: ${device_id}`);
        localStorage.setItem("device_id", device_id);

        try {
          await webApiInstance.transferPlayback(device_id);
          console.log("Playback transferred to browser");
        } catch (error) {
          console.error("Failed to transfer playback:", error);
        }
      });

      playerInstance.on("state_changed", (state) => {
        console.log("Playback state:", state);
      });

      // Load SVG and overlay first
      const svgRef = document.querySelector(".ipod-svg");
      if (svgRef) {
        await loadSVG(svgRef);
      }

      // Then initialize the player
      await playerInstance.initialize();
    } else {
      console.log("Player already initialized, skipping...");
    }
  } catch (error) {
    console.error("Spotify initialization failed:", error);
    playerInstance = null;
    webApiInstance = null;
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");
  initializeSpotify().catch((error) => {
    console.error("Failed to initialize Spotify:", error);
  });
});

export { initializeSpotify };
