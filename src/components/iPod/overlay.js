import { Menu } from "../Menu.js";
import { ClickWheel } from "./click-wheel.js";

export function createIPodOverlay(dimensions) {
  const container = document.createElement("div");
  container.className = "ipod-content-wrapper";
  Object.assign(container.style, {
    width: `${dimensions.iPod?.width}px`,
    height: `${dimensions.iPod?.height}px`,
  });

  const shell = document.createElement("div");
  shell.className = "ipod-overlay";

  const screenContainer = document.createElement("div");
  screenContainer.className = "screen-container";
  Object.assign(screenContainer.style, {
    width: `${dimensions.Screen?.width}px`,
    height: `${dimensions.Screen?.height}px`,
    top: `${dimensions.Bezle?.y || 27}px`,
    left: `${dimensions.Bezle?.x || 28}px`,
    position: "absolute",
  });

  const header = document.createElement("div");
  header.className = "header";
  Object.assign(header.style, {
    width: `${dimensions.Header?.width}px`,
    height: `${dimensions.Header?.height}px`,
    position: "absolute",
    top: `5px`,
    left: `5px`,
  });

  const display = document.createElement("div");
  display.className = "display";
  display.id = "content";
  Object.assign(display.style, {
    width: `${dimensions.Display?.width}px`,
    height: `${dimensions.Display?.height - dimensions.Header?.height}px`,
    position: "absolute",
    top: `${dimensions.Header?.height + 5}px`,
    left: `5px`,
  });

  display.appendChild(Menu());
  screenContainer.append(header, display);
  shell.append(screenContainer);

  // Wheel setup
  const wheelContainer = document.createElement("div");
  wheelContainer.className = "click-wheel-container";
  const touchRing = document.createElement("div");
  touchRing.className = "touch-ring";

  Object.assign(wheelContainer.style, {
    position: "relative",
    top: `${dimensions.ScrollWheel?.y}px`,
    left: `${dimensions.ScrollWheel?.x}px`,
    width: `${dimensions.ScrollWheel?.width}px`,
    height: `${dimensions.ScrollWheel?.height}px`,
  });

  wheelContainer.appendChild(touchRing);
  shell.appendChild(wheelContainer);

  const wheel = new ClickWheel({
    onMenuPress: () => console.log("menu"),
    onSelectPress: () => console.log("select"),
    onBackPress: () => console.log("back"),
    onForwardPress: () => console.log("forward"),
    onPlayPausePress: () => console.log("play"),
  });

  wheel.mount(touchRing);
  container.appendChild(shell);

  return container;
}
