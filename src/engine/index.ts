import CanvasDraw from "./canvas-draw";
import { BaseObject } from "./objects/base-object";
import type { CharacterProps } from "./objects/character";
import { ObjectOptions } from "./types";
import { World } from "./world";

interface EngineProps<ObjectOptionsGenericType extends ObjectOptions> {
  devMode: boolean;
  objectOptions: ObjectOptionsGenericType;
  map: Extract<keyof ObjectOptionsGenericType["tiles"], string>[][];
  player: Omit<
    CharacterProps<
      Extract<keyof ObjectOptionsGenericType["characters"], string>
    >,
    "canvasDraw" | "CharacterBaseConfigs"
  >;
}

export default class Engine<
  ObjectOptionsGenericType extends ObjectOptions
> extends World<ObjectOptionsGenericType> {
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private keyPresses: string[] = [];
  private mouseClick: { left: boolean; right: boolean; x: number; y: number } =
    {
      left: false,
      right: false,
      x: 0,
      y: 0
    };

  private devMode: boolean = false;

  private mouseTile: BaseObject;

  constructor({
    objectOptions: {
      tilesConfig,
      tiles,
      staticObjects,
      dynamicObjects,
      characters
    },
    map,
    player,
    devMode
  }: EngineProps<ObjectOptionsGenericType>) {
    super({
      screenWidth: 0,
      screenHeight: 0,
      player: { ...player, CharacterBaseConfigs: characters },
      tilesConfig,
      tileOptions: tiles,
      staticObjectsOptions: staticObjects,
      dynamicObjectsOptions: dynamicObjects,
      map
    });

    this.mouseTile = new BaseObject({
      x: 0,
      y: 0,
      width: tilesConfig.width,
      height: tilesConfig.height,
      texture: "#ffffff69",
      canvasDraw: this.canvasDraw
    });

    this.devMode = devMode;

    // Get user inputs
    this.setupInput();
  }

  private setupInput() {
    if (!this.devMode) {
      // Remove right click action
      document.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    document.addEventListener("keydown", (e) => {
      if (!this.devMode) {
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
    });

    document.addEventListener("keyup", (e) => {
      this.keyPresses = this.keyPresses.filter((key) => key !== e.code);
    });

    this.canvasElement.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouseClick.left = e.button === 0;
      if (e.button === 2) this.mouseClick.right = e.button === 2;
    });

    this.canvasElement.addEventListener("mouseup", (e) => {
      this.mouseClick.left =
        this.mouseClick.left && e.button === 0 ? false : this.mouseClick.left;
      this.mouseClick.right =
        this.mouseClick.right && e.button === 2 ? false : this.mouseClick.right;
    });

    this.canvasElement.addEventListener("mousemove", (e) => {
      this.mouseClick.x = e.clientX;
      this.mouseClick.y = e.clientY;
    });
  }

  // private getMousePositionToWorld() {
  //   function closestTile(value: number, multiple: number) {
  //     return (Math.floor(value / multiple) + 1) * multiple - multiple / 2;
  //   }

  //   const x = closestTile(
  //     this.mouseClick.x,
  //     this.tilesConfig.width - this.camera.x / this.tilesConfig.width
  //   );
  //   const y = closestTile(
  //     this.mouseClick.y,
  //     this.tilesConfig.height - this.camera.y / this.tilesConfig.height
  //   );

  //   const result = {
  //     closestTile: {
  //       x: x,
  //       y: y
  //     },
  //     tilePostionInWorld: {
  //       x: this.camera.x + x,
  //       y: this.camera.y + y
  //     }
  //   };

  //   // console.clear();
  //   // console.log(JSON.stringify(result, null, 2));

  //   // Get the closest tile position based on the mouse position
  //   return result;
  // }

  private getMousePositionToWorld() {
    // 1. Convert mouse position from screen to world coordinates
    const worldX = this.mouseClick.x + this.camera.x;
    const worldY = this.mouseClick.y + this.camera.y;

    // 2. Snap to the center of the nearest tile
    const tileWidth = this.tilesConfig.width;
    const tileHeight = this.tilesConfig.height;

    const snappedX = Math.floor(worldX / tileWidth) * tileWidth + tileWidth / 2;
    const snappedY =
      Math.floor(worldY / tileHeight) * tileHeight + tileHeight / 2;

    return {
      closestTile: {
        x: snappedX,
        y: snappedY
      },
      tilePostionInWorld: {
        x: snappedX,
        y: snappedY
      }
    };
  }

  private addTileOnClick() {
    if (this.player.isMoving) return;

    const mousePostionToWorld = this.getMousePositionToWorld();

    this.mouseTile.x = mousePostionToWorld.closestTile.x;
    this.mouseTile.y = mousePostionToWorld.closestTile.y;

    if (this.mouseClick.left) {
      this.addTile({
        texture: "water",
        x: mousePostionToWorld.tilePostionInWorld.x,
        y: mousePostionToWorld.tilePostionInWorld.y
      });
    }
  }

  private update(deltaTime: number) {
    if (this.devMode) {
      this.update_dev_world(deltaTime, this.keyPresses);
    } else {
      this.update_world(deltaTime, this.keyPresses);
    }

    this.addTileOnClick();
  }

  private render() {
    this.canvasDraw.clearScene();

    if (this.devMode) {
      this.render_dev_world();
    } else {
      this.render_world();
    }

    // Draw mouseTile in screen space (after restoring camera translation)
    if (!this.player.isMoving) {
      const mouseTilePos = this.getMousePositionToWorld();
      // Convert world position to screen position
      const screenPos = this.camera.worldToScreen(
        mouseTilePos.closestTile.x,
        mouseTilePos.closestTile.y
      );
      // Temporarily set mouseTile position to screen coordinates
      this.mouseTile.x = screenPos.x;
      this.mouseTile.y = screenPos.y;
      // Save context, draw, restore
      this.canvasDraw.ctx.save();
      // No translation needed, already in screen space
      this.mouseTile.render();
      this.canvasDraw.ctx.restore();
    }
  }

  private updateScreenSize() {
    if (
      this.screenWidth === window.innerWidth &&
      this.screenHeight === window.innerHeight
    )
      return;

    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    this.canvasDraw.setScreenSize(this.screenWidth, this.screenHeight);
    this.camera.setSize(this.screenWidth, this.screenHeight);
  }

  private gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
    this.lastTime = currentTime;

    this.updateScreenSize();
    this.update(this.deltaTime);
    this.render();

    // Next frame
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
  }

  restart() {
    this.stop();
    this.start();
  }
}
