/**
 * Sistema de Câmera para Jogo Top-Down
 * Implementação em JavaScript Vanilla
 */

import { BaseObject } from "./objects/base-object";

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
  smoothing: number;
  deadZone: number;
  bounds: { minX: number; minY: number; maxX: number; maxY: number };

  shakeIntensity: number;
  shakeDuration: number;
  shakeTimer: number;
  shakeOffsetX: number;
  shakeOffsetY: number;

  constructor({ x, y, width, height }: CamepraProps) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Smoothing options
    this.smoothing = 0.1; // lerp Factor (0 = no smoothing, 1 = instantaneous movement)
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

  followWithDeadZone(target: { x: number; y: number }) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const deltaX = target.x - centerX;
    const deltaY = target.y - centerY;

    // Only move the camera if the target is outside the dead zone
    if (Math.abs(deltaX) > this.deadZone) {
      const targetX = target.x - this.width / 2;
      this.x = this.lerp(this.x, targetX, this.smoothing);
    }

    if (Math.abs(deltaY) > this.deadZone) {
      const targetY = target.y - this.height / 2;
      this.y = this.lerp(this.y, targetY, this.smoothing);
    }

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
    return !(
      object.x + object.width < this.x ||
      object.x > this.x + this.width ||
      object.y + object.height < this.y ||
      object.y > this.y + this.height
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
