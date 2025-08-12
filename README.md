# Top Down JS Game Engine

Welcome to the Top Down JS Game Engine, a project fully developed in JavaScript!  
Our goal is to create a top-down game engine that enables easy game development for multiple platforms using a single codebase. Since browsers can run on almost any hardware—from full-featured desktops to simple webviews—JavaScript allows you to build games that are easily accessible and deployable across a wide range of devices.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Modern web browser (Chrome, Firefox, Edge, etc.)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd top-down-js-game-engine
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```
   This will start the Vite development server. Open your browser and navigate to the provided local address (usually `http://localhost:5173`).

4. **Build for production:**
   ```sh
   npm run build
   ```
   The production-ready files will be generated in the `dist` folder.

5. **Preview the production build:**
   ```sh
   npm run preview
   ```

## Project Structure

- [`src/`](src/) — Source code for the engine and game logic
- [`index.html`](index.html) — Main HTML entry point
- [`package.json`](package.json) — Project configuration and scripts

## Features

- Modular, extensible engine architecture
- Canvas-based rendering
- Keyboard controls for movement and sprinting
- Easily add new characters and objects

## License

This project is for educational