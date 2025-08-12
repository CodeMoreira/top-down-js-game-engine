import { CharacterBaseConfigs } from "./characters-base-config";
import type { ObjectParts } from "./types";
import { DynamicObject } from "./base-object/dynamic-object";
import { type BaseObjectProps } from "./base-object/base-object";

export interface CharacterProps extends BaseObjectProps {
  character: keyof typeof CharacterBaseConfigs;
}

interface ICharacter extends DynamicObject {
  character: keyof typeof CharacterBaseConfigs;
  drawName(): void;
}

export default class Character extends DynamicObject implements ICharacter {
  character: keyof typeof CharacterBaseConfigs;

  constructor({ x, y, character = "peter", canvasDraw }: CharacterProps) {
    super({ x, y, canvasDraw });

    this.canvasDraw = canvasDraw;

    this.x = x;
    this.y = y;
    this.character = character;
    this.width = CharacterBaseConfigs[character].width;
    this.height = CharacterBaseConfigs[character].height;
    this.speed = CharacterBaseConfigs[character].speed; // pixels per second
    this.texture = CharacterBaseConfigs[character].texture.join(",");

    this.collidesWith = null;

    // Properties for animation
    this.isMoving = false;
    this.direction = { x: 0, y: 0 };
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

  render(part?: ObjectParts) {
    // Draw direction indicator
    if (this.isMoving) {
      this.drawDirectionIndicator();
    }

    this.drawObject([this.x, this.y], part);
  }
}
