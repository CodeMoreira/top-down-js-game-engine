export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(`Image failed to load: ${url}`);
    image.src = url;
  });
}

export function loadImages(urls: string[]) {
  return Promise.all(urls.map((url) => loadImage(url)));
}
