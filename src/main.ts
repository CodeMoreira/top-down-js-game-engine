// import Engine from "./engine";
// import { GameObject } from "./engine/objects/game-object";
// import { HandlePlayerMovement } from "./handle-player-movement";
// import { SetupInputs } from "./setup-inputs";

// const objectOptions = {
//   tilesConfig: { width: 40, height: 40 },
//   tiles: {
//     grass: "#4CAF50",
//     stone: "#9E9E9E",
//     water: "#2196F3",
//     tree: "#2E7D32",
//     rock: "#616161",
//     big_tree: "#1B5E20"
//   },
//   staticObjects: {},
//   dynamicObjects: {},
//   characters: {
//     peter: {
//       width: 30,
//       height: 50,
//       speed: 200,
//       texture: "rgba(22,103,212, 1)"
//     },
//     marty: {
//       width: 30,
//       height: 50,
//       speed: 200,
//       texture: "rgba(41,190,80, 1)"
//     },
//     steve: {
//       width: 30,
//       height: 50,
//       speed: 200,
//       texture: "rgba(212,118,22, 1)"
//     },
//     bruce: {
//       width: 30,
//       height: 50,
//       speed: 200,
//       texture: "rgba(200,50,150, 1)"
//     }
//   }
// };
// const textures: Array<keyof (typeof objectOptions)["tiles"]> = [
//   "grass",
//   "stone",
//   "tree",
//   "rock",
//   "big_tree"
// ];

// const devMode = true;
// const engine = new Engine({ cameraStartPosition: { x: 0, y: 0 } });

// const mouseTile = engine.addGameObject({
//   x: 0,
//   y: 0,
//   width: objectOptions.tilesConfig.width,
//   height: objectOptions.tilesConfig.height,
//   texture: "#ffffff69"
// });

// const player = engine.addGameObject({
//   x: 100,
//   y: 100,
//   width: objectOptions.characters.peter.width,
//   height: objectOptions.characters.peter.height,
//   texture: objectOptions.characters.peter.texture
// });
// const playerCollisionBox = engine.addCollisionBox({
//   width: player.object.width,
//   height: player.object.height / 2,
//   showCollisionBox: true
// });
// player.object.addAttachment(playerCollisionBox.object);
// const playerMovement = new HandlePlayerMovement({
//   player: player.object,
//   collisionBox: playerCollisionBox.object,
//   speed: 200
// });

// const char1CollisionBox = engine.addCollisionBox({
//   width: player.object.width,
//   height: player.object.height,
//   showCollisionBox: true
// });

// engine.cameraTarget = player.object;

// const inputs = new SetupInputs(devMode);
// engine.onUpdate = (deltaTime: number) => {
//   // console.clear();
//   // console.log(JSON.stringify(inputs, null, 2));

//   playerMovement.move({
//     deltaTime,
//     keys: inputs.keyPresses
//   });
// };

// function getMousePositionToWorld() {
//   // 1. Convert mouse position from screen to world coordinates
//   const worldX = this.mouseClick.x + this.camera.x;
//   const worldY = this.mouseClick.y + this.camera.y;

//   // 2. Snap to the center of the nearest tile
//   const tileWidth = this.tilesConfig.width;
//   const tileHeight = this.tilesConfig.height;

//   const snappedX = Math.floor(worldX / tileWidth) * tileWidth + tileWidth / 2;
//   const snappedY =
//     Math.floor(worldY / tileHeight) * tileHeight + tileHeight / 2;

//   return {
//     closestTile: {
//       x: snappedX,
//       y: snappedY
//     },
//     tilePostionInWorld: {
//       x: snappedX,
//       y: snappedY
//     }
//   };
// }

// function addTileOnClick() {
//   if (this.player.isMoving) return;

//   const mousePostionToWorld = getMousePositionToWorld();

//   this.mouseTile.x = mousePostionToWorld.closestTile.x;
//   this.mouseTile.y = mousePostionToWorld.closestTile.y;

//   if (this.mouseClick.left) {
//     this.addTile({
//       texture: "water",
//       x: mousePostionToWorld.tilePostionInWorld.x,
//       y: mousePostionToWorld.tilePostionInWorld.y
//     });
//   }
// }

// function setWorldBoundsByTile(tileX: number, tileY: number) {
//   const calcTileMaxX = tileX + this.tilesConfig.width / 2;
//   const calcTileMaxY = tileY + this.tilesConfig.height / 2;

//   const calcTileMinX = tileX - this.tilesConfig.width / 2;
//   const calcTileMinY = tileY - this.tilesConfig.height / 2;

//   const cameraBounds = this.camera.getBounds();

//   this.camera.setBounds(
//     Math.min(cameraBounds.minX, calcTileMinX),
//     Math.min(cameraBounds.minY, calcTileMinY),
//     Math.max(cameraBounds.maxX, calcTileMaxX),
//     Math.max(cameraBounds.maxY, calcTileMaxY)
//   );
// }

// // Stracting props from function engine.addStaticObject
// function addTile(tile) {
//   this.removeTile(tile.x, tile.y);

//   const newTile = engine.addGameObject(tile);

//   this.tiles.push(newTile);
// }

// function removeTile(x: number, y: number) {
//   // remove with splice for performance
//   this.tiles.forEach((tile, index) => {
//     if (tile.x === x && tile.y === y) {
//       this.tiles.splice(index, 1);
//     }
//   });
// }

// // // Add some characters
// // const player = engine.addCharacter({
// //   x: window.innerWidth - 500,
// //   y: window.innerHeight - 105,
// //   character: "peter"
// // });

// // const steve = engine.addCharacter({
// //   x: window.innerWidth / 2,
// //   y: window.innerHeight / 2,
// //   character: "steve"
// // });

// // setTimeout(() => {
// //   engine.cameraTarget = { objectType: "character", id: steve.id };

// //   setTimeout(() => {
// //     engine.cameraTarget = { objectType: "character", id: "player" };
// //   }, 5000);
// // }, 3000);

// document.addEventListener("DOMContentLoaded", () => {
//   engine.start();
// });
