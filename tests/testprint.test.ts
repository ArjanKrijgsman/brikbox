import { unzipSync, strFromU8 } from 'fflate';
import { beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_BED_MARGIN, printers } from '../src/config/printers';
import { DIVIDER, STUD } from '../src/geometry/dimensions';
import { loadKernel, type Kernel } from '../src/geometry/kernel';
import { footprint, packShelves, toOrigin } from '../src/geometry/layout';
import { buildTestPrint, CLEARANCES, SNAP_HOOKS, type TestPart } from '../src/geometry/testprint';
import { toBinaryStl } from '../src/export/stl';
import { toThreeMf } from '../src/export/threemf';

let k: Kernel;
let parts: TestPart[];
const part = (id: string) => parts.find((p) => p.id === id)!;

beforeAll(async () => {
  k = await loadKernel();
  parts = buildTestPrint(k).map((p) => ({ ...p, manifold: toOrigin(p.manifold) }));
});

describe('tolerantie-testprint', () => {
  it('bestaat uit geldige, waterdichte onderdelen', () => {
    for (const p of parts) {
      expect(p.manifold.status(), p.id).toBe('NoError');
      expect(p.manifold.volume(), p.id).toBeGreaterThan(0);
    }
  });

  it('heeft unieke id’s', () => {
    expect(new Set(parts.map((p) => p.id)).size).toBe(parts.length);
  });

  it('heeft groeven die met de speling ruimer worden', () => {
    const volumes = CLEARANCES.map((_, i) => part(`groef-${i + 1}`).manifold.volume());
    for (let i = 1; i < volumes.length; i++) expect(volumes[i]).toBeLessThan(volumes[i - 1]);
  });

  it('heeft groeven van ringdikte + 2 × speling breed', () => {
    const c = CLEARANCES[0];
    const ring = STUD.ringWall + 2 * c;
    const outer = STUD.outerDiameter / 2 + c;
    const inner = outer - ring;
    const disk = part('groef-1').manifold;
    const { max } = disk.boundingBox();
    const center: [number, number] = [max[0] / 2, max[1] / 2];
    // Een dunne staaf door het midden van de groef raakt niets; net buiten de groef wel.
    const probe = (r: number) =>
      k.Manifold.cylinder(1, 0.05, 0.05, 8).translate([center[0] + r, center[1], 1]).intersect(disk).volume();
    expect(probe((inner + outer) / 2)).toBe(0);
    expect(probe(inner - 0.2)).toBeGreaterThan(0);
    expect(probe(outer + 0.2)).toBeGreaterThan(0);
  });

  it('heeft een nop die even hoog is als ontworpen', () => {
    const { min, max } = part('nop').manifold.boundingBox();
    expect(max[2] - min[2]).toBeCloseTo(STUD.height, 3);
    expect(max[0] - min[0]).toBeCloseTo(STUD.outerDiameter, 0);
  });

  it('heeft een schot dat in de krapste gleuf past', () => {
    const { min, max } = part('schot').manifold.boundingBox();
    expect(max[2] - min[2]).toBeCloseTo(DIVIDER.thickness, 5);
    expect(DIVIDER.thickness + 2 * CLEARANCES[0]).toBeGreaterThan(DIVIDER.thickness);
  });

  it('heeft klikarmen met steeds hogere haken', () => {
    const volumes = SNAP_HOOKS.map((_, i) => part(`klik-${i + 1}`).manifold.volume());
    // Hogere haak = meer materiaal, ook al heeft een hogere variant meer puntjes.
    for (let i = 1; i < volumes.length; i++) expect(volumes[i]).toBeGreaterThan(volumes[i - 1]);
  });

  it('past per materiaal op één X1-Carbon-printplaat', () => {
    const x1c = printers.find((p) => p.id === 'bambu-x1c')!;
    const [width, depth, height] = x1c.buildVolume;
    for (const material of ['PLA', 'PETG']) {
      const group = parts.filter((p) => p.material === material);
      const plates = packShelves(group, (p) => footprint(p.manifold), [width, depth], DEFAULT_BED_MARGIN);
      expect(plates).toHaveLength(1);
      for (const { item, x, y } of plates[0]) {
        const [w, d] = footprint(item.manifold);
        expect(x).toBeGreaterThanOrEqual(DEFAULT_BED_MARGIN);
        expect(y).toBeGreaterThanOrEqual(DEFAULT_BED_MARGIN);
        expect(x + w).toBeLessThanOrEqual(width - DEFAULT_BED_MARGIN);
        expect(y + d).toBeLessThanOrEqual(depth - DEFAULT_BED_MARGIN);
        expect(item.manifold.boundingBox().max[2]).toBeLessThanOrEqual(height);
      }
    }
  });

  it('plaatst onderdelen op een plaat zonder overlap', () => {
    const plates = packShelves(parts, (p) => footprint(p.manifold), [256, 256], DEFAULT_BED_MARGIN);
    for (const plate of plates) {
      const boxes = plate.map(({ item, x, y }) => {
        const [w, d] = footprint(item.manifold);
        return { x0: x, y0: y, x1: x + w, y1: y + d };
      });
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
          expect(overlap).toBe(false);
        }
    }
  });
});

describe('export', () => {
  it('schrijft een binaire STL met het juiste aantal driehoeken', () => {
    const mesh = part('nop').manifold.getMesh();
    const stl = toBinaryStl(mesh, 'Nop');
    const triangles = mesh.triVerts.length / 3;
    expect(new DataView(stl.buffer).getUint32(80, true)).toBe(triangles);
    expect(stl.byteLength).toBe(84 + 50 * triangles);
    expect(new TextDecoder().decode(stl.subarray(0, 5))).not.toBe('solid');
  });

  it('schrijft een 3MF met één object per onderdeel', () => {
    const objects = parts.slice(0, 3).map((p) => ({ name: p.name, mesh: p.manifold.getMesh() }));
    const files = unzipSync(toThreeMf(objects));
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining(['[Content_Types].xml', '_rels/.rels', '3D/3dmodel.model']),
    );
    const model = strFromU8(files['3D/3dmodel.model']);
    expect(model.match(/<object /g)).toHaveLength(3);
    expect(model.match(/<item /g)).toHaveLength(3);
  });
});
