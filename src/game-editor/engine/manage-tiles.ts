import { Camera } from "./camera";

interface TileGridProps {
  left: number;
  top: number;
  right: number;
  bottom: number;
  ctx: CanvasRenderingContext2D;
}

interface Tile {
  "tl-tr-br-bl": string;
  // 1 1
  // 1 1

  "tl-tr-br": string;
  // 1 1
  // 1 0

  "tl-tr-bl": string;
  // 1 1
  // 0 1

  "tl-br-bl": string;
  // 1 0
  // 1 1

  "tr-br-bl": string;
  // 0 1
  // 1 1

  "tl-tr": string;
  // 1 1
  // 0 0

  "bl-br": string;
  // 0 0
  // 1 1

  "tl-bl": string;
  // 1 0
  // 1 0

  "tr-br": string;
  // 0 1
  // 0 1

  tl: string;
  // 1 0
  // 0 0

  tr: string;
  // 0 1
  // 0 0

  bl: string;
  // 0 0
  // 1 0

  br: string;
  // 0 0
  // 0 1
}

type TileKey = keyof Tile | "";

export interface ManageTilesProps {
  tiles: Record<string, Tile>;
  size: number;
}

export class ManageTiles {
  tiles: ManageTilesProps["tiles"];
  worldTiles: string[][] = [];
  displayTiles: TileKey[][] = [];

  showGrid: boolean = true;
  size: number;
  gridColor: string = "rgba(255,255,255,0.05)";

  constructor(props: ManageTilesProps) {
    this.tiles = props.tiles;
    this.size = props.size;
  }

  drawTileGrid({ left, top, right, bottom, ctx }: TileGridProps) {
    if (!this.showGrid) return;

    // display tile grid (offset by half a tile)
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;
    for (
      let gx =
        Math.floor((left - this.size / 2) / this.size) * this.size +
        this.size / 2;
      gx < right;
      gx += this.size
    ) {
      ctx.moveTo(gx, top);
      ctx.lineTo(gx, bottom);
    }
    for (
      let gy =
        Math.floor((top - this.size / 2) / this.size) * this.size +
        this.size / 2;
      gy < bottom;
      gy += this.size
    ) {
      ctx.moveTo(left, gy);
      ctx.lineTo(right, gy);
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  calculateDisplayTile(x: number, y: number) {
    // Get 4 neighbors (topLeft, topRight, botLeft, botRight)
    const topLeft = this.worldTiles[y - 1]?.[x - 1] || "";
    const topRight = this.worldTiles[y - 1]?.[x] || "";
    const botLeft = this.worldTiles[y]?.[x - 1] || "";
    const botRight = this.worldTiles[y]?.[x] || "";

    // Use a lookup table (like your Godot script) to pick the right display tile
    let atlasIndex: TileKey = "";
    switch (true) {
      case !!topLeft && !!topRight && !!botLeft && !!botRight:
        atlasIndex = "tl-tr-br-bl"; // All neighbors are set
        break;
      case !!topLeft && !!topRight && !!botLeft && !botRight:
        atlasIndex = "tl-tr-br"; // Missing bottom right
        break;
      case !!topLeft && !!topRight && !botLeft && !!botRight:
        atlasIndex = "tl-tr-br"; // Missing bottom left
        break;
      case !!topLeft && !topRight && !!botLeft && !!botRight:
        atlasIndex = "tl-tr-br"; // Missing top right
        break;
      case !topLeft && !!topRight && !!botLeft && !!botRight:
        atlasIndex = "tl-tr-br"; // Missing top left
        break;
      case !!topLeft && !!topRight && !botLeft && !botRight:
        atlasIndex = "tl-tr"; // Only top neighbors
        break;
      case !!botLeft && !!botRight && !topLeft && !topRight:
        atlasIndex = "bl-br"; // Only bottom neighbors
        break;
      case !!topLeft && !!botLeft && !topRight && !botRight:
        atlasIndex = "tl-bl"; // Only left neighbors
        break;
      case !!topRight && !!botRight && !topLeft && !botLeft:
        atlasIndex = "tr-br"; // Only right neighbors
        break;
      case !!topLeft && !topRight && !botLeft && !botRight:
        atlasIndex = "tl"; // Only top-left neighbor
        break;
      case !topLeft && !!topRight && !botLeft && !botRight:
        atlasIndex = "tr"; // Only top-right neighbor
        break;
      case !topLeft && !topRight && !!botLeft && !botRight:
        atlasIndex = "bl"; // Only bottom-left neighbor
        break;
      case !topLeft && !topRight && !botLeft && !!botRight:
        atlasIndex = "br"; // Only bottom-right neighbor
        break;
      default:
        atlasIndex = ""; // No neighbors
        break;
    }

    // Set displayTiles[y][x] = atlasIndex;
    this.displayTiles[y][x] = atlasIndex;
  }

  updateDisplayTilesAround(x: number, y: number) {
    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        this.calculateDisplayTile(x + dx, y + dy);
      }
    }
  }

  setWorldTile(x: number, y: number, type: string) {
    this.worldTiles[y][x] = type;
    this.updateDisplayTilesAround(x, y);
  }

  removeWorldTile(x: number, y: number) {
    this.worldTiles[y][x] = "";
    this.updateDisplayTilesAround(x, y);
  }

  render({ ctx }: { ctx: CanvasRenderingContext2D }) {
    // Draw display tiles
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let y = 0; y < this.displayTiles.length; y++) {
      for (let x = 0; x < this.displayTiles[y].length; x++) {
        const tile = this.displayTiles[y][x];
        const worldTile = this.worldTiles[y][x];
        if (tile) {
          const image = new Image();
          image.src = this.tiles[worldTile][tile];
          image.onload = () => {
            ctx.drawImage(
              image,
              x * this.size,
              y * this.size,
              this.size,
              this.size
            );
          };
        }
      }
    }
    ctx.restore();
  }
}
