import { ObjectParts } from "../types";
import { BaseObject, type BaseObjectProps } from "./base-object";

interface IDynamicObject extends BaseObject {
  speed: number;
  texture: string;
  isMoving: boolean;
  direction: { x: number; y: number };
  collidesWith: BaseObject | null;
  update(deltaTime: number, keys: string[]): void;
  calcMovement(deltaTime: number): { x: number; y: number };
  isColliding(other: BaseObject, deltaTime: number): void;
}

export class DynamicObject extends BaseObject implements IDynamicObject {
  speed: number;
  texture: string;
  isMoving: boolean;
  direction: { x: number; y: number };
  collidesWith: BaseObject | null;

  constructor({ x, y, canvasDraw }: BaseObjectProps) {
    super({ x, y, canvasDraw });

    this.canvasDraw = canvasDraw;

    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.speed = 0; // pixels per second
    this.texture = "41, 190, 80";

    this.collidesWith = null;

    // Properties for animation
    this.isMoving = false;
    this.direction = { x: 0, y: 0 };
  }

  update(_deltaTime: number, _keys: string[]) {}

  drawDirectionIndicator() {
    this.canvasDraw.drawLine(
      [this.x, this.y],
      [this.x + this.direction.x * 40, this.y + this.direction.y * 40],
      "yellow",
      1
    );
  }

  render(_part?: ObjectParts) {
    // Draw direction indicator
    if (this.isMoving) {
      this.drawDirectionIndicator();
    }

    this.drawObject([this.x, this.y]);
  }

  calcMovement(deltaTime: number) {
    return {
      x: this.x + this.direction.x * this.speed * deltaTime,
      y: this.y + this.direction.y * this.speed * deltaTime
    };
  }

  isColliding(other: BaseObject, deltaTime: number) {
    const movement = this.calcMovement(deltaTime);

    const isMovementColliding =
      movement.x < other.x + other.width &&
      movement.x + this.width > other.x &&
      movement.y < other.y + other.height / 2 &&
      movement.y + this.height / 2 > other.y;

    return isMovementColliding;
  }
}
