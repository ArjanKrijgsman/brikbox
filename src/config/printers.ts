import data from './printers.json';

export interface PrinterProfile {
  id: string;
  name: string;
  /** Bouwvolume in mm: [breedte, diepte, hoogte]. */
  buildVolume: [number, number, number];
  /** Kan meerkleurig printen (AMS, MMU, toolchanger), eventueel met optionele hardware. */
  multicolor: boolean;
  /** Bouwvolume gecontroleerd bij de fabrikant. */
  verified: boolean;
}

export const printers = data as PrinterProfile[];

export const DEFAULT_PRINTER_ID = 'bambu-x1c';

/** Standaard veiligheidsmarge rondom het printbed, in mm. */
export const DEFAULT_BED_MARGIN = 5;
