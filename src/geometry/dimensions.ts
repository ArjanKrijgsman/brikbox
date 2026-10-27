/**
 * Basismaten van het BrikBox-systeem in mm (zie docs/ontwerpdocument.md).
 * Waarden die nog gekalibreerd moeten worden met de testprint staan als voorlopig gemarkeerd.
 */

/** Rastermaat; buitenmaat van een doos = n × GRID − 0,5. */
export const GRID = 42;

/** Nop op het deksel: holle ring die in de groef van de doos erboven grijpt. */
export const STUD = {
  outerDiameter: 50,
  ringWall: 3,
  height: 10,
  /** Hoe diep de ring in de groef van de doos erboven steekt. */
  engagement: 5,
} as const;

/** Materiaal boven de noppengroef in de bodem. */
export const FLOOR_ABOVE_GROOVE = 1.2;

export const DIVIDER = {
  thickness: 1.6,
  slotDepth: 1.5,
} as const;

/** Scharnier van de klapgreep; de pen is een stukje 1,75 mm filament. */
export const HINGE = {
  pinDiameter: 1.75,
  knuckleRadius: 3.5,
  knuckleGap: 0.4,
  /** Voorlopig: gat waarin de pen klemt (knokkels aan de bak). */
  snugHole: 1.95,
  /** Voorlopig: gat waarin de pen vrij draait (knokkel van de greep). */
  looseHole: 2.25,
} as const;

/** Puzzel-zwaluwstaart voor gesplitste bodems: smalle hals, brede kop. */
export const DOVETAIL = {
  neck: 6,
  head: 10,
  length: 6,
} as const;
