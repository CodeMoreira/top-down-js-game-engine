import { BaseObject, BaseObjectProps } from "./base-object/base-object";
import { DynamicObject } from "./base-object/dynamic-object";
import { Camera } from "./camera";
import CanvasDraw from "./canvas-draw";
import Character, { CharacterProps } from "./character";
import Player from "./player";
import { World } from "./world";

interface EngineProps {
  player: Omit<CharacterProps, "canvasDraw">;
}

export default class Engine {
  private canvasDraw: CanvasDraw;

  private isRunning: boolean = false;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private keyPresses: string[] = [];

  private staticObjects: BaseObject[] = [];
  private dynamicObjects: DynamicObject[] = [];
  private characters: Character[] = [];
  private world: World;
  private camera: Camera;
  private player: Player;

  private screenWidth: number;
  private screenHeight: number;

  constructor({ player }: EngineProps) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = this.screenWidth;
    canvas.height = this.screenHeight;
    document.body.appendChild(canvas);

    // Get context
    const ctx = canvas.getContext("2d")!;

    this.canvasDraw = new CanvasDraw({ ctx });

    this.world = new World({ canvasDraw: this.canvasDraw });

    this.camera = new Camera({
      x: 0,
      y: 0,
      width: this.screenWidth,
      height: this.screenHeight
    });

    this.player = new Player({ ...player, canvasDraw: this.canvasDraw });

    this.camera.setBounds(0, 0, this.world.worldWidth, this.world.worldHeight);

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
    this.characters.forEach((character) => {
      character.update(deltaTime, this.keyPresses);
    });

    const isPlayerCollidingWithCharacter = this.characters.find((character) => {
      return this.player.checkColliding(character, deltaTime);
    });

    const isPlayerCollidingWithWorldEdge = this.player.isReachingEdge(
      this.world,
      deltaTime
    );

    if (isPlayerCollidingWithCharacter || isPlayerCollidingWithWorldEdge) {
      this.player.isColliding = true;
    } else {
      this.player.isColliding = false;
    }

    this.player.update(deltaTime, this.keyPresses);

    this.camera.moveTo(
      this.player.x - this.camera.width / 2,
      this.player.y - this.camera.height / 2
    );

    this.camera.updateShake();
  }

  private render() {
    this.canvasDraw.clearScene();
    this.canvasDraw.ctx.save();

    const cameraPos = this.camera.getFinalPosition();
    this.canvasDraw.ctx.translate(-cameraPos.x, -cameraPos.y);

    this.world.render(this.camera);

    this.player.render("bottom");

    this.characters.forEach((character) => {
      if (!this.camera.isVisible(character)) return;

      character.render("bottom");
    });

    this.characters.forEach((character) => {
      if (!this.camera.isVisible(character)) return;

      character.render("top");
    });

    this.player.render("top");
    this.player.drawName();

    this.canvasDraw.ctx.restore();
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

  addCharacter(character: Omit<CharacterProps, "canvasDraw">) {
    this.characters.push(
      new Character({
        ...character,
        canvasDraw: this.canvasDraw
      })
    );

    return this.characters.length - 1;
  }

  removeCharacter(characterIndex: number) {
    // remove with splice for performance
    if (this.characters[characterIndex]) {
      this.characters.splice(characterIndex, 1);
    }
  }

  addDynamicObject(dynamicObject: Omit<BaseObjectProps, "canvasDraw">) {
    this.dynamicObjects.push(
      new DynamicObject({ ...dynamicObject, canvasDraw: this.canvasDraw })
    );
  }

  removeDynamicObject(dynamicObjectIndex: number) {
    // remove with splice for performance
    if (this.dynamicObjects[dynamicObjectIndex]) {
      this.dynamicObjects.splice(dynamicObjectIndex, 1);
    }
  }

  addStaticObject(staticObject: Omit<BaseObjectProps, "canvasDraw">) {
    this.staticObjects.push(
      new BaseObject({ ...staticObject, canvasDraw: this.canvasDraw })
    );
  }

  removeStaticObject(staticObjectIndex: number) {
    // remove with splice for performance
    if (this.staticObjects[staticObjectIndex]) {
      this.staticObjects.splice(staticObjectIndex, 1);
    }
  }
}
