import type { CharacterProps } from "./objects/character";
import { ObjectOptions } from "./types";
import { World } from "./world";

interface EngineProps<ObjectOptionsGenericType extends ObjectOptions> {
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

  constructor({
    objectOptions: {
      tilesConfig,
      tiles,
      staticObjects,
      dynamicObjects,
      characters
    },
    map,
    player
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

    // Get user inputs
    this.setupInput();
  }

  private setupInput() {
    document.addEventListener("keydown", (e) => {
      if (this.keyPresses.includes(e.code)) return;

      this.keyPresses.push(e.code);
    });

    document.addEventListener("keyup", (e) => {
      this.keyPresses = this.keyPresses.filter((key) => key !== e.code);
    });
  }

  private update(deltaTime: number) {
    this.update_world(deltaTime, this.keyPresses);
  }

  private render() {
    this.canvasDraw.clearScene();
    this.render_world();
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
