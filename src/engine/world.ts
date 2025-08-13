import { BaseObject } from "./base-object/base-object";
import { Camera } from "./camera";
import CanvasDraw from "./canvas-draw";
import { textures } from "./textures";

interface WorldProps {
  canvasDraw: CanvasDraw;
}

export class World {
  canvasDraw: CanvasDraw;

  tiles: BaseObject[] = [];
  objects: BaseObject[] = [];
  tileSize: number = 64;
  worldWidth: number = 2000;
  worldHeight: number = 2000;

  constructor({ canvasDraw }: WorldProps) {
    this.canvasDraw = canvasDraw;

    this.generateWorld();
  }

  generateWorld() {
    // Create a grid of tiles
    const tilesX = Math.ceil(this.worldWidth / this.tileSize);
    const tilesY = Math.ceil(this.worldHeight / this.tileSize);

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const tile = new BaseObject({
          x: x * this.tileSize,
          y: y * this.tileSize,
          texture: this.getTileType(x, y),
          canvasDraw: this.canvasDraw
        });
        this.tiles.push(tile);
      }
    }

    this.addDecorations();
  }

  getTileType(x: number, y: number) {
    // Create a simple pattern
    if ((x + y) % 16 === 0) return "stone";
    if (x % 5 === 0 && y % 5 === 0) return "tree";
    if ((x * y) % 13 === 0) return "water";
    return "grass";
  }

  addDecorations() {
    // Add some rocks and big trees
    for (let i = 0; i < 50; i++) {
      const obj = new BaseObject({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        texture: Math.random() > 0.5 ? "rock" : "big_tree",
        canvasDraw: this.canvasDraw
      });
      this.objects.push(obj);
    }
  }

  render(camera: Camera) {
    // Render visible tiles
    this.tiles.forEach((tile) => {
      if (camera.isVisible(tile)) {
        this.renderTile(tile);
      }
    });

    // Render visible objects
    this.objects.forEach((obj) => {
      if (camera.isVisible(obj)) {
        this.renderObject(obj);
      }
    });
  }

  renderTile(tile: BaseObject) {
    const color = textures[tile.texture] || "#8BC34A";

    this.canvasDraw.ctx.fillStyle = color;
    this.canvasDraw.ctx.fillRect(tile.x, tile.y, tile.width, tile.height);

    // Adicionar borda sutil
    this.canvasDraw.ctx.strokeStyle = "rgba(0,0,0,0.1)";
    this.canvasDraw.ctx.lineWidth = 1;
    this.canvasDraw.ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
  }

  renderObject(obj: BaseObject) {
    const color = textures[obj.texture] || "#795548";

    this.canvasDraw.ctx.fillStyle = "rgba(0,0,0,0.2)";
    this.canvasDraw.ctx.fillRect(obj.x, obj.y + obj.height + 5, obj.width, 5);

    this.canvasDraw.ctx.fillStyle = color;

    if (obj.texture === "big_tree") {
      // Desenhar árvore como círculo
      const centerX = obj.x + obj.width / 2;
      const centerY = obj.y + obj.height / 2;
      const radius = Math.min(obj.width, obj.height) / 2;

      this.canvasDraw.ctx.beginPath();
      this.canvasDraw.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.canvasDraw.ctx.fill();

      // Tronco
      this.canvasDraw.ctx.fillStyle = "#5D4037";
      this.canvasDraw.ctx.fillRect(centerX - 8, centerY + radius - 10, 16, 20);
    } else {
      // Desenhar como retângulo
      this.canvasDraw.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    }
  }

  getBounds() {
    return {
      minX: 0,
      minY: 0,
      maxX: this.worldWidth,
      maxY: this.worldHeight
    };
  }
}
