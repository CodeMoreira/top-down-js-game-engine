import CanvasDraw from "../canvas-draw";
import { ObjectParts } from "../types";

export interface BaseObjectProps {
  x: number;
  y: number;
  texture?: string;
  canvasDraw: CanvasDraw;
}

interface IBaseObject {
  canvasDraw: CanvasDraw;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  drawObject(position: [number, number], part?: ObjectParts): void;
  render(part?: ObjectParts): void;
  setPosition(x: number, y: number): void;
}

export class BaseObject implements IBaseObject {
  canvasDraw: CanvasDraw;

  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;

  constructor({
    x,
    y,
    texture = "rgba(41, 190, 80)",
    canvasDraw
  }: BaseObjectProps) {
    this.canvasDraw = canvasDraw;
    this.texture = texture;

    this.x = x;
    this.y = y;
    this.width = 65;
    this.height = 65;
  }

  drawObject(position: [number, number], part?: ObjectParts) {
    // draw character name
    switch (part) {
      case "top":
        this.canvasDraw.drawBox(
          [position[0] - this.width / 2, position[1] - this.height / 2],
          [position[0] + this.width / 2, position[1]],
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
          position,
          [position[0] + this.width, position[1] + this.height],
          this.texture,
          true
        );
        break;
    }

    // draw anchor point
    this.canvasDraw.drawCircle(this.x, this.y, 5, "red");
  }

  render(part?: ObjectParts) {
    this.drawObject([this.x, this.y], part);
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
