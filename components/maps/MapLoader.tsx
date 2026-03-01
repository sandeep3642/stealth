"use client";
import React from "react";
import { useLoadScript } from "@react-google-maps/api";
import {
  getGoogleMapsApiKey,
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_SCRIPT_ID,
} from "@/hooks/googleMapsConfig";

export default function MapLoader({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  if (loadError)
    return (
      <div style={{ padding: 16, color: "red" }}>
        Map load error: {String(loadError)}
      </div>
    );
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map…</div>;
  return <>{children}</>;
}
