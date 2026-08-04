import { images } from "virtual:ggoggam-images";

export type PhotoSources = {
  webp400: string;
  webp800: string;
  jpg400: string;
};

export function getImages(): PhotoSources[] {
  return images;
}
