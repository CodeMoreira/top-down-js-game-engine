export default class CanvasDraw {
  protected parent: Element | null = null;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected screenWidth: number = 0;
  protected screenHeight: number = 0;

  constructor() {
    const canvasElement = document.createElement("canvas");
    this.canvas = canvasElement;
    canvasElement.width = this.screenWidth;
    canvasElement.height = this.screenHeight;

    // Get context
    const ctx = canvasElement.getContext("2d")!;

    this.ctx = ctx;
  }

  appendTo(parent: Element) {
    this.parent = parent;
    parent.appendChild(this.canvas);
  }

  protected setScreenSize(width: number, height: number) {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  }

  protected clearScene() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawLine(
    start: [number, number],
    end: [number, number],
    color: string,
    width?: number
  ) {
    if (!color) {
      throw new Error("No color specified");
    }
    this.ctx.lineWidth = width || 1;
    this.ctx.beginPath();
    this.ctx.moveTo(start[0], start[1]);
    this.ctx.lineTo(end[0], end[1]);
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  drawBox(
    start: [number, number],
    end: [number, number],
    color: string,
    fill?: boolean,
    width?: number
  ) {
    if (!color) {
      throw new Error("No color specified");
    }

    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        start[0],
        start[1],
        end[0] - start[0],
        end[1] - start[1]
      );
      return;
    }

    this.drawLine(start, [end[0], start[1]], color, width);
    this.drawLine([end[0], start[1]], end, color, width);
    this.drawLine(end, [start[0], end[1]], color, width);
    this.drawLine([start[0], end[1]], start, color, width);
  }

  drawCircle(x: number, y: number, radius: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  drawText(text: string, x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "center";

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.strokeText(text, x, y);

    this.ctx.fillText(text, x, y);
  }

  drawImage({
    image,
    width,
    height,
    x,
    y,
    rotate
  }: {
    image: HTMLImageElement;
    width: number;
    height: number;
    x: number;
    y: number;
    rotate?: number;
  }) {
    if (rotate) {
      this.ctx.save();
      // Translate to the center of the tile in world coordinates
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate((rotate * Math.PI) / 180);
      // Draw the image centered
      this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(image, x, y, width, height);
    }
  }
}
