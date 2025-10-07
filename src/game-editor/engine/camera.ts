/**
 * Sistema de Câmera para Jogo Top-Down
 * Implementação em JavaScript Vanilla
 */

import { GameObject } from "./objects/game-object";

interface CamepraProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Camera {
  x: number;
  y: number;

  width: number;
  height: number;

  target: { x: number; y: number } | null = null;
  smoothing: number;

  deadZone: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };

  zoom: number = 1;
  targetZoom: number = 1;
  zoomSmoothing: number = 0.1;

  shakeIntensity: number = 0;
  shakeDuration: number = 0;
  shakeTimer: number = 0;
  shakeOffsetX: number = 0;
  shakeOffsetY: number = 0;

  constructor({ x, y, width, height }: CamepraProps) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Smoothing options
    this.smoothing = 0.02; // lerp Factor (0 = no smoothing, 1 = instantaneous movement)
    this.deadZone = 50; // Dead zone from the center of the viewport (in pixels)

    // Camera limits (optional)
    this.bounds = {
      minX: -Infinity,
      minY: -Infinity,
      maxX: Infinity,
      maxY: Infinity
    };
  }

  setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  follow({
    target,
    smooth = this.smoothing
  }: {
    target: { x: number; y: number };
    smooth?: number;
  }) {
    this.target = target;

    // Calc the desired position (center the target on the screen)
    const targetX = this.target.x - this.width / 2;
    const targetY = this.target.y - this.height / 2;

    if (smooth) {
      this.smoothing = Math.min(smooth, 1);
    }

    this.x = this.lerp(this.x, targetX, this.smoothing);
    this.y = this.lerp(this.y, targetY, this.smoothing);

    // Apply camera bounds
    this.applyBounds();
  }

  setZoom({ smooth, zoom }: { smooth?: number; zoom?: number }) {
    smooth && (this.zoomSmoothing = Math.min(smooth, 1));
    zoom && (this.targetZoom = Math.max(0.1, zoom));
  }

  updateZoom() {
    // Smoothly interpolate zoom towards targetZoom
    this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothing;
  }

  worldToScreen(worldX: number, worldY: number) {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom
    };
  }

  screenToWorld(screenX: number, screenY: number) {
    return {
      x: screenX / this.zoom + this.x,
      y: screenY / this.zoom + this.y
    };
  }

  isVisible(object: GameObject) {
    const left = object.x - object.width / 2;
    const right = object.x + object.width / 2;
    const top = object.y - object.height / 2;
    const bottom = object.y + object.height / 2;

    // Camera viewport with zoom applied
    const camLeft = this.x;
    const camRight = this.x + this.width / this.zoom;
    const camTop = this.y;
    const camBottom = this.y + this.height / this.zoom;

    return !(
      (
        right <= camLeft || // completely left of camera
        left >= camRight || // completely right of camera
        bottom <= camTop || // completely above camera
        top >= camBottom
      ) // completely below camera
    );
  }

  getBounds() {
    return this.bounds;
  }

  setBounds(minX: number, minY: number, maxX: number, maxY: number) {
    this.bounds = { minX, minY, maxX, maxY };
  }

  applyBounds() {
    this.x = Math.max(
      this.bounds.minX,
      Math.min(this.x, this.bounds.maxX - this.width)
    );
    this.y = Math.max(
      this.bounds.minY,
      Math.min(this.y, this.bounds.maxY - this.height)
    );
  }

  lerp(start: number, end: number, factor: number) {
    return start + (end - start) * factor;
  }

  moveTo(x: number, y: number, smooth: boolean = false) {
    if (smooth) {
      this.x = this.lerp(this.x, x, this.smoothing);
      this.y = this.lerp(this.y, y, this.smoothing);
    } else {
      this.x = x;
      this.y = y;
    }
    this.applyBounds();
  }

  shake(intensity: number = 10, duration: number = 30) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = 0;
  }

  /**
   * Update the sake of camera (call in the main loop)
   */
  updateShake() {
    if (this.shakeDuration && this.shakeTimer < this.shakeDuration) {
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * (1 - progress);

      this.shakeOffsetX = (Math.random() - 0.5) * currentIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * currentIntensity;

      this.shakeTimer++;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  update() {
    if (this.target) {
      this.follow({
        target: this.target
      });
    }

    this.updateZoom();
    this.updateShake();
  }

  getFinalPosition() {
    return {
      x: this.x + (this.shakeOffsetX || 0),
      y: this.y + (this.shakeOffsetY || 0)
    };
  }
}
