/** Driehoeksmesh zoals manifold-3d hem levert (`Manifold.getMesh()`). */
export interface MeshData {
  /** Aantal waarden per vertex; de eerste drie zijn x, y, z. */
  numProp: number;
  vertProperties: Float32Array;
  triVerts: Uint32Array;
}

export function vertex(mesh: MeshData, index: number): [number, number, number] {
  const o = index * mesh.numProp;
  return [mesh.vertProperties[o], mesh.vertProperties[o + 1], mesh.vertProperties[o + 2]];
}
