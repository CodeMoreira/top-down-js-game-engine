import { controls } from "./controls";
import { CollisionBoxObject } from "./engine/objects/collision-box-object";
import { GameObject } from "./engine/objects/game-object";
import { checkColliding } from "./engine/utils/check-colliding";

interface HandlePlayerMovementProps {
  player: GameObject;
  collisionBox: CollisionBoxObject;
  speed: number;
}

interface UpdateProps {
  deltaTime: number;
  keys: string[];
}

export class HandlePlayerMovement {
  private readonly player: GameObject;
  private readonly collisionBox: CollisionBoxObject;
  private readonly speed: number;
  private isMoving = false;
  private direction = { x: 0, y: 0 };

  constructor({ collisionBox, player, speed }: HandlePlayerMovementProps) {
    this.collisionBox = collisionBox;
    this.player = player;
    this.speed = speed;
  }

  private wouldMovementCollide(
    movement: { x: number; y: number },
    other: CollisionBoxObject | null
  ): boolean {
    if (!other) return false;

    const willCollide = checkColliding(
      {
        width: this.collisionBox.width,
        height: this.collisionBox.height,
        x: movement.x,
        y: movement.y
      },
      other
    );

    return willCollide;
  }

  private calcMovement(
    movement: { x: number; y: number },
    aceleration: number,
    deltaTime: number
  ): { x: number; y: number } {
    return {
      x: this.player.x + movement.x * aceleration * deltaTime,
      y: this.player.y + movement.y * aceleration * deltaTime
    };
  }

  public move({ deltaTime, keys }: UpdateProps) {
    let moveX = 0;
    let moveY = 0;
    let aceleration = this.speed;

    // Handle movement
    keys.forEach((key) => {
      if (controls.sprint[key]) aceleration = this.speed * 2;
      if (controls.move_up[key]) moveY = -1;
      if (controls.move_down[key]) moveY = 1;
      if (controls.move_left[key]) moveX = -1;
      if (controls.move_right[key]) moveX = 1;
    });

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/√2
      moveY *= 0.707;
    }

    // Update movement state
    this.isMoving = moveX !== 0 || moveY !== 0;
    if (this.isMoving) {
      this.direction.x = moveX;
      this.direction.y = moveY;
    }

    let move = this.calcMovement(
      { x: moveX, y: moveY },
      aceleration,
      deltaTime
    );

    const willCollide = this.wouldMovementCollide(
      { x: move.x, y: move.y },
      this.collisionBox.isColliding
    );

    if (willCollide) {
      move = this.calcMovement({ x: 0, y: 0 }, aceleration, deltaTime);
    }

    // Update player position
    this.player.x = move.x;
    this.player.y = move.y;
  }
}
