type EventType =
  | "keydown"
  | "keyup"
  | "click"
  | "wheel"
  | "mousemove"
  | "visibilitychange";

interface SetupInputsProps {
  parent: Element;
  debugMode: boolean;
  onChange?: (event: EventType) => void;
}

export class SetupInputs {
  parent: SetupInputsProps["parent"];

  keyPresses: string[] = [];
  mouse: {
    left: boolean;
    right: boolean;
    scroll: boolean;
    wheel: "up" | "down" | null;
    x: number;
    y: number;
  } = {
    left: false,
    right: false,
    scroll: false,
    wheel: null,
    x: 0,
    y: 0
  };
  private mouseWheelTimeout: number | undefined;
  debugMode: boolean = false;

  onChange?: SetupInputsProps["onChange"];

  constructor({ parent, debugMode, onChange }: SetupInputsProps) {
    this.parent = parent;
    this.debugMode = debugMode;
    this.onChange = onChange;
    this.setup();
  }

  notifyChange(event: EventType) {
    if (this.onChange) this.onChange(event);
  }

  setup() {
    if (!this.debugMode) {
      // Remove right click action
      this.parent.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    this.parent.addEventListener("keydown", (event) => {
      const e = event as KeyboardEvent;
      if (!this.debugMode) {
        // Prevent default shortcuts
        if (e.key == "F12") {
          e.preventDefault();
        }
        if (e.key == "123") {
          e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key == "I") {
          e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key == "C") {
          e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && e.key == "J") {
          e.preventDefault();
        }
        if (e.ctrlKey && e.key == "U") {
          e.preventDefault();
        }
      }

      if (this.keyPresses.includes(e.code)) return;

      this.keyPresses.push(e.code);

      this.notifyChange("keydown");
    });

    this.parent.addEventListener("keyup", (event) => {
      const e = event as KeyboardEvent;
      this.keyPresses = this.keyPresses.filter((key) => key !== e.code);

      this.notifyChange("keyup");
    });

    this.parent.addEventListener("wheel", (event) => {
      const e = event as WheelEvent;

      // Clear any existing timeout to reset the "stop" detection
      clearTimeout(this.mouseWheelTimeout);

      if (!this.mouse.wheel) {
        this.mouse.wheel = e.deltaY > 0 ? "down" : "up";
      }

      this.mouseWheelTimeout = setTimeout(() => {
        this.mouse.wheel = null;
      }, 150);

      this.notifyChange("wheel");
    });

    this.parent.addEventListener("mousedown", (event) => {
      const e = event as MouseEvent;

      // Left click
      if (e.button === 0) this.mouse.left = e.button === 0;

      // Scroll
      if (e.button === 1) this.mouse.scroll = e.button === 1;

      // Right click
      if (e.button === 2) this.mouse.right = e.button === 2;

      this.notifyChange("click");
    });

    this.parent.addEventListener("mouseup", (event) => {
      const e = event as MouseEvent;

      this.mouse.left =
        this.mouse.left && e.button === 0 ? false : this.mouse.left;

      this.mouse.scroll =
        this.mouse.scroll && e.button === 1 ? false : this.mouse.scroll;

      this.mouse.right =
        this.mouse.right && e.button === 2 ? false : this.mouse.right;

      this.notifyChange("click");
    });

    this.parent.addEventListener("mousemove", (event) => {
      const e = event as MouseEvent;

      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;

      this.notifyChange("mousemove");
    });

    // if browser is not focused, reset keypresses
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.keyPresses = [];

      this.notifyChange("visibilitychange");
    });
  }
}
