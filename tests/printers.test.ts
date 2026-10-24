import { describe, expect, it } from 'vitest';
import { DEFAULT_PRINTER_ID, printers } from '../src/config/printers';

describe('printerprofielen', () => {
  it('hebben unieke id’s', () => {
    const ids = printers.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hebben een geldig bouwvolume', () => {
    for (const p of printers) {
      expect(p.buildVolume).toHaveLength(3);
      for (const size of p.buildVolume) expect(size).toBeGreaterThan(0);
    }
  });

  it('bevatten de standaardprinter', () => {
    expect(printers.some((p) => p.id === DEFAULT_PRINTER_ID)).toBe(true);
  });
});
