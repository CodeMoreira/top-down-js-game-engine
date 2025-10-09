import CanvasDraw from "../canvas-draw";

export interface GameObjectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  texture?: string;
  backgroundColor?: string;
  border?: { width: number; color: string };
  canvasDraw: CanvasDraw;
  name: string;
}

export class GameObject {
  readonly id: string = Math.random().toString(36).slice(2);
  public name: string;
  private attachments: GameObject[] = [];
  protected canvasDraw: CanvasDraw;

  _x: number = 0;
  get x() {
    return this._x;
  }
  set x(x: number) {
    this._x = x;
    this.attachments.forEach((attachment) => attachment.setPosition(x, this.y));
  }

  _y: number = 0;
  get y() {
    return this._y;
  }
  set y(y: number) {
    this._y = y;
    this.attachments.forEach((attachment) => attachment.setPosition(this.x, y));
  }

  width: number;
  height: number;
  private texture?: HTMLImageElement;
  backgroundColor?: string;
  border?: { width: number; color: string };

  constructor({
    x,
    y,
    width,
    height,
    texture,
    backgroundColor,
    border,
    canvasDraw,
    name
  }: GameObjectProps) {
    this.canvasDraw = canvasDraw;
    this.backgroundColor = backgroundColor;
    this.border = border;

    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.name = name;

    if (texture) {
      this.setTexture(texture);
    }
  }

  setTexture(texture: string) {
    const image = new Image();
    image.src = texture;
    image.onload = () => {
      this.texture = image;
    };
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  addAttachment(object: GameObject) {
    this.attachments.push(object);
    this.attachments.forEach((attachment) =>
      attachment.setPosition(this.x, this.y)
    );
  }

  render() {
    if (this.texture) {
      this.canvasDraw.drawImage({
        image: this.texture,
        x: this.x - this.width / 2,
        y: this.y - this.height / 2,
        width: this.width,
        height: this.height
      });
    }

    if (this.backgroundColor) {
      this.canvasDraw.drawBox(
        [this.x - this.width / 2, this.y - this.height / 2],
        [this.x + this.width / 2, this.y + this.height / 2],
        this.backgroundColor,
        true
      );
    }

    if (this.border) {
      this.canvasDraw.drawBox(
        [this.x - this.width / 2, this.y - this.height / 2],
        [this.x + this.width / 2, this.y + this.height / 2],
        this.border.color,
        false,
        this.border.width
      );
    }
  }
}
