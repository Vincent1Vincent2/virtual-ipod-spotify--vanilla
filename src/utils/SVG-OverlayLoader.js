import { SpotifyAuth } from "../auth/auth.js";
import { createIPodOverlay } from "../components/iPod/Overlay.js";
import { getDimensions } from "./functions.js";

export async function loadSVG(svgRef) {
  if (!svgRef) {
    console.error("SVG reference not found");
    return;
  }

  try {
    const currentPath = window.location.pathname;
    const svgPath =
      currentPath === "/" || currentPath.includes("index.html")
        ? "/src/assets/img/iPod/iPod-Skeleton.svg"
        : "/src/assets/img/iPod/iPod.svg";

    const response = await fetch(svgPath);
    if (!response.ok)
      throw new Error(`Failed to load SVG: ${response.statusText}`);

    const svgContent = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const loadedSVG = svgDoc.documentElement;

    Array.from(loadedSVG.attributes)
      .filter((attr) => attr.name !== "viewBox")
      .forEach((attr) => svgRef.setAttribute(attr.name, attr.value));

    svgRef.innerHTML = loadedSVG.innerHTML;

    await new Promise(requestAnimationFrame);

    const spotifyAuth = new SpotifyAuth();
    const isAuth = await spotifyAuth.getValidToken();
    const isRootPath =
      currentPath === "/" || currentPath.includes("index.html");

    if (isAuth && !isRootPath) {
      const dimensions = getDimensions(svgRef);
      const overlay = createIPodOverlay(dimensions);
      document.body.appendChild(overlay);
      return overlay;
    }
  } catch (error) {
    console.error("Error loading SVG:", error);
    return null;
  }
}

export function loadOverlay(svgRef) {
  if (!svgRef) {
    console.error("SVG reference not found");
    return null;
  }

  const dimensions = getDimensions(svgRef);
  const overlay = createIPodOverlay(dimensions);
  document.body.appendChild(overlay);
  return overlay;
}

let resizeTimeout;
window.addEventListener("resize", async () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(async () => {
    const svgRef = document.querySelector(".ipod-svg");
    const existingOverlay = document.querySelector(".ipod-overlay");
    const spotifyAuth = new SpotifyAuth();
    const isAuth = await spotifyAuth.getValidToken();
    const currentPath = window.location.pathname;
    const isRootPath =
      currentPath === "/" || currentPath.includes("index.html");

    if (svgRef && existingOverlay && isAuth && !isRootPath) {
      const dimensions = getDimensions(svgRef);
      const newOverlay = createIPodOverlay(dimensions);
      existingOverlay.replaceWith(newOverlay);
    }
  }, 250);
});
