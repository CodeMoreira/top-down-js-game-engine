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
  protected canvasDraw: CanvasDraw;
  protected canvasElement: HTMLCanvasElement;
  protected screenWidth: number;
  protected screenHeight: number;

  private worldWidth: number = 0;
  private worldHeight: number = 0;

  protected camera: Camera;
  cameraTarget: {
    objectType: "static" | "dynamic" | "character";
    id: "player" | string;
  } = { objectType: "character", id: "player" };
  private tiles: BaseObject[] = [];
  private staticObjects: BaseObject[] = [];
  private dynamicObjects: DynamicObject[] = [];
  private characters: Character<
    Extract<keyof ObjectOptionsGenericType["characters"], string>
  >[] = [];
  protected player: Player<ObjectOptionsGenericType>;
  private CharacterBaseConfigs: CharacterBaseConfigs;
  protected tilesConfig: ObjectOptionsGenericType["tilesConfig"];
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
    this.canvasElement = document.createElement("canvas");
    this.canvasElement.width = this.screenWidth;
    this.canvasElement.height = this.screenHeight;
    document.body.appendChild(this.canvasElement);

    // Get context
    const ctx = this.canvasElement.getContext("2d")!;

    this.canvasDraw = new CanvasDraw({ ctx });

    this.tilesConfig = tilesConfig;
    this.tileOptions = tileOptions;
    this.map = map;

    this.camera = new Camera({
      tilesConfig: tilesConfig,
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

  protected getWorldBounds() {
    return {
      minX: 0,
      minY: 0,
      maxX: this.worldWidth,
      maxY: this.worldHeight
    };
  }

  private setWorldBoundsByTile(tileX: number, tileY: number) {
    const calcTileMaxX = tileX + this.tilesConfig.width / 2 - 10;
    const calcTileMaxY = tileY + this.tilesConfig.height / 2 - 10;

    if (calcTileMaxX > this.worldWidth) {
      this.worldWidth = calcTileMaxX;
    }
    if (calcTileMaxY > this.worldHeight) {
      this.worldHeight = calcTileMaxY;
    }

    const { minX, minY, maxX, maxY } = this.getWorldBounds();
    this.camera.setBounds(minX, minY, maxX, maxY);
  }

  protected generate_world() {
    this.map.forEach((row, rowIndex) => {
      const y = rowIndex + 1;
      row.forEach((tile, colIndex) => {
        const x = colIndex + 1;

        // We need "-1" to prevent a gap between tiles
        const newTile = new BaseObject({
          x: x * this.tilesConfig.width - this.tilesConfig.width / 2,
          y: y * this.tilesConfig.height - this.tilesConfig.height / 2,
          width: this.tilesConfig.width,
          height: this.tilesConfig.height,
          texture: this.tileOptions[tile],
          canvasDraw: this.canvasDraw
        });

        this.setWorldBoundsByTile(newTile.x, newTile.y);

        this.tiles.push(newTile);
      });
    });

    // this.camera.shake(20, 300);
  }

  private setCameraToFollowTarget() {
    let followTargetPosition: { x: number; y: number } = { x: 0, y: 0 };

    const cameraTargetCases = {
      static: () => {
        const staticObject = this.staticObjects.find(
          (o) => o.id === this.cameraTarget.id
        )!;
        followTargetPosition = { x: staticObject.x, y: staticObject.y };
      },
      dynamic: () => {
        const dynamicObject = this.dynamicObjects.find(
          (o) => o.id === this.cameraTarget.id
        )!;
        followTargetPosition = { x: dynamicObject.x, y: dynamicObject.y };
      },
      character: () => {
        const character = this.characters.find(
          (c) => c.id === this.cameraTarget.id
        )!;
        followTargetPosition = { x: character.x, y: character.y };
      }
    };

    if (
      this.cameraTarget.objectType === "character" &&
      this.cameraTarget.id === "player"
    ) {
      followTargetPosition = { x: this.player.x, y: this.player.y };
    } else {
      cameraTargetCases[this.cameraTarget.objectType]();
    }

    this.camera.follow(
      { x: followTargetPosition.x, y: followTargetPosition.y },
      true
    );
  }

  protected update_dev_world(deltaTime: number, keyPresses: string[]) {
    this.player.update(deltaTime, keyPresses);

    this.setCameraToFollowTarget();

    this.camera.updateShake();
  }

  protected render_dev_world() {
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

  protected update_world(deltaTime: number, keyPresses: string[]) {
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
      this.player.y - this.camera.height / 2,
      true
    );

    this.camera.updateShake();
  }

  protected render_world() {
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

  protected addTile({
    texture,
    ...rest
  }: Omit<BaseObjectProps, "canvasDraw" | "width" | "height">) {
    this.removeTile(rest.x, rest.y);

    const newTile = new BaseObject({
      texture: this.tileOptions[texture],
      width: this.tilesConfig.width,
      height: this.tilesConfig.height,
      canvasDraw: this.canvasDraw,
      ...rest
    });

    this.tiles.push(newTile);

    this.setWorldBoundsByTile(newTile.x, newTile.y);
  }

  protected removeTile(x: number, y: number) {
    // remove with splice for performance
    this.tiles.forEach((tile, index) => {
      if (tile.x === x && tile.y === y) {
        this.tiles.splice(index, 1);
      }
    });
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

  protected removeDynamicObject(dynamicObjectIndex: number) {
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
    const newCharacter = new Character({
      ...character,
      CharacterBaseConfigs: this.CharacterBaseConfigs,
      canvasDraw: this.canvasDraw
    });

    this.characters.push(newCharacter);

    return { index: this.characters.length - 1, id: newCharacter.id };
  }

  removeCharacter(characterIndex: number) {
    // remove with splice for performance
    if (this.characters[characterIndex]) {
      this.characters.splice(characterIndex, 1);
    }
  }
}
