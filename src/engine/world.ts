import { BaseObject, type BaseObjectProps } from "./objects/base-object";
import { Camera } from "./camera";
import CanvasDraw from "./canvas-draw";
import { DynamicObject } from "./objects/dynamic-object";
import Character, {
  CharacterBaseConfigs,
  type CharacterProps
} from "./objects/character";
import Player from "./objects/player";
import { ObjectOptions } from "./types";

interface WorldProps<ObjectOptionsGenericType extends ObjectOptions> {
  player: Omit<
    CharacterProps<
      Extract<keyof ObjectOptionsGenericType["characters"], string>
    >,
    "canvasDraw"
  >;
  tilesConfig: ObjectOptions["tilesConfig"];
  tileOptions: ObjectOptions["tiles"];
  staticObjectsOptions: ObjectOptions["staticObjects"];
  dynamicObjectsOptions: ObjectOptions["dynamicObjects"];
  map: string[][];
  screenWidth: number;
  screenHeight: number;
}

export class World<ObjectOptionsGenericType extends ObjectOptions> {
  canvasDraw: CanvasDraw;
  screenWidth: number;
  screenHeight: number;

  private worldWidth: number = 0;
  private worldHeight: number = 0;

  camera: Camera;
  private tiles: BaseObject[] = [];
  private staticObjects: BaseObject[] = [];
  private dynamicObjects: DynamicObject[] = [];
  private characters: Character<
    Extract<keyof ObjectOptionsGenericType["characters"], string>
  >[] = [];
  private player: Player<ObjectOptionsGenericType>;
  private CharacterBaseConfigs: CharacterBaseConfigs;
  private tilesConfig: ObjectOptionsGenericType["tilesConfig"];
  private tileOptions: ObjectOptionsGenericType["tiles"];
  private map: string[][];

  constructor({
    player: { CharacterBaseConfigs, ...player },
    tilesConfig,
    tileOptions,
    staticObjectsOptions,
    dynamicObjectsOptions,
    map
  }: WorldProps<ObjectOptionsGenericType>) {
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

    this.tilesConfig = tilesConfig;
    this.tileOptions = tileOptions;
    this.map = map;

    this.camera = new Camera({
      x: 0,
      y: 0,
      width: this.screenWidth,
      height: this.screenHeight
    });

    this.CharacterBaseConfigs = CharacterBaseConfigs;
    this.player = new Player({
      ...player,
      CharacterBaseConfigs,
      canvasDraw: this.canvasDraw
    });

    this.generate_world();
  }

  generate_world() {
    this.map.forEach((row, rowIndex) => {
      const y = rowIndex + 1;
      row.forEach((tile, colIndex) => {
        const x = colIndex + 1;

        // We need "-1" to prevent a gap between tiles
        const newTile = new BaseObject({
          x: x * (this.tilesConfig.width - 1) - this.tilesConfig.width / 2,
          y: y * (this.tilesConfig.height - 1) - this.tilesConfig.height / 2,
          width: this.tilesConfig.width,
          height: this.tilesConfig.height,
          texture: this.tileOptions[tile],
          canvasDraw: this.canvasDraw
        });

        // Set world width and height
        const calcTileMaxX = newTile.x + newTile.width / 2;
        const calcTileMaxY = newTile.y + newTile.height / 2;

        if (calcTileMaxX > this.worldWidth) {
          this.worldWidth = calcTileMaxX;
        }
        if (calcTileMaxY > this.worldHeight) {
          this.worldHeight = calcTileMaxY;
        }

        this.tiles.push(newTile);
      });
    });
  }

  update_world(deltaTime: number, keyPresses: string[]) {
    this.characters.forEach((character) => {
      character.update(deltaTime, keyPresses);
    });

    const isPlayerCollidingWithCharacter = this.characters.find((character) => {
      return this.player.checkColliding(character, deltaTime);
    });

    const isPlayerCollidingWithWorldEdge = this.player.isReachingEdge(
      this.getWorldBounds(),
      deltaTime
    );

    if (isPlayerCollidingWithCharacter || isPlayerCollidingWithWorldEdge) {
      this.player.isColliding = true;
    } else {
      this.player.isColliding = false;
    }

    this.player.update(deltaTime, keyPresses);

    this.camera.moveTo(
      this.player.x - this.camera.width / 2,
      this.player.y - this.camera.height / 2
    );

    this.camera.updateShake();
  }

  render_world() {
    this.canvasDraw.ctx.save();

    const cameraPos = this.camera.getFinalPosition();
    this.canvasDraw.ctx.translate(-cameraPos.x, -cameraPos.y);

    this.tiles.forEach((tile) => {
      if (this.camera.isVisible(tile)) {
        tile.render();
      }
    });

    this.staticObjects.forEach((object) => {
      if (this.camera.isVisible(object)) {
        object.render();
      }
    });

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

  private getWorldBounds() {
    return {
      minX: 0,
      minY: 0,
      maxX: this.worldWidth,
      maxY: this.worldHeight
    };
  }

  addStaticObject(staticObject: Omit<BaseObjectProps, "canvasDraw">) {
    this.staticObjects.push(
      new BaseObject({ ...staticObject, canvasDraw: this.canvasDraw })
    );

    return this.staticObjects.length - 1;
  }

  removeStaticObject(staticObjectIndex: number) {
    // remove with splice for performance
    if (this.staticObjects[staticObjectIndex]) {
      this.staticObjects.splice(staticObjectIndex, 1);
    }
  }

  addDynamicObject(dynamicObject: Omit<BaseObjectProps, "canvasDraw">) {
    this.dynamicObjects.push(
      new DynamicObject({ ...dynamicObject, canvasDraw: this.canvasDraw })
    );

    return this.dynamicObjects.length - 1;
  }

  removeDynamicObject(dynamicObjectIndex: number) {
    // remove with splice for performance
    if (this.dynamicObjects[dynamicObjectIndex]) {
      this.dynamicObjects.splice(dynamicObjectIndex, 1);
    }
  }

  addCharacter(
    character: Omit<
      CharacterProps<
        Extract<keyof ObjectOptionsGenericType["characters"], string>
      >,
      "canvasDraw" | "CharacterBaseConfigs"
    >
  ) {
    this.characters.push(
      new Character({
        ...character,
        CharacterBaseConfigs: this.CharacterBaseConfigs,
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
}
