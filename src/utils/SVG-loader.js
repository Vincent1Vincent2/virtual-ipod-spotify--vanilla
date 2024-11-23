// src/utils/SVG-loader.js

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
    // Get the current page path
    const currentPath = window.location.pathname;

    // Determine which SVG to load
    const svgPath =
      currentPath === "/" || currentPath.includes("index.html")
        ? "/src/assets/img/iPod/iPod-Skeleton.svg"
        : "/src/assets/img/iPod/iPod.svg";

    // Fetch the SVG content
    const response = await fetch(svgPath);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${response.statusText}`);
    }

    const svgContent = await response.text();

    // Create a temporary container to parse the SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const loadedSVG = svgDoc.documentElement;

    // Copy attributes from the loaded SVG to the reference SVG
    const attributes = loadedSVG.attributes;
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (attr.name !== "viewBox") {
        // Preserve the original viewBox
        svgRef.setAttribute(attr.name, attr.value);
      }
    }

    // Copy the inner content
    svgRef.innerHTML = loadedSVG.innerHTML;
  } catch (error) {
    console.error("Error loading SVG:", error);
  }
}
