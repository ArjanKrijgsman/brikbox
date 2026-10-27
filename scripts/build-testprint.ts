/**
 * Genereert de tolerantie-testprint (fase 0) in test-prints/:
 * één STL per onderdeel en een 3MF-printplaat per materiaal.
 *
 * Gebruik: npm run testprint
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_BED_MARGIN, DEFAULT_PRINTER_ID, printers } from '../src/config/printers';
import { loadKernel } from '../src/geometry/kernel';
import { footprint, packShelves, toOrigin } from '../src/geometry/layout';
import { buildTestPrint, type Material } from '../src/geometry/testprint';
import { toBinaryStl } from '../src/export/stl';
import { toThreeMf } from '../src/export/threemf';

const OUT_DIR = 'test-prints';
const STL_DIR = join(OUT_DIR, 'stl');

const printer = printers.find((p) => p.id === DEFAULT_PRINTER_ID)!;
const [bedWidth, bedDepth] = printer.buildVolume;

const k = await loadKernel();
const parts = buildTestPrint(k).map((part) => ({ ...part, manifold: toOrigin(part.manifold) }));

rmSync(STL_DIR, { recursive: true, force: true });
mkdirSync(STL_DIR, { recursive: true });
for (const part of parts) {
  writeFileSync(join(STL_DIR, `${part.id}.stl`), toBinaryStl(part.manifold.getMesh(), part.name));
}

for (const material of ['PLA', 'PETG'] satisfies Material[]) {
  const group = parts.filter((p) => p.material === material);
  const plates = packShelves(group, (p) => footprint(p.manifold), [bedWidth, bedDepth], DEFAULT_BED_MARGIN);
  plates.forEach((plate, i) => {
    const suffix = plates.length > 1 ? `-${i + 1}` : '';
    const file = join(OUT_DIR, `brikbox-testprint-${material.toLowerCase()}${suffix}.3mf`);
    writeFileSync(
      file,
      toThreeMf(plate.map(({ item, x, y }) => ({ name: item.name, mesh: item.manifold.getMesh(), offset: [x, y, 0] }))),
    );
    console.log(`${file}: ${plate.length} onderdelen (${printer.name})`);
  });
}

console.log(`${parts.length} STL-bestanden in ${STL_DIR}`);
