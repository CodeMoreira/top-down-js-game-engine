import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import Engine from "./engine";

import "./components/custom-tabs";
import { createRef, ref } from "lit/directives/ref.js";
import { SetupInputs } from "./setup-inputs";
import { GameObject } from "./engine/objects/game-object";
import { loadImage } from "./engine/utils/load-image";

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
  static styles = css`
    :host {
      /* color palette */
      --color-primary50: #eaeffd;
      --color-primary75: #a9bff6;
      --color-primary100: #86a5f2;
      --color-primary200: #527eec;
      --color-primary300: #2e63e8;
      --color-primary400: #2045a2;
      --color-primary500: #1c3c8e;

      --color-secoundary50: #f8eafd;
      --color-secoundary75: #e1aaf6;
      --color-secoundary100: #d587f2;
      --color-secoundary200: #c353ec;
      --color-secoundary300: #b730e8;
      --color-secoundary400: #8022a2;
      --color-secoundary500: #701d8e;

      --color-complementary50: #e9e9ea;
      --color-complementary75: #a4a6a9;
      --color-complementary100: #7e8185;
      --color-complementary200: #474b51;
      --color-complementary300: #21262d;
      --color-complementary400: #171b1f;
      --color-complementary500: #14171b;
      /* color palette */
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .button-primary {
      cursor: pointer;
      background-color: var(--color-primary500);
      color: var(--color-complementary50);
      border: 1px solid var(--color-primary500);
      padding: 10px 20px;
      border-radius: 5px;
    }

    /* layout */
    .wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      background-color: var(--color-complementary500);
    }

    .wrapper * {
      color: var(--color-complementary50);
      font-family: "Poppins", sans-serif;
    }

    .wrapper div {
      background-color: var(--color-complementary500);
    }

    /* text variants */
    .wrapper h1 {
      font-size: 34px;
      font-weight: 600;
    }

    .wrapper h2 {
      font-size: 30px;
      font-weight: 600;
    }

    .wrapper h3 {
      font-size: 26px;
      font-weight: 600;
    }

    .wrapper h4 {
      font-size: 22px;
      font-weight: 600;
    }

    .wrapper label {
      font-size: 16px;
      font-weight: 600;
    }

    .wrapper span {
      font-size: 16px;
      font-weight: 400;
      color: var(--color-complementary75);
    }

    .wrapper p {
      font-size: 16px;
      font-weight: 400;
      color: var(--color-complementary75);
    }

    .wrapper a {
      font-size: 16px;
      font-weight: 600;
      text-decoration: underline;
      color: var(--color-complementary75);
    }
    /* text variants */

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
  `;

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
  accessor tileToAdd: string | null = null;

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
          console.log("Adding tile", {
            tileToAdd: this.tileToAdd,
            tileHighlighted: this.tileHighlighted,
            tiles: this.engine.tiles
          });

          if (this.tileToAdd && this.tileHighlighted && this.engine.tiles) {
            this.engine.tiles.setWorldTile(
              this.tileHighlighted.object.x || 0,
              this.tileHighlighted.object.y || 0,
              this.tileToAdd
            );

            console.log(this.engine.tiles.worldTiles);
          }
        }
      }
    };

    if (this.devMode) {
      moveCameraOnScrollDrag();
      zoomCameraOnMouseWheel();
      moveTileHighlighted();
      addTitleOnClick();
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
                          <button class="button-primary">${object.name}</button>
                        `
                    )}
                  </div>

                  <div slot="panel" name="tab two">
                    ${this.engine.objects.map(
                      (object) =>
                        html`
                          <button class="button-primary">${object.name}</button>
                        `
                    )}
                  </div>

                  <div slot="panel" name="tab three">
                    ${this.engine.objects.map(
                      (object) =>
                        html`
                          <button class="button-primary">${object.name}</button>
                        `
                    )}
                  </div>

                  <div slot="panel" name="tab four">
                    ${this.engine.objects.map(
                      (object) =>
                        html`
                          <button class="button-primary">${object.name}</button>
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
                  <section slot="panel" name="General Tools">
                    ${Object.keys(tiles).map(
                      (tile) =>
                        html`
                          <button
                            class="button-primary"
                            @click=${() => (this.tileToAdd = tile)}
                          >
                            ${tile}
                          </button>
                        `
                    )}
                  </section>
                </custom-tabs>
              </aside>
            `
          : ""}
      </div>
    `;
  }
}
