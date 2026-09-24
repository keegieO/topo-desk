import type { LidarClass, LidarPt } from "./lidar";

const TARGET = 350_000;
const decoder = new TextDecoder("ascii");

export type LasInfo = {
  pts: LidarPt[];
  rawCount: number;
  kept: number;
  compressed: boolean;
  min: { n: number; e: number; z: number };
  max: { n: number; e: number; z: number };
};

export function isPointCloudName(name: string): boolean {
  return /\.(las|laz)$/i.test(name);
}

export function isSurveyName(name: string): boolean {
  return /\.(csv|txt|asc|xyz|pnezd|penzd|fbk)$/i.test(name);
}

export function asprsToClass(c: number): LidarClass {
  if (c === 2 || c === 8 || c === 9 || c === 10 || c === 11) return "ground";
  if (c === 3 || c === 4 || c === 5) return "veg";
  if (c === 6) return "building";
  if (c === 13 || c === 14 || c === 15 || c === 16) return "wire";
  if (c === 7 || c === 18) return "noise";
  if (c === 0 || c === 1) return "ground";
  return "noise";
}

function readCString(buf: ArrayBuffer, start: number, len: number): string {
  return decoder.decode(new Uint8Array(buf, start, len)).replace(/\0/g, "").trim();
}

export function isCompressedLas(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 227) return false;
  const v = new DataView(buffer);
  const sig = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3));
  if (sig !== "LASF") return false;
  const headerSize = v.getUint16(94, true);
  const nVlr = v.getUint32(100, true);
  let off = headerSize;
  for (let i = 0; i < nVlr && off + 54 <= buffer.byteLength; i++) {
    const userId = readCString(buffer, off + 2, 16).toLowerCase();
    const recId = v.getUint16(off + 18, true);
    const recLen = v.getUint16(off + 20, true);
    if (userId.startsWith("laszip") || recId === 22204) return true;
    off += 54 + recLen;
  }
  return false;
}

function headerCount(v: DataView, headerSize: number): number {
  let count = v.getUint32(107, true);
  if (headerSize >= 375) {
    const lo = v.getUint32(247, true);
    const hi = v.getUint32(251, true);
    const big = lo + hi * 0x100000000;
    if (big > 0) count = big;
  }
  return count;
}

export function parseUncompressedLas(buffer: ArrayBuffer): LasInfo {
  if (buffer.byteLength < 227) throw new Error("File is too small to be LAS");
  const v = new DataView(buffer);
  const sig = String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3));
  if (sig !== "LASF") throw new Error("Not a LAS/LAZ file");
  const headerSize = v.getUint16(94, true);
  const offset = v.getUint32(96, true);
  const format = v.getUint8(104);
  const recLen = v.getUint16(105, true);
  const count = headerCount(v, headerSize);
  const scaleX = v.getFloat64(131, true);
  const scaleY = v.getFloat64(139, true);
  const scaleZ = v.getFloat64(147, true);
  const offX = v.getFloat64(155, true);
  const offY = v.getFloat64(163, true);
  const offZ = v.getFloat64(171, true);
  const maxX = v.getFloat64(179, true);
  const minX = v.getFloat64(187, true);
  const maxY = v.getFloat64(195, true);
  const minY = v.getFloat64(203, true);
  const maxZ = v.getFloat64(211, true);
  const minZ = v.getFloat64(219, true);

  const stride = Math.max(1, Math.ceil(count / TARGET));
  const pts: LidarPt[] = [];
  const clsOff = format < 6 ? 15 : 16;
  const clsMask = format < 6 ? 0x1f : 0xff;

  for (let i = 0; i < count; i += stride) {
    const p = offset + i * recLen;
    if (p + 12 > buffer.byteLength) break;
    const x = v.getInt32(p, true) * scaleX + offX;
    const y = v.getInt32(p + 4, true) * scaleY + offY;
    const z = v.getInt32(p + 8, true) * scaleZ + offZ;
    const cls = p + clsOff < buffer.byteLength ? v.getUint8(p + clsOff) & clsMask : 1;
    pts.push({ n: y, e: x, z, cls: asprsToClass(cls) });
  }

  return {
    pts,
    rawCount: count,
    kept: pts.length,
    compressed: false,
    min: { n: minY, e: minX, z: minZ },
    max: { n: maxY, e: maxX, z: maxZ },
  };
}

async function parseLaz(buffer: ArrayBuffer): Promise<LasInfo> {
  const v = new DataView(buffer);
  const headerSize = v.getUint16(94, true);
  const rawCount = headerCount(v, headerSize);
  const skip = Math.max(1, Math.ceil(Math.max(rawCount, 1) / TARGET));
  const { parse } = await import("@loaders.gl/core");
  const { LASLoader } = await import("@loaders.gl/las");
  const mesh = (await parse(buffer, LASLoader, {
    worker: false,
    las: { skip, fp64: true, shape: "mesh" },
  })) as unknown as {
    attributes: {
      POSITION: { value: ArrayLike<number> };
      classification?: { value: ArrayLike<number> };
    };
    header?: { vertexCount?: number; boundingBox?: number[][] };
  };
  const pos = mesh.attributes.POSITION.value;
  const clsArr = mesh.attributes.classification?.value;
  const n = Math.floor(pos.length / 3);
  const pts: LidarPt[] = new Array(n);
  let minN = Infinity;
  let minE = Infinity;
  let minZ = Infinity;
  let maxN = -Infinity;
  let maxE = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    const c = clsArr ? Number(clsArr[i]) : 1;
    pts[i] = { n: y, e: x, z, cls: asprsToClass(c) };
    if (y < minN) minN = y;
    if (y > maxN) maxN = y;
    if (x < minE) minE = x;
    if (x > maxE) maxE = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const box = mesh.header?.boundingBox;
  return {
    pts,
    rawCount: rawCount || n * skip,
    kept: n,
    compressed: true,
    min: box
      ? { n: box[0][1], e: box[0][0], z: box[0][2] }
      : { n: minN, e: minE, z: minZ },
    max: box
      ? { n: box[1][1], e: box[1][0], z: box[1][2] }
      : { n: maxN, e: maxE, z: maxZ },
  };
}

export async function parsePointCloud(buffer: ArrayBuffer, fileName: string): Promise<LasInfo> {
  const name = fileName.toLowerCase();
  const compressed = name.endsWith(".laz") || isCompressedLas(buffer);
  if (compressed) {
    try {
      return await parseLaz(buffer);
    } catch (err) {
      if (!isCompressedLas(buffer)) return parseUncompressedLas(buffer);
      throw err instanceof Error ? err : new Error("Could not decode LAZ");
    }
  }
  return parseUncompressedLas(buffer);
}
