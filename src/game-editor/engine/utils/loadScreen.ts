class loadScreenClass {
  private _step: string | null = null;
  get step() {
    return this._step;
  }
  set step(step: string | null) {
    this._step = step;
    document.querySelector(".loader-step")!.textContent = step!;
  }

  show(initialStep: string) {
    this._step = initialStep;
    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";
    document.body.style.cursor = "none";

    const loader = document.createElement("div");
    loader.classList.add("loader");
    loader.style.width = "24px";
    loader.style.height = "24px";
    loader.style.border = "4px solid #f3f3f349";
    loader.style.borderTop = "4px solid #3498db";
    loader.style.borderRadius = "50%";

    const message = document.createElement("h3");
    message.classList.add("loader-message");
    message.style.color = "#fff";
    message.style.fontFamily = "Poppins, sans-serif";
    message.textContent = "LOADING";

    const loaderStep = document.createElement("span");
    loaderStep.classList.add("loader-step");
    loaderStep.style.color = "#fff";
    loaderStep.style.fontFamily = "Poppins, sans-serif";
    loaderStep.textContent = this._step || "";

    const loadScreen = document.createElement("div");
    loadScreen.classList.add("load-screen");
    loadScreen.style.display = "flex";
    loadScreen.style.flexDirection = "column";
    loadScreen.style.gap = "16px";
    loadScreen.style.justifyContent = "center";
    loadScreen.style.alignItems = "center";
    loadScreen.style.position = "fixed";
    loadScreen.style.top = "0";
    loadScreen.style.left = "0";
    loadScreen.style.width = "100vw";
    loadScreen.style.height = "100vh";
    loadScreen.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    loadScreen.style.backdropFilter = "blur(10px)";
    loadScreen.style.zIndex = "9999";

    loadScreen.appendChild(loader);
    loadScreen.appendChild(message);
    loadScreen.appendChild(loaderStep);

    document.body.appendChild(loadScreen);

    // loader animation
    const loaderAnimation = loader.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 1000,
        iterations: Infinity
      }
    );
    loaderAnimation.play();
  }

  hide() {
    this._step = null;
    document.body.style.pointerEvents = "auto";
    document.body.style.overflow = "auto";
    document.body.style.cursor = "auto";
    const loadScreen = document.querySelector(".load-screen")!;
    document.body.removeChild(loadScreen);
  }
}

export const loadScreen = new loadScreenClass();
