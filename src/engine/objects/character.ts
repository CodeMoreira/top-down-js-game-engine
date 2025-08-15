import { DynamicObject } from "./dynamic-object";
import type { BaseObjectProps } from "./base-object";
import { DynamicObjectBaseOptions } from "../types";

export interface CharacterBaseConfigs {
  [key: string]: DynamicObjectBaseOptions;
}

export interface CharacterProps<Characters extends string>
  extends Omit<BaseObjectProps, "texture" | "width" | "height"> {
  character: Characters;
  CharacterBaseConfigs: CharacterBaseConfigs;
}

export default class Character<
  Characters extends string
> extends DynamicObject {
  character: Characters;

  constructor({
    x,
    y,
    character,
    CharacterBaseConfigs,
    canvasDraw
  }: CharacterProps<Characters>) {
    super({
      x,
      y,
      width: CharacterBaseConfigs[character].width,
      height: CharacterBaseConfigs[character].height,
      canvasDraw,
      texture: CharacterBaseConfigs[character].texture
    });

    this.character = character;
    this.width = CharacterBaseConfigs[character].width;
    this.height = CharacterBaseConfigs[character].height;
    this.speed = CharacterBaseConfigs[character].speed; // pixels per second
  }

  // drawObject(position: [number, number]) {
  //   const imagePath = `./images/${playableCharacter}.png`;
  //   const image = new Image();
  //   image.src = imagePath;
  //   image.onload = () => {
  //     this.ctx.drawImage(image, position[0], position[1]);
  //   };
  // }

  drawName() {
    this.canvasDraw.drawText(
      this.character,
      this.x,
      this.y - this.height / 2 - 5,
      "white"
    );
  }
}
