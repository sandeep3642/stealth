"use client";

import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAP_LIBRARIES = [];

export function useGoogleMapsSdk() {
  const key =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "fleetbharat-google-map-script",
    googleMapsApiKey: key,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  return {
    isLoaded,
    loadError,
    hasApiKey: Boolean(key),
  };
}
