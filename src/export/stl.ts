import { vertex, type MeshData } from './mesh';

/** Binaire STL: 80 bytes kop, aantal driehoeken, daarna 50 bytes per driehoek. */
export function toBinaryStl(mesh: MeshData, name = 'BrikBox'): Uint8Array {
  const triangles = mesh.triVerts.length / 3;
  const bytes = new Uint8Array(84 + triangles * 50);
  const view = new DataView(bytes.buffer);
  // Een kop die met "solid" begint laat sommige programma's denken dat het ASCII-STL is.
  bytes.set(new TextEncoder().encode(`BrikBox ${name}`).subarray(0, 80));
  view.setUint32(80, triangles, true);

  let offset = 84;
  for (let t = 0; t < triangles; t++) {
    const a = vertex(mesh, mesh.triVerts[3 * t]);
    const b = vertex(mesh, mesh.triVerts[3 * t + 1]);
    const c = vertex(mesh, mesh.triVerts[3 * t + 2]);
    for (const value of [...normal(a, b, c), ...a, ...b, ...c]) {
      view.setFloat32(offset, value, true);
      offset += 4;
    }
    offset += 2; // attribuut-bytes, altijd 0
  }
  return bytes;
}

function normal(a: number[], b: number[], c: number[]): [number, number, number] {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: [number, number, number] = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const length = Math.hypot(...n) || 1;
  return [n[0] / length, n[1] / length, n[2] / length];
}
