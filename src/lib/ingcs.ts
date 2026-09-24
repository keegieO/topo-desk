/** Official InGCS NAD83(2011) TM parameters. False E/N defined in metres = 240000 / 36000. Working unit is US survey foot. */

export type IngcsZone = {
  id: string;
  name: string;
  lat0: number;
  lon0: number;
  k0: number;
};

function dms(d: number, m: number): number {
  return d + m / 60;
}

type Row = [string, number, number, number, number, number];

const ROWS: Row[] = [
  ["Adams", 40, 33, 84, 57, 1.000034],
  ["Allen", 40, 54, 85, 3, 1.000031],
  ["Bartholomew", 39, 0, 85, 51, 1.000026],
  ["Benton", 40, 27, 87, 18, 1.000029],
  ["Blackford", 40, 3, 85, 24, 1.000038],
  ["Boone", 39, 36, 86, 30, 1.000036],
  ["Brown", 39, 0, 86, 18, 1.00003],
  ["Carroll", 40, 24, 86, 39, 1.000026],
  ["Cass", 40, 33, 86, 24, 1.000028],
  ["Clark", 38, 9, 85, 36, 1.000021],
  ["Clay", 39, 9, 87, 9, 1.000024],
  ["Clinton", 40, 9, 86, 36, 1.000032],
  ["Crawford", 38, 6, 86, 30, 1.000025],
  ["Daviess", 38, 27, 87, 6, 1.000018],
  ["Dearborn", 38, 39, 84, 54, 1.000029],
  ["Decatur", 39, 6, 85, 39, 1.000036],
  ["DeKalb", 41, 15, 84, 57, 1.000036],
  ["Delaware", 40, 3, 85, 24, 1.000038],
  ["Dubois", 38, 12, 86, 57, 1.00002],
  ["Elkhart", 40, 39, 85, 51, 1.000033],
  ["Fayette", 39, 15, 85, 3, 1.000038],
  ["Floyd", 38, 9, 85, 36, 1.000021],
  ["Fountain", 39, 57, 87, 18, 1.000025],
  ["Franklin", 39, 15, 85, 3, 1.000038],
  ["Fulton", 40, 54, 86, 18, 1.000031],
  ["Gibson", 38, 9, 87, 39, 1.000013],
  ["Grant", 40, 21, 85, 42, 1.000034],
  ["Greene", 38, 27, 87, 6, 1.000018],
  ["Hamilton", 39, 54, 86, 0, 1.000034],
  ["Hancock", 39, 39, 85, 48, 1.000036],
  ["Harrison", 37, 57, 86, 9, 1.000027],
  ["Hendricks", 39, 36, 86, 30, 1.000036],
  ["Henry", 39, 45, 85, 27, 1.000043],
  ["Howard", 40, 21, 86, 9, 1.000031],
  ["Huntington", 40, 39, 85, 30, 1.000034],
  ["Jackson", 38, 42, 85, 57, 1.000022],
  ["Jasper", 40, 42, 87, 6, 1.000027],
  ["Jay", 40, 18, 85, 0, 1.000038],
  ["Jefferson", 38, 33, 85, 21, 1.000028],
  ["Jennings", 38, 48, 85, 48, 1.000025],
  ["Johnson", 39, 18, 86, 9, 1.000031],
  ["Knox", 38, 24, 87, 27, 1.000015],
  ["Kosciusko", 40, 39, 85, 51, 1.000033],
  ["LaGrange", 41, 15, 85, 27, 1.000037],
  ["Lake", 40, 42, 87, 24, 1.000026],
  ["LaPorte", 40, 54, 86, 45, 1.000027],
  ["Lawrence", 38, 6, 86, 30, 1.000025],
  ["Madison", 39, 39, 85, 48, 1.000036],
  ["Marion", 39, 18, 86, 9, 1.000031],
  ["Marshall", 40, 54, 86, 18, 1.000031],
  ["Martin", 38, 12, 86, 57, 1.00002],
  ["Miami", 40, 21, 86, 9, 1.000031],
  ["Monroe", 38, 57, 86, 30, 1.000028],
  ["Montgomery", 39, 27, 86, 57, 1.000031],
  ["Morgan", 38, 57, 86, 30, 1.000028],
  ["Newton", 40, 42, 87, 24, 1.000026],
  ["Noble", 41, 15, 85, 27, 1.000037],
  ["Ohio", 38, 39, 84, 54, 1.000029],
  ["Orange", 38, 6, 86, 30, 1.000025],
  ["Owen", 39, 9, 86, 54, 1.000026],
  ["Parke", 39, 36, 87, 21, 1.000022],
  ["Perry", 37, 48, 86, 42, 1.00002],
  ["Pike", 37, 51, 87, 18, 1.000015],
  ["Porter", 40, 42, 87, 6, 1.000027],
  ["Posey", 37, 45, 87, 57, 1.000013],
  ["Pulaski", 40, 54, 86, 45, 1.000027],
  ["Putnam", 39, 27, 86, 57, 1.000031],
  ["Randolph", 39, 42, 85, 3, 1.000044],
  ["Ripley", 38, 54, 85, 18, 1.000038],
  ["Rush", 39, 6, 85, 39, 1.000036],
  ["St. Joseph", 40, 54, 86, 18, 1.000031],
  ["Scott", 38, 9, 85, 36, 1.000021],
  ["Shelby", 39, 18, 85, 54, 1.00003],
  ["Spencer", 37, 45, 87, 3, 1.000014],
  ["Starke", 40, 54, 86, 45, 1.000027],
  ["Steuben", 41, 30, 85, 0, 1.000041],
  ["Sullivan", 38, 54, 87, 30, 1.000017],
  ["Switzerland", 38, 39, 84, 54, 1.000029],
  ["Tippecanoe", 40, 12, 86, 54, 1.000026],
  ["Tipton", 39, 54, 86, 0, 1.000034],
  ["Union", 39, 15, 85, 3, 1.000038],
  ["Vanderburgh", 37, 48, 87, 33, 1.000015],
  ["Vermillion", 39, 36, 87, 21, 1.000022],
  ["Vigo", 39, 15, 87, 27, 1.00002],
  ["Wabash", 40, 39, 85, 51, 1.000033],
  ["Warren", 39, 57, 87, 18, 1.000025],
  ["Warrick", 37, 51, 87, 18, 1.000015],
  ["Washington", 37, 57, 86, 9, 1.000027],
  ["Wayne", 39, 42, 85, 3, 1.000044],
  ["Wells", 40, 33, 85, 15, 1.000034],
  ["White", 40, 12, 86, 54, 1.000026],
  ["Whitley", 40, 39, 85, 30, 1.000034],
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z]+/g, "");
}

export const INGCS_ZONES: IngcsZone[] = ROWS.map(([name, ld, lm, od, om, k0]) => ({
  id: slug(name),
  name,
  lat0: dms(ld, lm),
  lon0: -dms(od, om),
  k0,
}));

const BY_ID = new Map(INGCS_ZONES.map((z) => [z.id, z]));

const ALIAS: Record<string, string> = {
  stjoseph: "stjoseph",
  saintjoseph: "stjoseph",
  dek: "dekalb",
  laporte: "laporte",
  lagrange: "lagrange",
};

export function findIngcsZone(hint: string | undefined | null): IngcsZone | undefined {
  if (!hint) return undefined;
  const raw = hint.toLowerCase();
  for (const z of INGCS_ZONES) {
    if (raw.includes(z.name.toLowerCase())) return z;
  }
  const compact = raw.replace(/[^a-z]+/g, "");
  const id = ALIAS[compact] ?? compact;
  if (BY_ID.has(id)) return BY_ID.get(id);
  for (const z of INGCS_ZONES) {
    if (compact.includes(z.id)) return z;
  }
  return undefined;
}

export function ingcsById(id: string): IngcsZone | undefined {
  return BY_ID.get(id.replace(/^ingcs:/, ""));
}
