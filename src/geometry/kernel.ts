import Module from 'manifold-3d';
import type { ManifoldToplevel } from 'manifold-3d';

export type Kernel = ManifoldToplevel;

let kernel: Promise<Kernel> | undefined;

/** Laadt de manifold-3d WASM-kernel één keer en hergebruikt hem daarna. */
export function loadKernel(): Promise<Kernel> {
  kernel ??= Module().then((k) => {
    k.setup();
    // Fijne cirkels: hoogstens 2° of 0,3 mm per segment, wat het eerst bereikt wordt.
    k.setMinCircularAngle(2);
    k.setMinCircularEdgeLength(0.3);
    return k;
  });
  return kernel;
}
