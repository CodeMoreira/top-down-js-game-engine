import { css } from "lit";

export const globalStyles = css`
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

  :host * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: var(--color-complementary50);
    font-family: "Poppins", sans-serif;
  }

  /* --- Global Scrollbar Styles --- */
  /* For Firefox */
  :host * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-complementary300) transparent;
  }

  /* For Webkit browsers (Chrome, Safari, Edge) */
  :host *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  :host *::-webkit-scrollbar-track {
    background: transparent;
  }

  :host *::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 10px;
  }

  /* On hover, make the scrollbar thumb visible */
  :host *:hover::-webkit-scrollbar-thumb {
    background-color: var(--color-complementary300);
  }

  /* Make it slightly more prominent when actively scrolling */
  :host *::-webkit-scrollbar-thumb:active {
    background-color: var(--color-complementary200);
  }

  :host div {
    background-color: var(--color-complementary500);
  }

  /* text variants */
  :host h1 {
    font-size: 34px;
    font-weight: 600;
  }

  :host h2 {
    font-size: 30px;
    font-weight: 600;
  }

  :host h3 {
    font-size: 26px;
    font-weight: 600;
  }

  :host h4 {
    font-size: 22px;
    font-weight: 600;
  }

  :host label {
    font-size: 16px;
    font-weight: 600;
  }

  :host span {
    font-size: 16px;
    font-weight: 400;
    color: var(--color-complementary75);
  }

  :host p {
    font-size: 16px;
    font-weight: 400;
    color: var(--color-complementary75);
  }

  :host a {
    font-size: 16px;
    font-weight: 600;
    text-decoration: underline;
    color: var(--color-complementary75);
  }
  /* text variants */

  .button-primary {
    cursor: pointer;
    background-color: var(--color-primary500);
    color: var(--color-complementary50);
    border: 1px solid var(--color-primary500);
    padding: 10px 20px;
    border-radius: 5px;
  }

  .button-element {
    all: unset;
    width: 100%;

    font-size: 16px;

    display: flex;
    align-items: center;

    /* keep every element in the same line (prevent wrap) */
    white-space: nowrap;
    overflow: hidden;

    cursor: pointer;
    background-color: var(--color-complementary500);
    color: var(--color-complementary50);
    padding: 8px 0px;
    border-radius: 5px;
  }

  .button-element:hover {
    background-color: var(--color-complementary300);
  }

  .button-element.active {
    background-color: var(--color-complementary300);
  }
`;
