function fileToHTMLImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Crop the 5 tiles from the tileset.
 *
 * @param tileset The tileset to split
 * @returns an object with the 5 tiles as base64
 */
export async function splitTileset(tilesetFile: File): Promise<{
  center: string;
  corner: string;
  straight: string;
  nook: string;
  doubleNook: string;
}> {
  const tileset = await fileToHTMLImage(tilesetFile);

  return new Promise((resolve) => {
    const numSlices = 5;

    const imageWidth = tileset.naturalWidth;
    const imageHeight = tileset.naturalHeight;
    const sliceHeight = imageHeight / numSlices;

    let result: string[] = [];
    for (let i = 0; i < numSlices; i++) {
      // Create a new canvas for each slice
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions for the individual slice
      canvas.width = imageWidth;
      canvas.height = sliceHeight;

      if (!ctx) return;

      // Draw the specific slice onto the new canvas
      ctx.drawImage(
        tileset,
        0,
        i * sliceHeight,
        imageWidth,
        sliceHeight,
        0,
        0, // Destination x, y
        imageWidth,
        sliceHeight // Destination width, height
      );

      // get the image as base64
      const base64 = canvas.toDataURL("image/png");
      result.push(base64);
    }

    resolve({
      corner: result[0],
      doubleNook: result[1],
      straight: result[2],
      nook: result[3],
      center: result[4]
    });
  });
}
