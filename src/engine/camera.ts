/**
 * Sistema de Câmera para Jogo Top-Down
 * Implementação em JavaScript Vanilla
 */

import { BaseObject } from "./objects/base-object";

interface CamepraProps {
  tilesConfig: { width: number; height: number };
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Camera {
  tilesConfig: { width: number; height: number };
  x: number;
  y: number;

  width: number;
  height: number;
  smoothing: number;
  deadZone: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };

  shakeIntensity: number;
  shakeDuration: number;
  shakeTimer: number;
  shakeOffsetX: number;
  shakeOffsetY: number;

  constructor({ tilesConfig, x, y, width, height }: CamepraProps) {
    this.tilesConfig = tilesConfig;
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

  follow(target: { x: number; y: number }, smooth: boolean = true) {
    // Calc the desired position (center the target on the screen)
    const targetX = target.x - this.width / 2;
    const targetY = target.y - this.height / 2;

    if (smooth) {
      // Smoothly move the camera to the target position using linear interpolation (lerp)
      this.x = this.lerp(this.x, targetX, this.smoothing);
      this.y = this.lerp(this.y, targetY, this.smoothing);
    } else {
      // Instantaneously move the camera to the target position
      this.x = targetX;
      this.y = targetY;
    }

    // Apply camera bounds
    this.applyBounds();
  }

  worldToScreen(worldX: number, worldY: number) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  screenToWorld(screenX: number, screenY: number) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  isVisible(object: BaseObject) {
    const left = object.x - object.width / 2;
    const right = object.x + object.width / 2;
    const top = object.y - object.height / 2;
    const bottom = object.y + object.height / 2;

    return !(
      (
        right <= this.x || // completely left of camera
        left >= this.x + this.width || // completely right of camera
        bottom <= this.y || // completely above camera
        top >= this.y + this.height
      ) // completely below camera
    );
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
   * Atualiza o shake da câmera (chamar no loop principal)
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

  getFinalPosition() {
    return {
      x: this.x + (this.shakeOffsetX || 0),
      y: this.y + (this.shakeOffsetY || 0)
    };
  }
}
