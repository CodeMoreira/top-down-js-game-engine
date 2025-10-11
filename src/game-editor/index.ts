import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import Engine from "./engine";

import "./components/custom-tabs";
import { createRef, ref } from "lit/directives/ref.js";
import { SetupInputs } from "./setup-inputs";
import { GameObject } from "./engine/objects/game-object";
import { loadImage } from "./engine/utils/load-image";
import { globalStyles } from "./styles/globals";

const objectOptions = {
  staticObjects: {},
  dynamicObjects: {},
  characters: {
    peter: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(22,103,212, 1)"
    },
    marty: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(41,190,80, 1)"
    },
    steve: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(212,118,22, 1)"
    },
    bruce: {
      width: 30,
      height: 50,
      speed: 200,
      texture: "rgba(200,50,150, 1)"
    }
  }
};

const tiles = {
  test: {
    center: await loadImage("/images/center.png"),
    corner: await loadImage("/images/corner.png"),
    straight: await loadImage("/images/straight.png"),
    nook: await loadImage("/images/nook.png"),
    doubleNook: await loadImage("/images/double-nook.png")
  }
};

@customElement("game-editor")
class GameEditor extends LitElement {
  static styles = [
    globalStyles,
    css`
      /* layout */
      .wrapper {
        display: flex;
        width: 100%;
        height: 100%;
        background-color: var(--color-complementary500);
      }

      .inspector {
        width: 250px;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }

      .viewport {
        flex: 1;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .general-tools {
        width: 400px;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }
    `
  ];

  private engine = new Engine({
    cameraStartPosition: { x: 0, y: 0 }
  });

  viewportRef = createRef<HTMLDivElement>();

  @state()
  accessor devMode: boolean = true;
  accessor inputs: SetupInputs | undefined;
  accessor cameraDragActive: boolean = false;
  accessor lastDragPos: { x: number; y: number } | null = null;
  accessor initialCameraPos: { x: number; y: number } | null = null;

  accessor tileHighlighted: {
    index: number;
    object: GameObject;
  } | null = null;
  accessor selectedTile: string | null = null;

  accessor selectedObject: GameObject | null = null;

  handleSelectObject(object: GameObject) {
    this.selectedObject = object;
  }

  firstUpdated() {
    if (this.viewportRef.value) {
      this.inputs = new SetupInputs({
        debugMode: false,
        parent: this.viewportRef.value,
        onChange: () => {
          this.requestUpdate(); // Triggers Lit to re-render
        }
      });
      this.engine.appendTo(this.viewportRef.value);
    }

    this.engine.setTiles(tiles);

    if (this.engine.tiles) {
      this.tileHighlighted = this.engine.addGameObject({
        name: "tileHighlighted",
        x: 0,
        y: 0,
        width: this.engine.tiles.size,
        height: this.engine.tiles.size,
        backgroundColor: "#ffffff09",
        border: { width: 1, color: "#ffffff49" }
      });
    }

    this.engine.start();
  }

  updated() {
    const moveCameraOnScrollDrag = () => {
      if (this.inputs) {
        // Start drag
        if (this.inputs.mouse.scroll && !this.cameraDragActive) {
          this.cameraDragActive = true;
          this.lastDragPos = {
            x: this.inputs.mouse.x,
            y: this.inputs.mouse.y
          };
          // Store initial camera position
          this.initialCameraPos = {
            x: this.engine.camera.x,
            y: this.engine.camera.y
          };
        }

        // Dragging
        if (this.cameraDragActive && this.inputs.mouse.scroll) {
          document.body.style.cursor = "grabbing";
          if (this.lastDragPos && this.initialCameraPos) {
            const dx =
              (this.inputs.mouse.x - this.lastDragPos.x) /
              this.engine.camera.zoom;
            const dy =
              (this.inputs.mouse.y - this.lastDragPos.y) /
              this.engine.camera.zoom;
            // Move camera to new position
            this.engine.camera.moveTo(
              this.initialCameraPos.x - dx,
              this.initialCameraPos.y - dy
            );
          }
        }

        // End drag
        if (this.cameraDragActive && !this.inputs.mouse.scroll) {
          document.body.style.cursor = "default";
          this.cameraDragActive = false;
          this.lastDragPos = null;
          this.initialCameraPos = null;
        }
      }
    };
    const zoomCameraOnMouseWheel = () => {
      if (this.inputs) {
        if (this.inputs.mouse.wheel) {
          if (this.inputs.mouse.wheel == "down") {
            this.engine.camera.setZoom({
              zoom: this.engine.camera.zoom - 0.1
            });
          }

          if (this.inputs.mouse.wheel == "up") {
            this.engine.camera.setZoom({
              zoom: this.engine.camera.zoom + 0.1
            });
          }
        }
      }
    };

    const moveTileHighlighted = () => {
      if (this.inputs && this.tileHighlighted && this.engine.tiles) {
        const convertedPos = this.engine.camera.screenToWorld(
          this.inputs.mouse.x,
          this.inputs.mouse.y
        );

        const grid = this.engine.gridSize;
        // Snap to closest grid intersection
        const snappedX =
          Math.round((convertedPos.x - grid / 2) / grid) * grid + grid / 2;
        const snappedY =
          Math.round((convertedPos.y - grid / 2) / grid) * grid + grid / 2;
        this.tileHighlighted.object.x = snappedX;
        this.tileHighlighted.object.y = snappedY;
      }
    };

    const addTitleOnClick = () => {
      if (this.inputs) {
        if (this.inputs.mouse.left) {
          if (this.selectedTile && this.tileHighlighted && this.engine.tiles) {
            this.engine.tiles.setWorldTile(
              this.tileHighlighted.object.x || 0,
              this.tileHighlighted.object.y || 0,
              this.selectedTile
            );
          }
        }
      }
    };

    if (this.devMode) {
      this.engine.tiles && (this.engine.tiles.showGrid = true);
      this.engine.showWorldGrid = true;
      moveCameraOnScrollDrag();
      zoomCameraOnMouseWheel();
      moveTileHighlighted();
      addTitleOnClick();
    } else {
      this.engine.tiles && (this.engine.tiles.showGrid = false);
      this.engine.showWorldGrid = false;
    }
  }

  render() {
    return html`
      <div class="wrapper">
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />
        ${this.devMode
          ? html`
              <aside class="inspector">
                <custom-tabs>
                  <div slot="panel" name="Scene">
                    ${this.engine.objects.map(
                      (object) =>
                        html`
                          <button
                            class="button-element ${object ===
                            this.selectedObject
                              ? "active"
                              : ""}"
                            style="padding-left: ${1 * 24}px;"
                            @click=${() => this.handleSelectObject(object)}
                          >
                            ${object.name}
                          </button>
                        `
                    )}
                  </div>
                </custom-tabs>
              </aside>
            `
          : ""}

        <div class="viewport" ${ref(this.viewportRef)}></div>

        ${this.devMode
          ? html`
              <aside class="inspector">
                <custom-tabs>
                  <div slot="panel" name="General Tools">
                    ${Object.keys(tiles).map(
                      (tile) =>
                        html`
                          <button
                            class="button-primary"
                            @click=${() => (this.selectedTile = tile)}
                          >
                            ${tile}
                          </button>
                        `
                    )}
                  </div>
                </custom-tabs>
              </aside>
            `
          : ""}
      </div>
    `;
  }
}
