import Character, { type CharacterProps } from "./character";
import { controls } from "../controls";
import { ObjectOptions } from "../types";

export default class Player<
  ObjectOptionsGenericType extends ObjectOptions
> extends Character<
  Extract<keyof ObjectOptionsGenericType["characters"], string>
> {
  readonly id: string | "player" = "player";

  constructor(
    props: CharacterProps<
      Extract<keyof ObjectOptionsGenericType["characters"], string>
    >
  ) {
    super(props);
  }

  update(deltaTime: number, keys: string[]) {
    let moveX = 0;
    let moveY = 0;
    let aceleration = this.speed; // pixels per second

    // Handle movement
    keys.forEach((key) => {
      if (controls.sprint[key]) {
        aceleration = this.speed * 2;
      }
      if (controls.move_up[key]) {
        moveY = -1;
      }
      if (controls.move_down[key]) {
        moveY = 1;
      }
      if (controls.move_left[key]) {
        moveX = -1;
      }
      if (controls.move_right[key]) {
        moveX = 1;
      }
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

    if (this.isColliding) {
      moveX = 0;
      moveY = 0;
    }

    // Apply movement
    this.x += moveX * aceleration * deltaTime;
    this.y += moveY * aceleration * deltaTime;
  }
}
