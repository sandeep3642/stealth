"use client";
import React from "react";
import { useLoadScript } from "@react-google-maps/api";

export default function MapLoader({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  if (loadError) return <div style={{ padding: 16, color: "red" }}>Map load error: {String(loadError)}</div>;
  if (!isLoaded) return <div style={{ padding: 16 }}>Loading map…</div>;
  return <>{children}</>;
}
