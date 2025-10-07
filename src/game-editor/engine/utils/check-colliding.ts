export interface ObjectParams {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkColliding(object1: ObjectParams, object2: ObjectParams) {
  // Bottom-middle anchored AABB collision
  const leftA = object1.x - object1.width / 2;
  const rightA = object1.x + object1.width / 2;
  const topA = object1.y - object1.height;
  const bottomA = object1.y;

  const leftB = object2.x - object2.width / 2;
  const rightB = object2.x + object2.width / 2;
  const topB = object2.y - object2.height;
  const bottomB = object2.y;

  const isMovementColliding =
    leftA < rightB && rightA > leftB && topA < bottomB && bottomA > topB;

  return isMovementColliding;
}
