/**
 * Delhi Metro Line definitions.
 * Each line maps to a set of stop_id values from public/stops.txt.
 * IDs are derived from the sequential structure of that file.
 */

export interface MetroLine {
  id: string;
  name: string;
  color: string;       // hex
  stopIds: number[];   // stop_id values from stops.txt, in order
}

export const METRO_LINES: MetroLine[] = [
  {
    id: "red",
    name: "Red Line",
    color: "#E53935",
    stopIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
  },
  {
    id: "green",
    name: "Green Line",
    color: "#388E3C",
    stopIds: [22,23,24,25,26,27,28,29,30,31,32,33,34,35,13],
  },
  {
    id: "yellow",
    name: "Yellow Line",
    color: "#FDD835",
    stopIds: [36,37,38,39,41,42,43,44,45,40,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71],
  },
  {
    id: "blue",
    name: "Blue Line",
    color: "#1E88E5",
    stopIds: [72,73,74,75,76,77,78,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121],
  },
  {
    id: "blue-branch",
    name: "Blue Line Branch",
    color: "#1E88E5",
    stopIds: [79,80,81,82,83,84,85,86,87],
  },
  {
    id: "violet",
    name: "Violet Line",
    color: "#7B1FA2",
    stopIds: [8,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,159,160,158,157],
  },
  {
    id: "orange",
    name: "Airport Express",
    color: "#EF6C00",
    stopIds: [154,155,156,157],
  },
  {
    id: "pink",
    name: "Pink Line",
    color: "#EC407A",
    stopIds: [173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,204,205,206,127,221,222,223,224,161,162,163,164,165,166,167],
  },
  {
    id: "magenta",
    name: "Magenta Line",
    color: "#CC0066",
    stopIds: [108,195,193,192,181,182,183,184,185,186,187,188,189,190,191,166,167,131,168,169,170,171,172],
  },
  {
    id: "grey",
    name: "Grey Line",
    color: "#757575",
    stopIds: [239,240,241],
  },
  {
    id: "aqua",
    name: "Aqua Line",
    color: "#00ACC1",
    stopIds: [500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519],
  },
  {
    id: "green-2",
    name: "Green Line 2",
    color: "#00897B",
    stopIds: [207,208,209,210,211,212,213,214,215,216,217,218],
  },
  {
    id: "silver",
    name: "Silver Line (RapidMetro)",
    color: "#90A4AE",
    stopIds: [148,149,150,151,152,153],
  },
];

// Fast lookup: stop name+coords by ID
export type StopCoord = { id: number; name: string; lat: number; lon: number };

/**
 * Load all stop coords from stops.txt at runtime (client only).
 * Returns a Map<id, StopCoord>.
 */
export async function loadStopCoords(): Promise<Map<number, StopCoord>> {
  const res = await fetch("/stops.txt");
  const text = await res.text();
  const map = new Map<number, StopCoord>();
  const rows = text.split("\n").filter(l => l.trim()).slice(1);
  for (const row of rows) {
    const p = row.split(",");
    const id = parseInt(p[0]);
    const name = p[2]?.trim();
    const lat = parseFloat(p[4]);
    const lon = parseFloat(p[5]);
    if (!isNaN(id) && !isNaN(lat) && !isNaN(lon)) {
      map.set(id, { id, name, lat, lon });
    }
  }
  return map;
}
