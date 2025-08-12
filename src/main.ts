import Engine from "./engine";

const engine = new Engine({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight
});

engine.start();
