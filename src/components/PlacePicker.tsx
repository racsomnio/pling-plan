"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { X, MapPin } from "lucide-react";

export interface PickedPlace {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface PlacePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (place: PickedPlace) => void;
  apiKey?: string; // kept for maps loader
}

export default function PlacePicker({ isOpen, onClose, onConfirm, apiKey }: PlacePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; mainText: string; secondaryText: string }>>([]);
  const [picked, setPicked] = useState<PickedPlace | null>(null);

  // Load Google Maps for map rendering only
  useEffect(() => {
    if (!isOpen) return;

    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || (process.env.GOOGLE_PLACES_API_KEY as unknown as string);
    if (!key) {
      console.error("PlacePicker: Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY (or GOOGLE_PLACES_API_KEY)");
    }

    const loader = new Loader({ apiKey: key || "", version: "weekly" });
    let isCancelled = false;

    (async () => {
      await loader.load();
      if (isCancelled) return;

      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      const center = new google.maps.LatLng(37.7749, -122.4194);

      if (containerRef.current) {
        mapRef.current = new Map(containerRef.current, {
          center,
          zoom: 13,
          disableDefaultUI: true,
          gestureHandling: "greedy",
          mapId: "pling-plan-map",
        });

        markerRef.current = new google.maps.Marker({ position: center, map: mapRef.current, draggable: true });

        google.maps.event.addListener(markerRef.current, "dragend", () => {
          const pos = markerRef.current!.getPosition();
          if (!pos) return;
          setPicked((prev) => ({
            name: prev?.name || "Pinned location",
            address: prev?.address || "",
            lat: pos.lat(),
            lng: pos.lng(),
            placeId: prev?.placeId,
          }));
        });
      }

      setLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, apiKey]);

  // Autocomplete against our API route (Places API New)
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      if (!query) { setSuggestions([]); return; }
      try {
        const params = new URLSearchParams({ input: query });
        const resp = await fetch(`/api/places/autocomplete?${params.toString()}`, { signal: controller.signal });
        if (!resp.ok) return;
        const data = await resp.json();
        setSuggestions(data.suggestions || []);
      } catch {}
    };
    const t = setTimeout(run, 200);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query]);

  const selectSuggestion = async (id: string) => {
    const resp = await fetch(`/api/places/details?placeId=${encodeURIComponent(id)}`);
    if (!resp.ok) return;
    const { result } = await resp.json();
    if (!result) return;

    const loc = new google.maps.LatLng(result.lat, result.lng);
    mapRef.current?.panTo(loc);
    mapRef.current?.setZoom(15);
    markerRef.current?.setPosition(loc);

    setPicked({
      name: result.name,
      address: result.address,
      lat: result.lat,
      lng: result.lng,
      placeId: result.id,
    });

    setSuggestions([]);
    setQuery(`${result.name}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-[90vw] max-w-2xl rounded-2xl border border-white/20 bg-black/60 backdrop-blur p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold">Add Activity</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-3 relative">
          <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2">
            <MapPin className="w-4 h-4 text-white/70" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search places"
              className="w-full bg-transparent outline-none placeholder-white/60"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full rounded-lg border border-white/20 bg-black/80 backdrop-blur p-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSuggestion(s.id)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-white"
                >
                  <div className="text-sm font-medium">{s.mainText}</div>
                  {s.secondaryText && <div className="text-xs text-white/60">{s.secondaryText}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-72 w-full rounded-lg overflow-hidden border border-white/20 mb-4">
          <div ref={containerRef} className="h-full w-full" />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm border border-white/20 text-white bg-white/10 hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            disabled={!picked || loading}
            onClick={() => picked && onConfirm(picked)}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
