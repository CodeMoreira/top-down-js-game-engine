import { BaseObject } from "./base-object/base-object";
import { DynamicObject } from "./base-object/dynamic-object";
import CanvasDraw from "./canvas-draw";
import Character from "./character";
import Player from "./player";

interface EngineProps {
  screenWidth: number;
  screenHeight: number;
}

export default class Engine {
  private canvasDraw: CanvasDraw;

  private isRunning: boolean = false;
  private keyPresses: string[] = [];
  private lastTime: number = 0;
  private deltaTime: number = 0;

  private staticObjects: BaseObject[] = [];
  private dynamicObjects: DynamicObject[] = [];
  private characters: Character[] = [];
  private player: Player;

  constructor({ screenWidth, screenHeight }: EngineProps) {
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    document.body.appendChild(canvas);

    // Get context
    const ctx = canvas.getContext("2d")!;

    this.canvasDraw = new CanvasDraw({ ctx });

    // Get player inputs
    this.setupInput();

    // Add characters
    this.characters.push(
      new Character({
        x: screenWidth / 2 - 150,
        y: screenHeight / 2,
        character: "peter",
        canvasDraw: this.canvasDraw
      }),
      new Character({
        x: screenWidth / 2,
        y: screenHeight / 2,
        character: "marty",
        canvasDraw: this.canvasDraw
      }),
      new Character({
        x: screenWidth / 2 + 150,
        y: screenHeight / 2,
        character: "steve",
        canvasDraw: this.canvasDraw
      })
    );

    this.player = new Player({
      x: screenWidth / 2,
      y: screenHeight / 2 - 100,
      character: "bruce",
      canvasDraw: this.canvasDraw
    });
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
    this.characters.forEach((character) => {
      character.update(deltaTime, this.keyPresses);
    });

    const isPlayerColliding = this.characters.find((character) => {
      return this.player.isColliding(character, deltaTime);
    });

    if (isPlayerColliding) {
      this.player.collidesWith = isPlayerColliding;
    } else {
      this.player.collidesWith = null;
    }

    this.player.update(deltaTime, this.keyPresses);
  }

  private render() {
    this.canvasDraw.clearScene();

    // this.characters.forEach((object) => {
    //   object.render();
    // });

    this.player.render("bottom");

    this.characters.forEach((character) => {
      character.render("bottom");
    });

    this.characters.forEach((character) => {
      character.render("top");
      character.drawName();
    });

    this.player.render("top");

    this.characters.forEach((character) => {
      character.drawName();
    });

    this.player.drawName();
  }

  private gameLoop() {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // convert to seconds
    this.lastTime = currentTime;

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
