import type { CrossSection, Manifold, Vec2 } from 'manifold-3d';
import type { Kernel } from './kernel';
import { DIVIDER, DOVETAIL, FLOOR_ABOVE_GROOVE, HINGE, STUD } from './dimensions';

/**
 * Tolerantie-testprint (fase 0): kleine proefstukken van de kritische passingen,
 * elk in vijf varianten. Het aantal verzonken puntjes op een stuk = het variantnummer.
 */

export type Material = 'PLA' | 'PETG';

export interface TestPart {
  id: string;
  /** Naam zoals hij in de slicer verschijnt. */
  name: string;
  material: Material;
  manifold: Manifold;
}

/** Speling per kant (mm) voor groef, schotgleuf en zwaluwstaart; variant 1 t/m 5. */
export const CLEARANCES = [0.1, 0.15, 0.2, 0.25, 0.3];
/** Gatdiameters (mm) voor de filament-pen; variant 1 t/m 5. */
export const PIN_HOLES = [1.85, 1.95, 2.05, 2.15, 2.25];
/** Hoogte (mm) van de haak van de klik; variant 1 t/m 5. */
export const SNAP_HOOKS = [0.4, 0.6, 0.8, 1.0, 1.2];

const EPS = 0.01;

export function buildTestPrint(k: Kernel): TestPart[] {
  const parts: TestPart[] = [{ id: 'nop', name: 'Nop', material: 'PLA', manifold: stud(k) }];

  CLEARANCES.forEach((c, i) =>
    parts.push({ id: `groef-${i + 1}`, name: `Groef ${i + 1} (${mm(c)})`, material: 'PLA', manifold: grooveDisk(k, c, i + 1) }),
  );
  parts.push(
    { id: 'schotgleuven', name: 'Schotgleuven 1-5', material: 'PLA', manifold: slotBlock(k) },
    { id: 'schot', name: 'Schot', material: 'PLA', manifold: k.Manifold.cube([45, 20, DIVIDER.thickness]) },
    { id: 'pengatmeter', name: 'Pengatmeter 1-5', material: 'PLA', manifold: pinHoleGauge(k) },
    { id: 'scharnier-bak', name: 'Scharnier bak', material: 'PLA', manifold: hingeBase(k) },
    { id: 'scharnier-greep', name: 'Scharnier greep', material: 'PETG', manifold: hingeLeaf(k) },
    { id: 'klik-houder', name: 'Klik houder', material: 'PLA', manifold: snapReceiver(k) },
  );
  SNAP_HOOKS.forEach((h, i) =>
    parts.push({ id: `klik-${i + 1}`, name: `Klik ${i + 1} (haak ${mm(h)})`, material: 'PETG', manifold: snapArm(k, h, i + 1) }),
  );
  CLEARANCES.forEach((c, i) => {
    const [male, female] = dovetailPair(k, c, i + 1);
    parts.push(
      { id: `zwaluwstaart-${i + 1}-a`, name: `Zwaluwstaart ${i + 1}A (${mm(c)})`, material: 'PLA', manifold: male },
      { id: `zwaluwstaart-${i + 1}-b`, name: `Zwaluwstaart ${i + 1}B (${mm(c)})`, material: 'PLA', manifold: female },
    );
  });
  return parts;
}

/** Nop zoals op het deksel: cilinder met een holle bovenkant (de ring). */
function stud(k: Kernel): Manifold {
  const { outerDiameter, ringWall, height, engagement } = STUD;
  const r = outerDiameter / 2;
  const recess = k.Manifold.cylinder(engagement + EPS, r - ringWall).translate([0, 0, height - engagement]);
  return k.Manifold.cylinder(height, r).subtract(recess);
}

/** Stuk bodem met de ringgroef aan de onderkant, geprint zoals in de echte doos (groef op het bed). */
function grooveDisk(k: Kernel, clearance: number, variant: number): Manifold {
  const { outerDiameter, ringWall, engagement } = STUD;
  const r = outerDiameter / 2;
  const thickness = engagement + FLOOR_ABOVE_GROOVE;
  const groove = k.Manifold.cylinder(engagement + EPS, r + clearance)
    .subtract(k.Manifold.cylinder(engagement + 3 * EPS, r - ringWall - clearance).translate([0, 0, -EPS]))
    .translate([0, 0, -EPS]);
  return k.Manifold.cylinder(thickness, r + 4)
    .subtract(groove)
    .subtract(dots(k, variant, 0, 0, thickness));
}

/** Wandstuk met vijf schotgleuven, van smal (1) naar ruim (5). */
function slotBlock(k: Kernel): Manifold {
  const pitch = 20;
  const base = 3;
  const wall = 6;
  const height = 30;
  let block = k.Manifold.cube([pitch * CLEARANCES.length + 10, 18, base]).add(
    k.Manifold.cube([pitch * CLEARANCES.length + 10, wall, base + height]),
  );
  CLEARANCES.forEach((c, i) => {
    const width = DIVIDER.thickness + 2 * c;
    const x = 15 + i * pitch;
    const slot = k.Manifold.cube([width, DIVIDER.slotDepth + EPS, height + EPS]).translate([
      x - width / 2,
      wall - DIVIDER.slotDepth,
      base,
    ]);
    block = block.subtract(slot).subtract(dots(k, i + 1, x, 12, base));
  });
  return block;
}

/** Balkje met vijf liggende gaten om de filament-pen in te passen. */
function pinHoleGauge(k: Kernel): Manifold {
  const pitch = 12;
  const height = 12;
  let profile = rect(k, 0, 0, pitch * PIN_HOLES.length + 6, height);
  PIN_HOLES.forEach((d, i) => (profile = profile.subtract(teardrop(k, d, 9 + i * pitch, 6))));
  let bar = extrudeXZ(profile, 10);
  PIN_HOLES.forEach((_, i) => (bar = bar.subtract(dots(k, i + 1, 9 + i * pitch, -5, height, 1.9, 0.5))));
  return bar;
}

/** Bakzijde van het scharnier: plaatje met twee knokkels, pengat klemmend. */
function hingeBase(k: Kernel): Manifold {
  const { knuckleRadius: r, snugHole } = HINGE;
  const plate = 3;
  const knuckle = 9;
  const width = 30;
  const axis = plate + r + 0.5;
  const profile = k.CrossSection.circle(r)
    .translate(r, axis)
    .add(rect(k, 0, 0, 2 * r, axis))
    .subtract(teardrop(k, snugHole, r, axis));
  return k.Manifold.cube([width, 20, plate]).add(
    k.Manifold.union([extrudeYZ(profile, knuckle), extrudeYZ(profile, knuckle).translate([width - knuckle, 0, 0])]),
  );
}

/** Greepzijde van het scharnier: één knokkel met een plaatje, pengat vrij draaiend. */
function hingeLeaf(k: Kernel): Manifold {
  const { knuckleRadius: r, knuckleGap, looseHole } = HINGE;
  const length = 30 - 2 * 9 - 2 * knuckleGap;
  const profile = k.CrossSection.circle(r)
    .translate(r, r)
    .add(rect(k, r, 0, 25, 3))
    .subtract(teardrop(k, looseHole, r, r));
  return extrudeYZ(profile, length);
}

/** Houder voor de klik: de arm schuift erin en de haak valt achter de rand. */
function snapReceiver(k: Kernel): Manifold {
  const floor = 1.2;
  const outline = rect(k, 10, -3.7, 36, 5.1);
  const walls = outline
    .subtract(rect(k, 10 - EPS, -0.2, 18 + EPS, 1.8))
    .subtract(rect(k, 18, -0.2, 34, 3.1))
    .subtract(rect(k, 26.7, -3.7 - EPS, 34, -0.2 + EPS));
  return outline.extrude(floor).add(walls.extrude(6.4).translate([0, 0, floor]));
}

/** Verende arm met een haak van `hook` mm; de handgreep draagt de variantpuntjes. */
function snapArm(k: Kernel, hook: number, variant: number): Manifold {
  const height = 6;
  const profile = rect(k, 0, -3, 10, 4.6)
    .add(rect(k, 10 - EPS, 0, 31, 1.6))
    .add(polygon(k, [[27, EPS], [27, -hook], [28, -hook], [31, EPS]]));
  return profile.extrude(height).subtract(dots(k, variant, 5, 0.8, height, 1.9, 0.6));
}

/** Twee bodemstukjes die met een puzzel-zwaluwstaart in elkaar klikken. */
function dovetailPair(k: Kernel, clearance: number, variant: number): [Manifold, Manifold] {
  const { neck, head, length } = DOVETAIL;
  const thickness = 3;
  const tab = polygon(k, [[-neck / 2, -1], [neck / 2, -1], [head / 2, length], [-head / 2, length]]);
  const male = rect(k, -12.5, -20, 12.5, 0).add(tab).extrude(thickness).subtract(dots(k, variant, 0, -12, thickness));
  const female = rect(k, -12.5, 0, 12.5, 20)
    .subtract(tab.offset(clearance, 'Miter'))
    .extrude(thickness)
    .subtract(dots(k, variant, 0, 14, thickness));
  return [male, female];
}

function rect(k: Kernel, x0: number, y0: number, x1: number, y1: number): CrossSection {
  return k.CrossSection.square([x1 - x0, y1 - y0]).translate(x0, y0);
}

function polygon(k: Kernel, points: Vec2[]): CrossSection {
  return k.CrossSection.ofPolygons([points], 'NonZero');
}

/** Druppelvormig gat met de punt omhoog, zodat een liggend gat zonder support print. */
function teardrop(k: Kernel, diameter: number, cx: number, cy: number): CrossSection {
  const r = diameter / 2;
  const tip = k.CrossSection.square([EPS, EPS], true).translate(0, r * Math.SQRT2);
  return k.CrossSection.hull([k.CrossSection.circle(r, 64), tip]).translate(cx, cy);
}

/** Rij verzonken puntjes op hoogte `top`, gecentreerd rond (x, y), die het variantnummer aangeven. */
function dots(k: Kernel, count: number, x: number, y: number, top: number, pitch = 2.6, radius = 0.8): Manifold {
  const depth = 0.6;
  const dot = k.Manifold.cylinder(depth + EPS, radius, radius, 24);
  const start = x - ((count - 1) * pitch) / 2;
  return k.Manifold.union(
    Array.from({ length: count }, (_, i) => dot.translate([start + i * pitch, y, top - depth])),
  );
}

/** Profiel in het XZ-vlak (u = x, v = z), geëxtrudeerd over `length` in Y. */
function extrudeXZ(profile: CrossSection, length: number): Manifold {
  return profile.extrude(length).rotate([90, 0, 0]);
}

/** Profiel in het YZ-vlak (u = y, v = z), geëxtrudeerd over `length` in X. */
function extrudeYZ(profile: CrossSection, length: number): Manifold {
  return profile.extrude(length).rotate([90, 0, 90]);
}

function mm(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} mm`;
}
