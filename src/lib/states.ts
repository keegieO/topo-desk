/** NAD83 State Plane zones for the states around Indiana. False origins are US survey feet. */

export type SpZone = {
  id: string;
  state: string;
  label: string;
  kind: "tm" | "lcc";
  lat0: number;
  lon0: number;
  k0?: number;
  lat1?: number;
  lat2?: number;
  fe: number;
  fn: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
};

const M2FT = 3937 / 1200;

export const SP_ZONES: SpZone[] = [
  {
    id: "oh-n",
    state: "Ohio",
    label: "Ohio North",
    kind: "lcc",
    lat1: 41.7,
    lat2: 40.43333333333333,
    lat0: 39.666666666666664,
    lon0: -82.5,
    fe: 600000 * M2FT,
    fn: 0,
    latMin: 40.15,
    latMax: 42.05,
    lonMin: -84.85,
    lonMax: -80.5,
  },
  {
    id: "oh-s",
    state: "Ohio",
    label: "Ohio South",
    kind: "lcc",
    lat1: 39.93333333333333,
    lat2: 38.73333333333333,
    lat0: 38,
    lon0: -82.5,
    fe: 600000 * M2FT,
    fn: 0,
    latMin: 38.35,
    latMax: 40.55,
    lonMin: -84.85,
    lonMax: -80.5,
  },
  {
    id: "mi-n",
    state: "Michigan",
    label: "Michigan North",
    kind: "lcc",
    lat1: 45.48333333333333,
    lat2: 47.083333333333336,
    lat0: 44.78333333333333,
    lon0: -87,
    fe: 8000000 * M2FT,
    fn: 0,
    latMin: 45.2,
    latMax: 48.35,
    lonMin: -90.5,
    lonMax: -83.1,
  },
  {
    id: "mi-c",
    state: "Michigan",
    label: "Michigan Central",
    kind: "lcc",
    lat1: 44.18333333333333,
    lat2: 45.7,
    lat0: 43.31666666666667,
    lon0: -84.36666666666666,
    fe: 6000000 * M2FT,
    fn: 0,
    latMin: 43.15,
    latMax: 45.85,
    lonMin: -87.2,
    lonMax: -82.3,
  },
  {
    id: "mi-s",
    state: "Michigan",
    label: "Michigan South",
    kind: "lcc",
    lat1: 42.1,
    lat2: 43.666666666666664,
    lat0: 41.5,
    lon0: -84.36666666666666,
    fe: 4000000 * M2FT,
    fn: 0,
    latMin: 41.65,
    latMax: 43.7,
    lonMin: -86.9,
    lonMax: -82.3,
  },
  {
    id: "il-e",
    state: "Illinois",
    label: "Illinois East",
    kind: "tm",
    lat0: 36.666666666666664,
    lon0: -88.33333333333333,
    k0: 0.999975,
    fe: 300000 * M2FT,
    fn: 0,
    latMin: 36.95,
    latMax: 42.55,
    lonMin: -89.35,
    lonMax: -87.45,
  },
  {
    id: "il-w",
    state: "Illinois",
    label: "Illinois West",
    kind: "tm",
    lat0: 36.666666666666664,
    lon0: -90.16666666666667,
    k0: 0.9999411764705882,
    fe: 700000 * M2FT,
    fn: 0,
    latMin: 36.95,
    latMax: 42.55,
    lonMin: -91.55,
    lonMax: -88.9,
  },
  {
    id: "ky-n",
    state: "Kentucky",
    label: "Kentucky North",
    kind: "lcc",
    lat1: 37.96666666666667,
    lat2: 38.96666666666667,
    lat0: 37.5,
    lon0: -84.25,
    fe: 500000 * M2FT,
    fn: 0,
    latMin: 37.55,
    latMax: 39.2,
    lonMin: -85.4,
    lonMax: -81.95,
  },
  {
    id: "ky-s",
    state: "Kentucky",
    label: "Kentucky South",
    kind: "lcc",
    lat1: 36.73333333333333,
    lat2: 37.93333333333333,
    lat0: 36.333333333333336,
    lon0: -85.75,
    fe: 500000 * M2FT,
    fn: 500000 * M2FT,
    latMin: 36.45,
    latMax: 38.15,
    lonMin: -89.6,
    lonMax: -81.95,
  },
];

const COUNTY_ZONE: [string, string, string][] = [
  ["Ohio", "oh-n", "Allen,Ashland,Ashtabula,Auglaize,Carroll,Columbiana,Crawford,Cuyahoga,Defiance,Erie,Fulton,Geauga,Hancock,Hardin,Henry,Holmes,Huron,Lake,Logan,Lorain,Lucas,Mahoning,Marion,Medina,Mercer,Morrow,Ottawa,Paulding,Portage,Putnam,Richland,Sandusky,Seneca,Stark,Summit,Trumbull,Tuscarawas,Van Wert,Wayne,Williams,Wood,Wyandot"],
  ["Ohio", "oh-s", "Adams,Athens,Belmont,Brown,Butler,Champaign,Clark,Clermont,Clinton,Coshocton,Darke,Delaware,Fairfield,Fayette,Franklin,Gallia,Greene,Guernsey,Hamilton,Harrison,Highland,Hocking,Jackson,Jefferson,Knox,Lawrence,Licking,Madison,Meigs,Miami,Monroe,Montgomery,Morgan,Muskingum,Noble,Perry,Pickaway,Pike,Preble,Ross,Scioto,Shelby,Union,Vinton,Warren,Washington"],
  ["Michigan", "mi-s", "Berrien,Branch,Calhoun,Cass,Hillsdale,Jackson,Kalamazoo,Lenawee,Monroe,St. Joseph,Van Buren,Washtenaw,Wayne,Allegan,Barry,Eaton,Ingham,Livingston,Oakland,Macomb,St. Clair,Lapeer,Genesee,Shiawassee,Clinton,Ionia,Kent,Ottawa,Muskegon"],
  ["Michigan", "mi-c", "Mason,Lake,Osceola,Clare,Gladwin,Arenac,Huron,Tuscola,Saginaw,Bay,Midland,Isabella,Mecosta,Newaygo,Oceana,Gratiot,Montcalm,Sanilac,Iosco,Ogemaw,Roscommon,Missaukee,Wexford,Manistee,Benzie,Grand Traverse,Kalkaska,Crawford,Oscoda,Alcona,Leelanau,Antrim,Otsego,Montmorency,Alpena"],
  ["Michigan", "mi-n", "Emmet,Cheboygan,Presque Isle,Charlevoix,Chippewa,Mackinac,Luce,Schoolcraft,Alger,Delta,Menominee,Dickinson,Marquette,Iron,Baraga,Houghton,Keweenaw,Ontonagon,Gogebic"],
  ["Illinois", "il-e", "Boone,Champaign,Clark,Clay,Coles,Cook,Crawford,Cumberland,DeKalb,Douglas,DuPage,Edgar,Edwards,Effingham,Fayette,Ford,Franklin,Gallatin,Grundy,Hamilton,Hardin,Iroquois,Jasper,Jefferson,Johnson,Kane,Kankakee,Kendall,Lake,LaSalle,Lawrence,Lee,Livingston,Macon,Marion,Massac,McHenry,Moultrie,Piatt,Pope,Richland,Saline,Shelby,Vermilion,Wabash,Wayne,White,Will,Williamson"],
  ["Illinois", "il-w", "Adams,Alexander,Bond,Brown,Bureau,Calhoun,Carroll,Cass,Christian,Clinton,Fulton,Greene,Hancock,Henderson,Henry,Jackson,Jersey,Jo Daviess,Knox,Logan,Macoupin,Madison,Marshall,Mason,McDonough,McLean,Menard,Mercer,Monroe,Montgomery,Morgan,Ogle,Peoria,Perry,Pike,Pulaski,Putnam,Randolph,Rock Island,Sangamon,Schuyler,Scott,St. Clair,Stark,Stephenson,Tazewell,Union,Warren,Washington,Whiteside,Winnebago,Woodford"],
  ["Kentucky", "ky-n", "Boone,Kenton,Campbell,Pendleton,Bracken,Mason,Lewis,Greenup,Boyd,Carter,Elliott,Rowan,Fleming,Nicholas,Robertson,Harrison,Scott,Grant,Gallatin,Owen,Carroll,Trimble,Henry,Oldham,Jefferson,Shelby,Franklin,Anderson,Spencer,Bullitt,Nelson,Washington,Marion,Boyle,Mercer,Jessamine,Woodford,Fayette,Bourbon,Bath,Montgomery,Menifee,Morgan,Lawrence,Johnson,Martin,Pike,Floyd,Magoffin,Wolfe,Powell,Clark,Madison,Garrard,Lincoln,Rockcastle,Jackson,Estill,Lee,Breathitt,Knott,Letcher,Perry,Owsley,Clay"],
  ["Kentucky", "ky-s", "Hickman,Fulton,Carlisle,Ballard,McCracken,Graves,Marshall,Calloway,Livingston,Crittenden,Lyon,Trigg,Christian,Todd,Logan,Simpson,Warren,Allen,Monroe,Barren,Metcalfe,Green,Taylor,Adair,Cumberland,Clinton,Wayne,McCreary,Whitley,Knox,Bell,Harlan,Leslie,Laurel,Pulaski,Russell,Casey,Boyle,Hart,Edmonson,Butler,Ohio,Grayson,Hardin,Meade,Breckinridge,Hancock,Daviess,McLean,Muhlenberg,Hopkins,Webster,Union,Henderson,Caldwell,Hopkins,Muhlenberg"],
];

export type CountyPick = { id: string; state: string; name: string; zone: string };

export const STATE_COUNTIES: CountyPick[] = COUNTY_ZONE.flatMap(([state, zone, list]) =>
  list.split(",").map((name) => ({
    id: `cty:${zone}:${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    state,
    name: name.trim(),
    zone,
  })),
);

export function zoneById(id: string): SpZone | undefined {
  const bare = id.replace(/^sp:/, "").replace(/^cty:/, "");
  const zoneId = bare.includes(":") ? bare.split(":")[0] : bare;
  return SP_ZONES.find((z) => z.id === zoneId);
}

export function countyById(id: string): CountyPick | undefined {
  return STATE_COUNTIES.find((c) => c.id === id);
}
