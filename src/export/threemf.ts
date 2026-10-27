import { strToU8, zipSync } from 'fflate';
import { vertex, type MeshData } from './mesh';

export interface ThreeMfObject {
  name: string;
  mesh: MeshData;
  /** Verschuiving in mm die in de vertices wordt verwerkt. */
  offset?: [number, number, number];
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>`;

/** Eén 3MF-bestand met elk onderdeel als apart object, op de opgegeven plek. */
export function toThreeMf(objects: ThreeMfObject[]): Uint8Array {
  const resources: string[] = [];
  const items: string[] = [];

  objects.forEach((object, i) => {
    const id = i + 1;
    const [dx, dy, dz] = object.offset ?? [0, 0, 0];
    const { mesh } = object;
    const vertices: string[] = [];
    for (let v = 0; v < mesh.vertProperties.length / mesh.numProp; v++) {
      const [x, y, z] = vertex(mesh, v);
      vertices.push(`<vertex x="${num(x + dx)}" y="${num(y + dy)}" z="${num(z + dz)}"/>`);
    }
    const triangles: string[] = [];
    for (let t = 0; t < mesh.triVerts.length; t += 3) {
      triangles.push(`<triangle v1="${mesh.triVerts[t]}" v2="${mesh.triVerts[t + 1]}" v3="${mesh.triVerts[t + 2]}"/>`);
    }
    resources.push(
      `<object id="${id}" name="${escapeXml(object.name)}" type="model"><mesh><vertices>${vertices.join('')}</vertices>` +
        `<triangles>${triangles.join('')}</triangles></mesh></object>`,
    );
    items.push(`<item objectid="${id}"/>`);
  });

  const model =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<model unit="millimeter" xml:lang="nl-NL" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">` +
    `<metadata name="Application">BrikBox</metadata>` +
    `<resources>${resources.join('')}</resources><build>${items.join('')}</build></model>`;

  return zipSync({
    '[Content_Types].xml': strToU8(CONTENT_TYPES),
    '_rels/.rels': strToU8(RELS),
    '3D/3dmodel.model': strToU8(model),
  });
}

function num(value: number): string {
  return String(Math.round(value * 10000) / 10000);
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
