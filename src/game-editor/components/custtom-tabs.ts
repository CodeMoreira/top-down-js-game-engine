import { html, css, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("custtom-tabs")
class CustomTabs extends LitElement {
  static styles = css`
    .wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: hidden;
      background-color: var(--color-complementary500);
    }

    .tabs {
      width: 100%;
      overflow-x: auto;
      display: flex;
    }

    .tab {
      padding: 8px 16px;
      cursor: pointer;
      border: 2px solid transparent;
      border-bottom: 2px solid var(--color-complementary300);
      border-bottom: 0;
      transition: all 0.3s;
    }

    .tab:hover {
      border-color: var(--color-complementary300);
    }

    .tab.active {
      border-color: var(--color-complementary300);
      background-color: var(--color-complementary400);
    }

    .content {
      flex: 1;
      overflow: auto;
      padding: 8px;
      background-color: var(--color-complementary400);
    }
  `;

  @property({ type: Array })
  accessor items: Array<{ title: string; content: TemplateResult<1> }> = [];

  @state()
  accessor activeTab: number = 0;

  render() {
    return html`
      <div class="wrapper">
        <div class="tabs">
          ${this.items.map(
            ({ title }, index) => html`
              <span
                class="tab ${this.activeTab === index ? "active" : ""}"
                @click=${() => (this.activeTab = index)}
              >
                ${title}
              </span>
            `
          )}
        </div>
        <div class="content">
          ${this.items[this.activeTab]?.content || "No content available yet."}
        </div>
      </div>
    `;
  }
}
