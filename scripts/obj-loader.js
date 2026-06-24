async function loadOBJ(path) {
  const text = await fetch(path).then((r) => r.text());
  const lines = text.split("\n");

  const positions = [];
  const texcoords = [];
  const normals = [];

  const parts = {};
  let currentMaterial = "default";
  parts[currentMaterial] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const tokens = line.split(/\s+/);

    if (tokens[0] === "v") {
      positions.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3]),
      ]);
    }
    if (tokens[0] === "vt") {
      texcoords.push([parseFloat(tokens[1]), parseFloat(tokens[2])]);
    }
    if (tokens[0] === "vn") {
      normals.push([
        parseFloat(tokens[1]),
        parseFloat(tokens[2]),
        parseFloat(tokens[3]),
      ]);
    }

    if (tokens[0] === "usemtl") {
      currentMaterial = tokens[1];
      if (!parts[currentMaterial]) {
        parts[currentMaterial] = [];
      }
    }

    if (tokens[0] === "f") {
      const faceVerts = tokens.slice(1).map((token) => {
        return token.split("/").map(Number);
      });

      for (let i = 1; i < faceVerts.length - 1; i++) {
        const tri = [faceVerts[0], faceVerts[i], faceVerts[i + 1]];
        for (const [vi, vti, vni] of tri) {
          const pos = positions[vi - 1] || [0, 0, 0];
          const uv = texcoords[vti - 1] || [0, 0];
          const nor = normals[vni - 1] || [0, 1, 0];
          parts[currentMaterial].push(...pos, ...uv, ...nor);
        }
      }
    }
  }

  const result = [];
  for (const matName in parts) {
    if (parts[matName].length > 0) {
      result.push({
        materialName: matName,
        bufferData: new Float32Array(parts[matName]),
        vertexCount: parts[matName].length / 8,
      });
    }
  }

  return result;
}

function getHitboxFromOBJ(OBJ) {
    const linhas = OBJ.split('\n');
    const vertices = [];
    const hitboxes = [];
    const padding = 0.2;
    const alturaMinimaParede = 0.5;

    for (let linha of linhas) {
        linha = linha.trim();
        const partes = linha.split(/\s+/);

        if (partes[0] === 'v') {
            if (vertices.length === 0) vertices.push(null); 
            vertices.push({
                x: parseFloat(partes[1]),
                y: parseFloat(partes[2]),
                z: parseFloat(partes[3])
            });
        } 
        else if (partes[0] === 'f') {
            const idx1 = parseInt(partes[1].split('/')[0]);
            const idx2 = parseInt(partes[2].split('/')[0]);
            const idx3 = parseInt(partes[3].split('/')[0]);

            const v1 = vertices[idx1];
            const v2 = vertices[idx2];
            const v3 = vertices[idx3];

            if (!v1 || !v2 || !v3) continue;
            const maxY = Math.max(v1.y, v2.y, v3.y);
            const minY = Math.min(v1.y, v2.y, v3.y);

            if (maxY - minY > alturaMinimaParede) {
                hitboxes.push({
                    minX: Math.min(v1.x, v2.x, v3.x) - padding,
                    maxX: Math.max(v1.x, v2.x, v3.x) + padding,
                    minZ: Math.min(v1.z, v2.z, v3.z) - padding,
                    maxZ: Math.max(v1.z, v2.z, v3.z) + padding
                });
            }
        }
    }
    return hitboxes;
}

// Exemplo de uso:
// fetch('meu_mapa.obj')
//   .then(res => res.text())
//   .then(texto => console.log(gerarHitboxesDoOBJ(texto)));