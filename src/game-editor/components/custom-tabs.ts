import { LitElement, html, css } from "lit";
import { customElement, queryAssignedElements, state } from "lit/decorators.js";
import { globalStyles } from "../styles/globals";

@customElement("custom-tabs")
export class CustomTabs extends LitElement {
  static styles = [
    globalStyles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }

      .custom-tabs-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background-color: var(--color-complementary500);
      }

      .tabs {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        background-color: var(--color-complementary500);
        white-space: nowrap;
        scrollbar-width: thin;
      }

      .tab {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        margin: 0;
        cursor: pointer;
        border: 2px solid transparent;
        border-bottom: none;
        transition: all 0.3s ease;
        color: var(--color-complementary100, #fff);
        background: transparent;
        white-space: nowrap;
      }

      .tab:hover {
        border-color: var(--color-complementary300);
      }

      .tab.active {
        border-color: var(--color-complementary300);
        background-color: var(--color-complementary400);
      }

      ::slotted([slot="panel"]) {
        display: none;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: auto;
      }

      .panel-container {
        width: 100%;
        height: 100%;
        padding: 12px 0 0 12px;
        background-color: var(--color-complementary300);
      }

      ::slotted([slot="panel"][selected]) {
        display: flex;
      }

      ::slotted([slot="panel"]) * {
        padding: 12px;
        box-sizing: border-box;
      }
    `
  ];

  // Internal state: which tab index is selected
  @state()
  accessor _selectedIndex = 0;

  // Access the assigned slotted elements
  @queryAssignedElements({ slot: "tab" })
  accessor _tabElements!: HTMLElement[];

  @queryAssignedElements({ slot: "panel" })
  accessor _panelElements!: HTMLElement[];

  private _handleSlotChange() {
    // Re-render if panels change dynamically
    this.requestUpdate();
  }

  private _selectTab(index: number) {
    if (!this._panelElements?.length) return;

    this._panelElements.forEach((panel) => panel.removeAttribute("selected"));
    this._panelElements[index]?.setAttribute("selected", "");
    this._selectedIndex = index;
  }

  firstUpdated() {
    this._selectTab(0);
  }

  render() {
    const panels = this._panelElements ?? [];
    return html`
      <div class="custom-tabs-wrapper">
        <div class="tabs">
          ${panels.map(
            (panel, index) => html`
              <span
                class="tab ${index === this._selectedIndex ? "active" : ""}"
                @click=${() => this._selectTab(index)}
              >
                ${panel.getAttribute("name") ?? `Tab ${index + 1}`}
              </span>
            `
          )}
        </div>

        <div class="panel-container">
          <slot name="panel" @slotchange=${this._handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}
