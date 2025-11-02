import { html, css, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import Engine from "./engine";

import "./components/custom-tabs";
import { createRef, ref } from "lit/directives/ref.js";
import { SetupInputs } from "./setup-inputs";
import { GameObject } from "./engine/objects/game-object";
import { loadImage, loadImages } from "./engine/utils/load-image";
import { globalStyles } from "./styles/globals";
import { splitTileset } from "./engine/utils/split-tileset";
import { splitObjectGroups } from "./engine/utils/split-object-groupds";
import { Tile } from "./engine/manage-tiles";
import { loadScreen } from "./engine/utils/loadScreen";

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

      .general-options {
        width: 400px;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }

      .tab-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 100%;
        min-height: 100%;
        padding: 12px;
      }

      .tab-container section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        border: 2px solid var(--color-complementary300);
        padding: 12px;
        border-radius: 5px;
      }

      .tab-container section > div {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px 0;
        width: 100%;
        border-top: 2px solid var(--color-complementary300);
      }

      .upload-tileset {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .tile-preview {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
      }
    `
  ];

  private engine = new Engine({
    cameraStartPosition: { x: 0, y: 0 }
  });

  viewportRef = createRef<HTMLDivElement>();
  uploadTilesetFormRef = createRef<HTMLFormElement>();

  @state()
  accessor devMode: boolean = true;
  accessor inputs: SetupInputs | undefined;

  // Camera Drag
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

  async firstUpdated() {
    loadScreen.show("Initializing load");

    if (this.viewportRef.value) {
      loadScreen.step = "Setting up inputs";
      this.inputs = new SetupInputs({
        debugMode: false,
        parent: this.viewportRef.value,
        onChange: () => {
          this.requestUpdate(); // Triggers Lit to re-render
        }
      });
      this.engine.appendTo(this.viewportRef.value);
    }

    loadScreen.step = "Adding tileHighlighted object";
    this.tileHighlighted = this.engine.addGameObject({
      name: "tileHighlighted",
      x: 0,
      y: 0,
      width: this.engine.manageTiles.size,
      height: this.engine.manageTiles.size,
      backgroundColor: "#ffffff09",
      border: { width: 1, color: "#ffffff49" }
    });

    loadScreen.step = "Getting tiles from local storage";
    const tiles = localStorage.getItem("tiles");
    if (tiles) {
      await this.engine.manageTiles.addMultipleTileTextures(JSON.parse(tiles));
      this.requestUpdate();
    }

    loadScreen.step = "Starting engine";
    this.engine.start();
    loadScreen.hide();
  }

  updated() {
    const moveCamera = () => {
      if (this.inputs) {
        // Start drag
        const isDraggingWithScroll = this.inputs.mouse.scroll;
        const isDraggingWithSpace =
          this.inputs.keyPresses.includes("Space") && this.inputs.mouse.left;

        const isDragging = isDraggingWithScroll || isDraggingWithSpace;

        if (isDragging && !this.cameraDragActive) {
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
        if (this.cameraDragActive && isDragging) {
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
        if (this.cameraDragActive && !isDragging) {
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
      if (this.inputs && this.tileHighlighted) {
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
          if (this.selectedTile && this.tileHighlighted) {
            this.engine.manageTiles.setWorldTile(
              this.tileHighlighted.object.x || 0,
              this.tileHighlighted.object.y || 0,
              this.selectedTile
            );
          }
        }
      }
    };

    if (this.devMode) {
      this.engine.manageTiles.showGrid = true;
      this.engine.showWorldGrid = true;
      moveCamera();
      zoomCameraOnMouseWheel();
      moveTileHighlighted();
      addTitleOnClick();
    } else {
      this.engine.manageTiles.showGrid = false;
      this.engine.showWorldGrid = false;
    }
  }

  async uploadTileset(e: SubmitEvent) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const file = formData.get("tileset") as File;

    const isFileInputFilled = file && file.size > 0;

    if (!name || !isFileInputFilled) {
      window.alert("Missing name or file.");
      return;
    }

    // use splitTileset
    const currentTiles = await splitTileset(file);
    this.engine.manageTiles.addTileTexture(name, {
      center: currentTiles.center,
      corner: currentTiles.corner,
      straight: currentTiles.straight,
      nook: currentTiles.nook,
      doubleNook: currentTiles.doubleNook
    });

    // Reset form
    this.uploadTilesetFormRef.value?.reset();

    // store in local storage
    const currentTilesInStorage = localStorage.getItem("tiles");
    const newTiles = currentTilesInStorage
      ? JSON.parse(currentTilesInStorage)
      : {};
    newTiles[name] = currentTiles;
    localStorage.setItem("tiles", JSON.stringify(newTiles));

    this.requestUpdate();
  }

  render() {
    const tilesGroupedByName = Object.keys(this.engine.manageTiles.tiles).length
      ? splitObjectGroups<Tile>(this.engine.manageTiles.tiles)
      : [];

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
                    <div class="tab-container">
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
                  </div>
                </custom-tabs>
              </aside>
            `
          : ""}

        <div class="viewport" ${ref(this.viewportRef)}></div>

        ${this.devMode
          ? html`
              <aside class="general-options">
                <custom-tabs>
                  <div slot="panel" name="General Options">
                    <div class="tab-container">
                      <section>
                        <form
                          class="upload-tileset"
                          ${ref(this.uploadTilesetFormRef)}
                          @submit=${this.uploadTileset}
                        >
                          <div
                            style="display: flex; justify-content: space-between; align-items: center;"
                          >
                            <h4>Upload tileset</h4>
                            <a href="/images/tileset-template.png" download>
                              <span>Download template</span>
                            </a>
                          </div>

                          <label>
                            Tile name
                            <input name="name" type="text" />
                          </label>

                          <label>
                            Tileset
                            <input name="tileset" type="file" />
                          </label>

                          <button class="button-primary" type="submit">
                            Upload
                          </button>
                        </form>

                        <div>
                          <h4>Tiles</h4>
                          ${tilesGroupedByName.length === 0
                            ? html`<p>No tiles yet, upload some!</p>`
                            : tilesGroupedByName.map(({ name, data }) => {
                                const renderButton = (
                                  tile: Tile,
                                  fullName: string
                                ) => {
                                  const clonedTile = { ...tile };

                                  clonedTile.center.height = 48;
                                  clonedTile.corner.height = 48;
                                  clonedTile.straight.height = 48;
                                  clonedTile.nook.height = 48;
                                  clonedTile.doubleNook.height = 48;

                                  return html`
                                    <button
                                      class="button-primary ${fullName ===
                                      this.selectedTile
                                        ? "highlighted"
                                        : ""}"
                                      @click=${() =>
                                        (this.selectedTile = fullName)}
                                    >
                                      ${clonedTile.center} ${clonedTile.corner}
                                      ${clonedTile.straight} ${clonedTile.nook}
                                      ${clonedTile.doubleNook}
                                    </button>
                                  `;
                                };

                                return html`
                                  <div class="tile-preview">
                                    <h4>${name}</h4>
                                    ${!Array.isArray(data)
                                      ? renderButton(data, name)
                                      : html`
                                          <div class="tile-preview">
                                            ${data.map(
                                              ({
                                                name: childName,
                                                data: tile
                                              }) => html`
                                                <span>${childName}</span>
                                                ${renderButton(
                                                  tile,
                                                  childName === "default"
                                                    ? name
                                                    : `${name}/${childName}`
                                                )}
                                              `
                                            )}
                                          </div>
                                        `}
                                  </div>
                                `;
                              })}
                        </div>
                      </section>
                    </div>
                  </div>
                </custom-tabs>
              </aside>
            `
          : ""}
      </div>
    `;
  }
}
