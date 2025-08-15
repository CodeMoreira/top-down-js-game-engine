import { ObjectParts } from "../types";
import { World } from "../world";
import { BaseObject, type BaseObjectProps } from "./base-object";

interface IWorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class DynamicObject extends BaseObject {
  speed: number;

  // Properties for animation
  isMoving: boolean = false;
  direction: { x: number; y: number } = { x: 0, y: 0 };

  isColliding: boolean = false;

  constructor(props: BaseObjectProps) {
    super(props);
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

  render(part?: ObjectParts) {
    this.drawObject([this.x, this.y], part);
    // Draw direction indicator
    if (this.isMoving) {
      this.drawDirectionIndicator();
    }
  }

  calcMovement(deltaTime: number) {
    return {
      x: this.x + this.direction.x * this.speed * deltaTime,
      y: this.y + this.direction.y * this.speed * deltaTime
    };
  }

  checkColliding(other: BaseObject, deltaTime: number) {
    const movement = this.calcMovement(deltaTime);

    // Check only for the bottom part of the character.
    const isMovementColliding =
      movement.x < other.x + other.width &&
      movement.x + this.width > other.x &&
      movement.y + this.height / 2 < other.y + other.height &&
      movement.y + this.height / 2 > other.y;

    return isMovementColliding;
  }

  isReachingEdge(worldBounds: IWorldBounds, deltaTime: number) {
    const movement = this.calcMovement(deltaTime);

    return (
      movement.x - this.width / 2 <= worldBounds.minX ||
      movement.x + this.width / 2 > worldBounds.maxX ||
      movement.y <= worldBounds.minY ||
      movement.y + this.height / 2 > worldBounds.maxY
    );
  }
}
