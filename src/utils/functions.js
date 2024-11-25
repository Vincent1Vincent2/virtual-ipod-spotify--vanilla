export function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

export function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function getDimensions(svgRef) {
  const dimensionsMap = {};
  const elements = {
    iPod: svgRef.getElementById("iPod"),
    Shell: svgRef.getElementById("Shell"),
    ScrollWheel: svgRef.getElementById("ScrollWheel"),
    Screen: svgRef.getElementById("Screen"),
    Display: svgRef.getElementById("Display"),
    Header: svgRef.getElementById("Header"),
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (element) {
      const bbox = element.getBBox();
      dimensionsMap[key] = {
        width: bbox.width,
        height: bbox.height,
        x: bbox.x,
        y: bbox.y,
      };
    }
  });

  return dimensionsMap;
}
