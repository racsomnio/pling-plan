"use client";

import { useState } from "react";
import PlacePicker, { PickedPlace } from "./PlacePicker";
import { X, Clock, StickyNote, Tag, MapPin } from "lucide-react";

export type ActivityTag = "must" | "optional" | "landmark" | "popular" | "hidden_gem";

export interface ActivityItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  time?: string;
  notes?: string;
  tags: ActivityTag[];
}

interface ActivityCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: ActivityItem) => void;
}

export default function ActivityCreator({ isOpen, onClose, onAdd }: ActivityCreatorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPlacePicker, setShowPlacePicker] = useState(false);
  const [place, setPlace] = useState<PickedPlace | null>(null);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<ActivityTag[]>([]);

  const allTags: { key: ActivityTag; label: string }[] = [
    { key: "must", label: "Must" },
    { key: "optional", label: "Optional" },
    { key: "landmark", label: "Landmark" },
    { key: "popular", label: "Popular" },
    { key: "hidden_gem", label: "Hidden gem" },
  ];

  const reset = () => {
    setStep(1);
    setPlace(null);
    setTime("");
    setNotes("");
    setTags([]);
  };

  const handleAdded = () => {
    if (!place) return;
    const activity: ActivityItem = {
      id: `${Date.now()}`,
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      time,
      notes,
      tags,
    };
    onAdd(activity);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => { reset(); onClose(); }} />

      <div className="relative w-[92vw] max-w-2xl rounded-2xl border border-white/20 bg-black/60 backdrop-blur p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold">Add Activity</h3>
          <button onClick={() => { reset(); onClose(); }} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4 text-xs text-white/60">
          <span className={`px-2 py-1 rounded-full ${step === 1 ? "bg-white/20 text-white" : "bg-white/10"}`}>Place</span>
          <span className="opacity-60">→</span>
          <span className={`px-2 py-1 rounded-full ${step === 2 ? "bg-white/20 text-white" : "bg-white/10"}`}>Details</span>
          <span className="opacity-60">→</span>
          <span className={`px-2 py-1 rounded-full ${step === 3 ? "bg-white/20 text-white" : "bg-white/10"}`}>Tags</span>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {place ? (
              <div className="rounded-lg border border-white/20 bg-white/10 p-3 text-white">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-white/70" />
                  <div>
                    <div className="font-medium">{place.name}</div>
                    {place.address && <div className="text-sm text-white/70">{place.address}</div>}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/70">Pick a place to start.</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlacePicker(true)}
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100"
              >
                Choose place
              </button>
              <button
                disabled={!place}
                onClick={() => setStep(2)}
                className="rounded-full px-4 py-2 text-sm border border-white/20 text-white bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {showPlacePicker && (
              <PlacePicker
                isOpen={showPlacePicker}
                onClose={() => setShowPlacePicker(false)}
                onConfirm={(p) => { setPlace(p); setShowPlacePicker(false); }}
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1"><Clock className="inline w-4 h-4 mr-1" /> Time</label>
              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                type="time"
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1"><StickyNote className="inline w-4 h-4 mr-1" /> Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add context, tips, reservation codes…"
                className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="rounded-full px-4 py-2 text-sm border border-white/20 text-white bg-white/10">Back</button>
              <button onClick={() => setStep(3)} className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-white/80 mb-2"><Tag className="inline w-4 h-4 mr-1" /> Tags</div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTags(prev => prev.includes(t.key) ? prev.filter(x => x !== t.key) : [...prev, t.key])}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      tags.includes(t.key)
                        ? "bg-white text-gray-900 border-white"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-full px-4 py-2 text-sm border border-white/20 text-white bg-white/10">Back</button>
              <button onClick={handleAdded} className="rounded-full px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100">Add activity</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


