import type { Manifold } from 'manifold-3d';

export interface Placement<T> {
  item: T;
  x: number;
  y: number;
}

/** Verschuift een onderdeel zodat de hoek van zijn omhullende doos in de oorsprong ligt. */
export function toOrigin(manifold: Manifold): Manifold {
  const { min } = manifold.boundingBox();
  return manifold.translate([-min[0], -min[1], -min[2]]);
}

/** Breedte (X) en diepte (Y) van een onderdeel. */
export function footprint(manifold: Manifold): [number, number] {
  const { min, max } = manifold.boundingBox();
  return [max[0] - min[0], max[1] - min[1]];
}

/**
 * Verdeelt onderdelen over printplaten in rijen ("planken"), diepste onderdelen eerst.
 * Geeft per plaat de positie van de linkervoorhoek van elk onderdeel terug.
 */
export function packShelves<T>(
  items: T[],
  size: (item: T) => [number, number],
  bed: [number, number],
  margin: number,
  gap = 4,
): Placement<T>[][] {
  const [bedWidth, bedDepth] = bed;
  const sorted = [...items].sort((a, b) => size(b)[1] - size(a)[1]);
  const plates: Placement<T>[][] = [];
  let plate: Placement<T>[] = [];
  let x = margin;
  let y = margin;
  let shelfDepth = 0;

  for (const item of sorted) {
    const [width, depth] = size(item);
    if (width > bedWidth - 2 * margin || depth > bedDepth - 2 * margin) {
      throw new Error(`Onderdeel van ${width.toFixed(1)} × ${depth.toFixed(1)} mm past niet op het printbed`);
    }
    if (x + width > bedWidth - margin) {
      x = margin;
      y += shelfDepth + gap;
      shelfDepth = 0;
    }
    if (y + depth > bedDepth - margin) {
      plates.push(plate);
      plate = [];
      x = margin;
      y = margin;
      shelfDepth = 0;
    }
    plate.push({ item, x, y });
    x += width + gap;
    shelfDepth = Math.max(shelfDepth, depth);
  }
  if (plate.length > 0) plates.push(plate);
  return plates;
}
