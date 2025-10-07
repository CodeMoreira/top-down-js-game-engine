import { checkColliding } from "../utils/check-colliding";
import { GameObject, type GameObjectProps } from "./game-object";

export interface CollisionBoxObjectProps
  extends Omit<GameObjectProps, "texture" | "x" | "y"> {
  showCollisionBox?: boolean;
}

export class CollisionBoxObject extends GameObject {
  showCollisionBox: boolean;
  isColliding: CollisionBoxObject | null = null;

  constructor({ showCollisionBox = false, ...props }: CollisionBoxObjectProps) {
    super({ texture: "transparent", x: 0, y: 0, ...props });

    this.showCollisionBox = showCollisionBox;
  }

  render() {
    if (this.showCollisionBox) {
      this.canvasDraw.drawBox(
        [this.x - this.width / 2, this.y - this.height],
        [this.x + this.width / 2, this.y],
        this.isColliding ? "green" : "red"
      );

      this.canvasDraw.drawCircle(this.x, this.y, 5, "red");
    }
  }

  checkColliding(other: CollisionBoxObject) {
    const isColliding = checkColliding(this, other);

    if (isColliding) {
      this.isColliding = other;
    } else {
      this.isColliding = null;
    }

    return isColliding;
  }

  // isReachingEdge(worldBounds: IWorldBounds, deltaTime: number) {
  //   const movement = this.calcMovement(deltaTime);

  //   return (
  //     movement.x - this.width / 2 <= worldBounds.minX ||
  //     movement.x + this.width / 2 > worldBounds.maxX ||
  //     movement.y <= worldBounds.minY ||
  //     movement.y + this.height / 2 > worldBounds.maxY
  //   );
  // }
}
