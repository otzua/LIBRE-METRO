"use client";

import { useState } from "react";
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

export default function LocationSystem({ onStationFound }: { onStationFound: (s: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nearestStation, setNearestStation] = useState<{ name: string; distance: number; isHighAccuracy: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError(null);
    setNearestStation(null);

    // 1. Fetch real dataset from public folder
    let datasetText = "";
    try {
      const response = await fetch("/stops.txt");
      if (!response.ok) throw new Error("Dataset response not ok");
      datasetText = await response.text();
    } catch (err) {
      console.error("[GEO] Failed to load dataset:", err);
      setError("Failed to load metropolitan station dataset.");
      setIsLoading(false);
      setIsModalOpen(true);
      return;
    }

    // 2. Parse CSV dataset
    const lines = datasetText.split("\n").filter(line => line.trim() !== "");
    lines.shift(); // remove headers row

    const allStations = lines.map(line => {
      const fields = line.split(",");
      return {
        name: fields[2],
        lat: parseFloat(fields[4]),
        lon: parseFloat(fields[5])
      };
    }).filter(s => !isNaN(s.lat) && !isNaN(s.lon));

    if (!navigator.geolocation) {
      setError("Location access denied or unavailable");
      setIsLoading(false);
      setIsModalOpen(true);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        const stationsWithDistances = allStations.map((station) => {
          const rawDistance = getDistance(userLat, userLon, station.lat, station.lon);
          return {
            ...station,
            distance: Number(rawDistance.toFixed(1))
          };
        });

        stationsWithDistances.sort((a, b) => a.distance - b.distance);
        const closest = stationsWithDistances[0];
        const isHighAccuracy = accuracy <= 50;

        setNearestStation({ 
          name: closest.name, 
          distance: closest.distance,
          isHighAccuracy 
        });
        
        setIsLoading(false);
        setIsModalOpen(true);
      },
      (err) => {
        console.error("[GEO Error]", err);
        setError("Location access denied");
        setIsLoading(false);
        setIsModalOpen(true);
      },
      geoOptions
    );
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
          // @ts-ignore
          station={nearestStation}
          error={error}
        />
      )}
    </>
  );
}
