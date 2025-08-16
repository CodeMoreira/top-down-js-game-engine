import Engine from "./engine";

const objectOptions = {
  tilesConfig: { width: 40, height: 40 },
  tiles: {
    grass: "#4CAF50",
    stone: "#9E9E9E",
    water: "#2196F3",
    tree: "#2E7D32",
    rock: "#616161",
    big_tree: "#1B5E20"
  },
  staticObjects: {},
  dynamicObjects: {},
  characters: {
    peter: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(22,103,212, 1)"
    },
    marty: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(41,190,80, 1)"
    },
    steve: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(212,118,22, 1)"
    },
    bruce: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(200,50,150, 1)"
    }
  }
} as const;

const textures: Array<keyof (typeof objectOptions)["tiles"]> = [
  "grass",
  "stone",
  "tree",
  "rock",
  "big_tree"
];

const row = () => {
  return new Array(50).fill(0).map(() => {
    const texture = Math.floor(Math.random() * textures.length);
    return textures[texture];
  });
};

const engine = new Engine({
  devMode: true,
  map: new Array(50).fill(0).map(() => row()),
  objectOptions,
  player: {
    x: 105,
    y: 105,
    character: "bruce"
  }
});

// Add some characters
// engine.addCharacter({
//   x: window.innerWidth - 500,
//   y: window.innerHeight - 105,
//   character: "peter"
// });
// const steve = engine.addCharacter({
//   x: window.innerWidth + 15,
//   y: window.innerHeight - 300,
//   character: "steve"
// });

// setTimeout(() => {
//   engine.cameraTarget = { objectType: "character", id: steve.id };

//   setTimeout(() => {
//     engine.cameraTarget = { objectType: "character", id: "player" };
//   }, 5000);
// }, 3000);

document.addEventListener("DOMContentLoaded", () => {
  engine.start();
});
