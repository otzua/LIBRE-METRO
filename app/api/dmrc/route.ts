import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { MetroAPI, STOPS_TO_BACKEND_MAP } from "@/lib/metro";
import {
  buildStationIndex,
  parseStopsTxt,
  resolveStationName,
  StationRecord,
} from "@/lib/station-matcher";

// ─── Singleton MetroAPI ───────────────────────────────────────────────────────
const metroApi = new MetroAPI();

// ─── Local stops.txt index (for autocomplete — instant, no backend needed) ────
let _localIndex: StationRecord[] | null = null;

async function getLocalIndex(): Promise<StationRecord[]> {
  if (_localIndex) return _localIndex;
  try {
    const filePath = path.join(process.cwd(), "public", "stops.txt");
    const csv = await readFile(filePath, "utf-8");
    _localIndex = parseStopsTxt(csv);
    console.info(`[DMRC API] Local stop index: ${_localIndex.length} stations from stops.txt`);
  } catch (err) {
    console.error("[DMRC API] Failed to read stops.txt:", err);
    _localIndex = [];
  }
  return _localIndex;
}

// ─── Backend index (for route resolution — canonical names the API accepts) ───
// Built lazily from the Netlify backend's /route/stations endpoint.
let _backendIndex: StationRecord[] | null = null;
let _backendLoading = false;
let _backendLoadPromise: Promise<StationRecord[]> | null = null;

async function getBackendIndex(): Promise<StationRecord[]> {
  if (_backendIndex) return _backendIndex;
  if (_backendLoading && _backendLoadPromise) return _backendLoadPromise;

  _backendLoading = true;
  _backendLoadPromise = (async () => {
    try {
      const names = await metroApi.getAllStations();
      _backendIndex = names.length > 0 ? buildStationIndex(names) : [];
      console.info(`[DMRC API] Backend index: ${_backendIndex.length} stations`);
    } catch (err) {
      console.error("[DMRC API] Backend index load failed:", err);
      _backendIndex = [];
    }
    _backendLoading = false;
    return _backendIndex!;
  })();

  return _backendLoadPromise;
}

/**
 * Resolve a user-supplied station name to the backend's canonical name.
 * 
 * Resolution order:
 * 1. Try fuzzy match against backend index → exact backend station name
 * 2. Try fuzzy match against local stops.txt → then map via STOPS_TO_BACKEND_MAP
 * 3. Try direct STOPS_TO_BACKEND_MAP lookup
 * 4. Fall back to raw input
 */
function resolveToBackendName(
  rawName: string,
  backendIndex: StationRecord[],
  localIndex: StationRecord[]
): string {
  // 1. Direct match against backend stations
  const backendMatch = resolveStationName(rawName, backendIndex);
  if (backendMatch) return backendMatch;

  // 2. Match against local stops.txt, then translate
  const localMatch = resolveStationName(rawName, localIndex);
  if (localMatch) {
    // Check if the stops.txt name needs translation
    const mapped = STOPS_TO_BACKEND_MAP[localMatch];
    if (mapped) return mapped;
    // The local name might already be valid for the backend
    return localMatch;
  }

  // 3. Direct map lookup
  const directMap = STOPS_TO_BACKEND_MAP[rawName.trim()];
  if (directMap) return directMap;

  // 4. Fallback
  return rawName;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    // ── /api/dmrc?type=route ────────────────────────────────────────────────
    if (type === "route") {
      const rawFrom = searchParams.get("from");
      const rawTo   = searchParams.get("to");
      const mode    = searchParams.get("mode") === "comfort" ? "comfort" : "fastest";

      if (!rawFrom || !rawTo) {
        return NextResponse.json(
          { status: 400, message: "Missing 'from' or 'to' parameters." },
          { status: 400 }
        );
      }

      const backendIndex = await getBackendIndex();
      const localIndex   = await getLocalIndex();

      const resolvedFrom = resolveToBackendName(rawFrom, backendIndex, localIndex);
      const resolvedTo   = resolveToBackendName(rawTo, backendIndex, localIndex);

      console.debug(
        `[DMRC API] route (${mode}) — from: "${rawFrom}" → "${resolvedFrom}"  |  to: "${rawTo}" → "${resolvedTo}"`
      );

      const result = await metroApi.getRoute(resolvedFrom, resolvedTo, mode);

      if (result.status !== 200) {
        if (!result.message) {
          result.message = metroApi.getErrorByCode(result.status);
        }
      }

      return NextResponse.json(result);
    }

    // ── /api/dmrc?type=stations ─────────────────────────────────────────────
    if (type === "stations") {
      // The Netlify backend doesn't support per-line queries,
      // so we return ALL stations when any line is requested.
      const stations = await metroApi.getAllStations();
      return NextResponse.json({ status: 200, stations });
    }

    // ── /api/dmrc?type=all-stations ─────────────────────────────────────────
    if (type === "all-stations") {
      // Prefer local stops.txt (faster, no network), fall back to backend
      const local = await getLocalIndex();
      if (local.length > 0) {
        const stations = local.map((s) => s.original).sort();
        return NextResponse.json({ status: 200, stations });
      }
      const stations = await metroApi.getAllStations();
      return NextResponse.json({ status: 200, stations });
    }

    // ── /api/dmrc?type=schedule ─────────────────────────────────────────────
    if (type === "schedule") {
      const stationName = searchParams.get("station");
      if (!stationName) {
        return NextResponse.json(
          { status: 400, message: "Missing 'station' parameter." },
          { status: 400 }
        );
      }

      const stopsPath = path.join(process.cwd(), "public", "stops.txt");
      const stopsCsv = await readFile(stopsPath, "utf-8");
      const stopRows = stopsCsv.split("\n").filter(Boolean).slice(1);
      
      const targetStationName = stationName.toLowerCase().trim();
      let stopId = "";
      for (const row of stopRows) {
        const cols = row.split(",");
        if (cols[2]?.toLowerCase().trim() === targetStationName) {
          stopId = cols[0];
          break;
        }
      }

      if (!stopId) {
        return NextResponse.json(
          { status: 404, message: "Station not found in database." },
          { status: 404 }
        );
      }

      const schedPath = path.join(process.cwd(), "public", "station-schedules.json");
      const schedData = JSON.parse(await readFile(schedPath, "utf-8"));
      const schedule = schedData[stopId] || [];

      return NextResponse.json({
        status: 200,
        station: stationName,
        stopId,
        schedule
      });
    }

    return NextResponse.json(
      {
        status: 400,
        message:
          "Invalid or missing 'type' parameter. Use 'route', 'stations', 'all-stations', or 'schedule'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("DMRC Proxy API Error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal Server Error while communicating with DMRC API.",
      },
      { status: 500 }
    );
  }
}
