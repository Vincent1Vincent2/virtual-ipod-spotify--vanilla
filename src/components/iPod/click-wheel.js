export class ClickWheel {
  constructor({
    onMenuPress,
    onSelectPress,
    onBackPress,
    onForwardPress,
    onPlayPausePress,
  }) {
    this.handlers = {
      menu: onMenuPress,
      select: onSelectPress,
      back: onBackPress,
      forward: onForwardPress,
      play: onPlayPausePress,
    };
    this.container = this.createWheel();
  }

  createButton(id, element) {
    const button = document.createElement("button");
    const bbox = element.getBBox();
    const parentRect = document.getElementById("ScrollWheel").getBBox();

    button.className = `click-wheel-button ${id}-button`;
    button.setAttribute("aria-label", id);
    Object.assign(button.style, {
      position: "absolute",
      left: `${bbox.x - parentRect.x}px`,
      top: `${bbox.y - parentRect.y}px`,
      width: `${bbox.width}px`,
      height: `${bbox.height}px`,
    });

    button.addEventListener("mousedown", () => this.handlers[id]?.());

    return button;
  }

  createWheel() {
    const controls = document.createElement("div");
    controls.className = "click-wheel-controls";
    controls.style.position = "absolute";
    controls.style.inset = "0";

    const buttonElements = {
      menu: document.getElementById("MenuBox"),
      back: document.getElementById("BackBox"),
      select: document.getElementById("Inner"),
      forward: document.getElementById("SkipBox"),
      play: document.getElementById("PlayPauseBox"),
    };

    Object.entries(buttonElements).forEach(([id, element]) => {
      if (element) controls.appendChild(this.createButton(id, element));
    });

    return controls;
  }

  mount(parent) {
    parent.appendChild(this.container);
  }
}
