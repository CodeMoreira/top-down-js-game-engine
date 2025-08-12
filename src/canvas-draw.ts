interface CanvasDrawProps {
  ctx: CanvasRenderingContext2D;
}

export default class CanvasDraw {
  ctx: CanvasRenderingContext2D;

  constructor({ ctx }: CanvasDrawProps) {
    this.ctx = ctx;
  }

  clearScene() {
    this.ctx.fillStyle = "gray";
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
    fill?: boolean
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

    this.drawLine(start, [end[0], start[1]], color);
    this.drawLine([end[0], start[1]], end, color);
    this.drawLine(end, [start[0], end[1]], color);
    this.drawLine([start[0], end[1]], start, color);
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
}
