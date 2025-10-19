import { Camera } from "./camera";
import CanvasDraw from "./canvas-draw";
import { loadImages } from "./utils/load-image";

interface TileGridProps {
  left: number;
  top: number;
  right: number;
  bottom: number;
  ctx: CanvasRenderingContext2D;
}

export interface Tile {
  center: HTMLImageElement;
  corner: HTMLImageElement;
  straight: HTMLImageElement;
  nook: HTMLImageElement;
  doubleNook: HTMLImageElement;
}

type TileKey =
  // 1 1
  // 1 1
  | "tl-tr-br-bl"
  // 1 1
  // 1 0
  | "tl-tr-br"
  // 1 1
  // 0 1
  | "tl-tr-bl"
  // 1 0
  // 1 1
  | "tl-br-bl"
  // 0 1
  // 1 1
  | "tr-br-bl"
  // 1 1
  // 0 0
  | "tl-tr"
  // 0 0
  // 1 1
  | "bl-br"
  // 1 0
  // 1 0
  | "tl-bl"
  // 0 1
  // 0 1
  | "tr-br"
  // 1 0
  // 0 1
  | "tl-br"
  // 0 1
  // 1 0
  | "tr-bl"
  // 1 0
  // 0 0
  | "tl"
  // 0 1
  // 0 0
  | "tr"
  // 0 0
  // 1 0
  | "bl"
  // 0 0
  // 0 1;
  | "br";

export interface ManageTilesProps {
  canvasDraw: CanvasDraw;
  size: number;
}

// IMPORTANT NOTES
// Due the tile is rendered from the middle i need to divide size by 2 to get the real position in some cases

export class ManageTiles {
  private canvasDraw: CanvasDraw;

  tiles: Record<string, Tile> = {};
  worldTiles: Record<string, Record<`${number}/${number}`, boolean>> = {};
  displayTiles: Record<
    string,
    Record<`${number}/${number}`, { tile: keyof Tile; rotation: number }>
  > = {};

  showGrid: boolean = true;
  size: number;
  gridColor: string = "rgba(255,255,255,0.05)";

  constructor(props: ManageTilesProps) {
    this.canvasDraw = props.canvasDraw;
    this.size = props.size;
  }

  async addMultipleTileTextures(
    data: Record<string, Record<keyof Tile, string>>
  ) {
    for (const [name, tile] of Object.entries(data)) {
      await this.addTileTexture(name, tile);
    }
  }

  async addTileTexture(name: string, data: Record<keyof Tile, string>) {
    const [center, corner, straight, nook, doubleNook] = await loadImages([
      data.center,
      data.corner,
      data.straight,
      data.nook,
      data.doubleNook
    ]);

    this.tiles[name] = {
      center,
      corner,
      straight,
      nook,
      doubleNook
    };
  }

  removeTileTexture(name: string) {
    delete this.tiles[name];
  }

  drawTileGrid({ left, top, right, bottom, ctx }: TileGridProps) {
    if (this.showGrid) {
      // display tile grid (offset by half a tile)
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
    }

    ctx.restore();
  }

  calculateDisplayTile(x: number, y: number, type: string) {
    // Get 4 neighbors (topLeft, topRight, botLeft, botRight)
    const wTopLeft = this.worldTiles[type]?.[`${y - 1}/${x - 1}`]
      ? true
      : false;
    const wTopRight = this.worldTiles[type]?.[`${y - 1}/${x}`] ? true : false;
    const wBotLeft = this.worldTiles[type]?.[`${y}/${x - 1}`] ? true : false;
    const wBotRight = this.worldTiles[type]?.[`${y}/${x}`] ? true : false;

    const checkWorldDirections = (
      tl: boolean,
      tr: boolean,
      bl: boolean,
      br: boolean
    ) => {
      return (
        wTopLeft === tl &&
        wTopRight === tr &&
        wBotLeft === bl &&
        wBotRight === br
      );
    };

    let displayTile: keyof Tile | null = null;
    let rotation = 0;
    switch (true) {
      case checkWorldDirections(true, true, true, true):
        // All neighbors are set
        displayTile = "center";
        rotation = 0;
        break;
      // ===========================================
      case checkWorldDirections(true, false, true, false):
        // Only left neighbors
        displayTile = "straight";
        rotation = 0;
        break;
      case checkWorldDirections(true, true, false, false):
        // Only top neighbors
        displayTile = "straight";
        rotation = 90;
        break;
      case checkWorldDirections(false, true, false, true):
        // Only right neighbors
        displayTile = "straight";
        rotation = 180;
        break;
      case checkWorldDirections(false, false, true, true):
        // Only bottom neighbors
        displayTile = "straight";
        rotation = 270;
        break;
      // ===========================================
      case checkWorldDirections(true, false, true, true):
        // Missing top right
        displayTile = "nook";
        rotation = 0;
        break;
      case checkWorldDirections(true, true, true, false):
        // Missing bottom right
        displayTile = "nook";
        rotation = 90;
        break;
      case checkWorldDirections(true, true, false, true):
        // Missing bottom left
        displayTile = "nook";
        rotation = 180;
        break;
      case checkWorldDirections(false, true, true, true):
        // Missing top left
        displayTile = "nook";
        rotation = 270;
        break;
      // ===========================================
      case checkWorldDirections(false, true, true, false):
        // Only top-right and bottom-left neighbors
        displayTile = "doubleNook";
        rotation = 0;
        break;
      case checkWorldDirections(true, false, false, true):
        // Only top-left and bottom-right neighbors
        displayTile = "doubleNook";
        rotation = 90;
        break;
      // ===========================================
      case checkWorldDirections(false, false, false, true):
        // Only bottom-right neighbor
        displayTile = "corner";
        rotation = 0;
        break;
      case checkWorldDirections(false, false, true, false):
        // Only bottom-left neighbor
        displayTile = "corner";
        rotation = 90;
        break;
      case checkWorldDirections(true, false, false, false):
        // Only top-left neighbor
        displayTile = "corner";
        rotation = 180;
        break;
      case checkWorldDirections(false, true, false, false):
        // Only top-right neighbor
        displayTile = "corner";
        rotation = 270;
        break;
    }

    if (displayTile) {
      this.displayTiles = {
        ...(this.displayTiles || {}),
        [type]: {
          ...(this.displayTiles[type] || {}),
          [`${y}/${x}`]: { tile: displayTile, rotation }
        }
      };
    }
  }

  updateDisplayTilesAround(x: number, y: number, type: string) {
    for (let dy = 0; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        this.calculateDisplayTile(x + dx, y + dy, type);
      }
    }
  }

  setWorldTile(x: number, y: number, type: string) {
    x = x - this.size / 2;
    y = y - this.size / 2;

    this.worldTiles = {
      ...(this.worldTiles || {}),
      [type]: {
        ...(this.worldTiles[type] || {}),
        [`${y / this.size}/${x / this.size}`]: true
      }
    };
    this.updateDisplayTilesAround(x / this.size, y / this.size, type);
  }

  removeWorldTile(x: number, y: number) {
    x = x - this.size / 2;
    y = y - this.size / 2;

    Object.keys(this.worldTiles).forEach((type) => {
      if (this.worldTiles[type]?.[`${y / this.size}/${x / this.size}`]) {
        delete this.worldTiles[type][`${y / this.size}/${x / this.size}`];

        if (this.displayTiles[type]?.[`${y / this.size}/${x / this.size}`]) {
          delete this.displayTiles[type][`${y / this.size}/${x / this.size}`];
        }
      }
    });
  }

  private getVisibleTilesRange(camera: Camera) {
    const zoom = camera.zoom;
    const visibleTilesRange = {
      x: {
        min: Math.floor(camera.x / this.size) - 1,
        max: Math.ceil((camera.x + camera.width / zoom) / this.size) + 1
      },
      y: {
        min: Math.floor(camera.y / this.size) - 1,
        max: Math.ceil((camera.y + camera.height / zoom) / this.size) + 1
      }
    };
    return visibleTilesRange;
  }

  private drawTilePart(
    x: number,
    y: number,
    tile: string,
    displayType: { tile: keyof Tile; rotation: number }
  ) {
    this.canvasDraw.drawImage({
      image: this.tiles[tile][displayType.tile],
      width: this.size + 0.5,
      height: this.size + 0.5,
      x,
      y,
      rotate: displayType.rotation
    });
  }

  render({ ctx, camera }: { ctx: CanvasRenderingContext2D; camera: Camera }) {
    // Draw display tiles
    ctx.save();
    // Apply camera translation and zoom
    const cameraPos = camera.getFinalPosition();
    ctx.translate(-cameraPos.x * camera.zoom, -cameraPos.y * camera.zoom);
    ctx.scale(camera.zoom, camera.zoom);
    const visibleTilesRange = this.getVisibleTilesRange(camera);

    for (const tileType in this.worldTiles) {
      for (let y = visibleTilesRange.y.min; y < visibleTilesRange.y.max; y++) {
        for (
          let x = visibleTilesRange.x.min;
          x < visibleTilesRange.x.max;
          x++
        ) {
          const displayTile_tl = this.displayTiles[tileType]?.[`${y}/${x}`];
          const displayTile_tr = this.displayTiles[tileType]?.[`${y}/${x + 1}`];
          const displayTile_bl = this.displayTiles[tileType]?.[`${y + 1}/${x}`];
          const displayTile_br =
            this.displayTiles[tileType]?.[`${y + 1}/${x + 1}`];

          if (tileType) {
            if (displayTile_tl) {
              this.drawTilePart(
                x * this.size - this.size / 2,
                y * this.size - this.size / 2,
                tileType,
                displayTile_tl
              );
            }
            if (displayTile_tr) {
              this.drawTilePart(
                x * this.size + this.size / 2,
                y * this.size - this.size / 2,
                tileType,
                displayTile_tr
              );
            }
            if (displayTile_bl) {
              this.drawTilePart(
                x * this.size - this.size / 2,
                y * this.size + this.size / 2,
                tileType,
                displayTile_bl
              );
            }
            if (displayTile_br) {
              this.drawTilePart(
                x * this.size + this.size / 2,
                y * this.size + this.size / 2,
                tileType,
                displayTile_br
              );
            }
          }
        }
      }
    }
    ctx.restore();
  }
}
