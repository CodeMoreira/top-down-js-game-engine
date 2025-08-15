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

const engine = new Engine({
  map: [
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "stone", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"],
    ["grass", "grass", "grass", "grass", "grass", "grass", "grass"]
  ],
  objectOptions,
  player: {
    x: 105,
    y: 105,
    character: "bruce"
  }
});

// Add some characters
engine.addCharacter({
  x: 30,
  y: 105,
  character: "peter"
});
engine.addCharacter({
  x: 180,
  y: 105,
  character: "steve"
});

document.addEventListener("DOMContentLoaded", () => {
  engine.start();
});
