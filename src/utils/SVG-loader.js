import { createIPodOverlay } from "../components/iPod/overlay.js";
import { getDimensions } from "./functions.js";

/**
 * Loads and injects the appropriate SVG based on the current page
 * @param {SVGElement} svgRef - Reference to the SVG element in the DOM
 * @returns {Promise<void>}
 */
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

    // Load SVG first
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const loadedSVG = svgDoc.documentElement;

    // Copy attributes
    Array.from(loadedSVG.attributes)
      .filter((attr) => attr.name !== "viewBox")
      .forEach((attr) => svgRef.setAttribute(attr.name, attr.value));

    // Set content
    svgRef.innerHTML = loadedSVG.innerHTML;

    // Get dimensions after SVG is loaded
    const dimensions = getDimensions(svgRef);
    const overlay = createIPodOverlay(dimensions);
    document.body.appendChild(overlay);
  } catch (error) {
    console.error("Error loading SVG:", error);
  }
}
