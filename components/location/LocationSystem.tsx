"use client";

import { useState, useCallback } from "react";
import LocationButton from "./LocationButton";
import NearestMetroModal from "./NearestMetroModal";

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.pow(Math.sin(dLon / 2), 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Try high-accuracy, auto-fallback to low-accuracy if it fails
function getPositionWithFallback(): Promise<{ position: GeolocationPosition; isHigh: boolean }> {
  return new Promise((resolve, reject) => {
    // 1st attempt: high-accuracy (GPS)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ position: pos, isHigh: pos.coords.accuracy <= 50 }),
      () => {
        // 2nd attempt: low-accuracy (network/IP based) — faster & permissive
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ position: pos, isHigh: false }),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

export default function LocationSystem({ onStationFound }: { onStationFound: (s: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nearestStation, setNearestStation] = useState<{
    name: string;
    distance: number;
    accuracy: number;
    isHighAccuracy: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doLocationLookup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNearestStation(null);

    // Load stops dataset
    let datasetText = "";
    try {
      const response = await fetch("/stops.txt");
      if (!response.ok) throw new Error("Dataset not ok");
      datasetText = await response.text();
    } catch {
      setError("Failed to load station dataset. Check connection.");
      setIsLoading(false);
      setIsModalOpen(true);
      return;
    }

    // Parse CSV
    const lines = datasetText.split("\n").filter(l => l.trim() !== "");
    lines.shift();
    const allStations = lines
      .map(line => {
        const f = line.split(",");
        return { name: f[2], lat: parseFloat(f[4]), lon: parseFloat(f[5]) };
      })
      .filter(s => !isNaN(s.lat) && !isNaN(s.lon));

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      setIsModalOpen(true);
      return;
    }

    try {
      const { position, isHigh } = await getPositionWithFallback();
      const { latitude: userLat, longitude: userLon, accuracy } = position.coords;

      const sorted = allStations
        .map(s => ({ ...s, distance: Number(getDistance(userLat, userLon, s.lat, s.lon).toFixed(1)) }))
        .sort((a, b) => a.distance - b.distance);

      setNearestStation({
        name: sorted[0].name,
        distance: sorted[0].distance,
        accuracy: Math.round(accuracy),
        isHighAccuracy: isHigh,
      });
    } catch {
      setError("Location access denied. Please allow location permission and try again.");
    }

    setIsLoading(false);
    setIsModalOpen(true);
  }, []);

  const handleGetLocation = () => {
    setIsModalOpen(false);
    doLocationLookup();
  };

  return (
    <>
      <LocationButton onClick={handleGetLocation} isLoading={isLoading} />

      {isModalOpen && (
        <NearestMetroModal
          onClose={() => setIsModalOpen(false)}
          onSelect={(name) => {
            onStationFound(name);
            setIsModalOpen(false);
          }}
          onRefresh={() => {
            setIsModalOpen(false);
            // Short delay to let modal animate out before re-triggering
            setTimeout(() => doLocationLookup(), 150);
          }}
          station={nearestStation}
          error={error}
          isRefreshing={isLoading}
        />
      )}
    </>
  );
}
