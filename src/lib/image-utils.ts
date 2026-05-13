import imageCompression from "browser-image-compression";
import type { Area } from "react-easy-crop";

/**
 * Compresses an image file on the client side.
 */
export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.8, // Slightly less than 1MB as requested
    maxWidthOrHeight: 1600, // Reduced from 1920 to be safer on mobile memory
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression error:", error);
    return file; // Return original if compression fails
  }
}

/**
 * Creates a canvas and returns the cropped image as a Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  // Calculate canvas size based on rotation if needed
  // For now, we assume simple cropping
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9,
    );
  });
}

/**
 * Utility to load an image from a URL.
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}
