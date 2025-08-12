import Engine from "./engine";

const engine = new Engine({
  player: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    character: "bruce"
  }
});

engine.addCharacter({
  x: window.innerWidth / 2 - 150,
  y: window.innerHeight / 2,
  character: "peter"
});

engine.addCharacter({
  x: window.innerWidth / 2 + 150,
  y: window.innerHeight / 2,
  character: "steve"
});

document.addEventListener("DOMContentLoaded", () => {
  engine.start();
});
