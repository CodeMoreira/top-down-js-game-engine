import CanvasDraw from "./canvas-draw";
import { Camera } from "./camera";
import { GameObject, type GameObjectProps } from "./objects/game-object";
import {
  CollisionBoxObject,
  CollisionBoxObjectProps
} from "./objects/collision-box-object";
import { ManageTiles, ManageTilesProps } from "./manage-tiles";

interface EngineProps {
  cameraStartPosition: { x: number; y: number };
}

export default class Engine extends CanvasDraw {
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;

  public camera: Camera;
  public objects: GameObject[] = [];
  public collisionBoxes: CollisionBoxObject[] = [];

  public showWorldGrid: boolean = true;
  public gridSize: number = 100;
  public gridColor: string = "rgba(255,255,255,0.08)";

  public tiles: ManageTiles | null = null;

  onStart?: () => void;
  onUpdate?: (deltaTime: number) => void;
  onStop?: () => void;
  onRestart?: () => void;

  constructor({ cameraStartPosition }: EngineProps) {
    super();

    this.camera = new Camera({
      ...cameraStartPosition,
      width: this.screenWidth,
      height: this.screenHeight
    });
  }

  setTiles(tiles: ManageTilesProps["tiles"]) {
    this.tiles = new ManageTiles({
      canvasDraw: this,
      tiles,
      size: this.gridSize
    });
  }

  private update(deltaTime: number) {
    this.onUpdate?.(deltaTime);

    // Check Collisions
    this.collisionBoxes.forEach((collisionBox) => {
      this.collisionBoxes.find((otherCollisionBox) => {
        if (collisionBox === otherCollisionBox) {
          return false;
        }

        return collisionBox.checkColliding(otherCollisionBox);
      });
    });

    this.camera.update();
  }

  private drawGrid() {
    const { width, height, x, y, zoom } = this.camera;
    const left = x;
    const top = y;
    const right = x + width / zoom;
    const bottom = y + height / zoom;

    this.ctx.save();
    this.tiles?.drawTileGrid({ left, top, right, bottom, ctx: this.ctx });

    if (this.showWorldGrid) {
      // world tile grid
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.gridColor;
      this.ctx.lineWidth = 2;
      for (
        let gx = Math.floor(left / this.gridSize) * this.gridSize;
        gx < right;
        gx += this.gridSize
      ) {
        this.ctx.moveTo(gx, top);
        this.ctx.lineTo(gx, bottom);
      }
      for (
        let gy = Math.floor(top / this.gridSize) * this.gridSize;
        gy < bottom;
        gy += this.gridSize
      ) {
        this.ctx.moveTo(left, gy);
        this.ctx.lineTo(right, gy);
      }
      this.ctx.stroke();
      this.ctx.closePath();
    }

    this.ctx.restore();
  }

  private render() {
    this.clearScene();

    this.ctx.save();

    const cameraPos = this.camera.getFinalPosition();

    // Apply camera translation
    this.ctx.translate(
      -cameraPos.x * this.camera.zoom,
      -cameraPos.y * this.camera.zoom
    );

    // Apply camera zoom
    this.ctx.scale(this.camera.zoom, this.camera.zoom);

    this.objects.forEach((object) => {
      if (this.camera.isVisible(object)) {
        object.render();
      }
    });

    this.collisionBoxes.forEach((collisionBox) => {
      if (
        this.camera.isVisible(collisionBox) &&
        collisionBox.showCollisionBox
      ) {
        collisionBox.render();
      }
    });

    this.drawGrid();

    this.tiles?.render({ ctx: this.ctx, camera: this.camera });
    this.ctx.restore();
  }

  private updateScreenSize() {
    if (
      this.screenWidth === window.innerWidth &&
      this.screenHeight === window.innerHeight
    ) {
      return;
    }

    if (
      this.parent &&
      this.screenWidth === this.parent.clientWidth &&
      this.screenHeight === this.parent.clientHeight
    ) {
      return;
    }

    if (this.parent) {
      this.screenWidth = this.parent.clientWidth;
      this.screenHeight = this.parent.clientHeight;
    } else {
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
    }

    this.setScreenSize(this.screenWidth, this.screenHeight);
    this.camera.setSize(this.screenWidth, this.screenHeight);
  }

  private gameLoop() {
    if (!this.isRunning) {
      return;
    }

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
    this.onStart?.();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    this.onStop?.();
  }

  restart() {
    this.onRestart?.();
    this.stop();
    this.start();
  }

  addGameObject(props: Omit<GameObjectProps, "canvasDraw">) {
    const newObject = new GameObject({
      ...props,
      canvasDraw: this
    });

    this.objects.push(newObject);

    return { index: this.objects.length - 1, object: newObject };
  }

  removeGameObject(index: number) {
    // remove with splice for performance
    if (this.objects[index]) {
      this.objects.splice(index, 1);
    }
  }

  addCollisionBox(props: Omit<CollisionBoxObjectProps, "canvasDraw">) {
    const collisionBoxObject = new CollisionBoxObject({
      ...props,
      canvasDraw: this
    });

    this.collisionBoxes.push(collisionBoxObject);

    return {
      index: this.collisionBoxes.length - 1,
      object: collisionBoxObject
    };
  }

  removeCollisionBox(index: number) {
    // remove with splice for performance
    if (this.collisionBoxes[index]) {
      this.collisionBoxes.splice(index, 1);
    }
  }
}
