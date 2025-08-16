import CanvasDraw from "../canvas-draw";
import { ObjectParts } from "../types";

export interface BaseObjectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  canvasDraw: CanvasDraw;
}

export class BaseObject {
  readonly id: string | "player" = Math.random().toString(36).slice(2);
  canvasDraw: CanvasDraw;

  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;

  constructor({ x, y, width, height, texture, canvasDraw }: BaseObjectProps) {
    this.canvasDraw = canvasDraw;
    this.texture = texture;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  drawObject(position: [number, number], part?: ObjectParts) {
    // draw character name
    switch (part) {
      case "top":
        this.canvasDraw.drawBox(
          [position[0] - this.width / 2, position[1] - this.height / 2],
          // The "+1" prevent a gap between parts
          [position[0] + this.width / 2, position[1] + 1],
          this.texture,
          true
        );
        break;
      case "bottom":
        this.canvasDraw.drawBox(
          [position[0] - this.width / 2, position[1] + this.height / 2],
          [position[0] + this.width / 2, position[1]],
          this.texture,
          true
        );
        break;
      default:
        this.canvasDraw.drawBox(
          [position[0] - this.width / 2, position[1] - this.height / 2],
          [position[0] + this.width / 2, position[1] + this.height / 2],
          this.texture,
          true
        );
        break;
    }

    // draw anchor point
    // this.canvasDraw.drawCircle(this.x, this.y, 5, "red");
  }

  render(part?: ObjectParts) {
    this.drawObject([this.x, this.y], part);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
