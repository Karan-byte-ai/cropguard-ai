"use client";

import * as React from "react";
import { MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StateRiskData {
  state: string;
  risk: "high" | "medium" | "low";
  primaryDisease: string;
  cases: number;
}

interface OutbreakMapProps {
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
}

const stateData: StateRiskData[] = [
  { state: "Punjab", risk: "high", primaryDisease: "Wheat Yellow Rust", cases: 28 },
  { state: "Haryana", risk: "medium", primaryDisease: "Wheat Yellow Rust", cases: 14 },
  { state: "Maharashtra", risk: "high", primaryDisease: "Tomato Late Blight", cases: 42 },
  { state: "Uttar Pradesh", risk: "medium", primaryDisease: "Potato Early Blight", cases: 19 },
  { state: "Madhya Pradesh", risk: "medium", primaryDisease: "Soybean Rust", cases: 12 },
  { state: "Gujarat", risk: "low", primaryDisease: "Cotton Leaf Curl", cases: 6 },
  { state: "Rajasthan", risk: "low", primaryDisease: "Mustard Aphid Alert", cases: 4 },
  { state: "Himachal Pradesh", risk: "medium", primaryDisease: "Apple Scab", cases: 9 },
];

export function OutbreakMap({ selectedState, onSelectState }: OutbreakMapProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Regional Risk Index</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> High
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Low
          </span>
        </div>
      </div>

      {/* Grid of states as interactive cards */}
      <div className="grid grid-cols-2 gap-2">
        {stateData.map((item) => {
          const isSelected = selectedState === item.state;
          const bgClass =
            item.risk === "high"
              ? "border-red-500/40 bg-red-500/10 text-red-950 dark:text-red-200"
              : item.risk === "medium"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200"
              : "border-crop-500/40 bg-crop-500/10 text-crop-950 dark:text-crop-200";

          return (
            <button
              key={item.state}
              type="button"
              onClick={() => onSelectState(isSelected ? null : item.state)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${bgClass} ${
                isSelected ? "ring-2 ring-crop-600 scale-[1.02] shadow-md" : "hover:opacity-90"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs truncate">{item.state}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.risk === "high"
                      ? "bg-red-500"
                      : item.risk === "medium"
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 truncate">
                {item.primaryDisease}
              </div>
            </button>
          );
        })}
      </div>

      {selectedState && (
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground">Filtering by: <b>{selectedState}</b></span>
          <button
            onClick={() => onSelectState(null)}
            className="text-crop-700 dark:text-crop-400 underline font-semibold text-[11px]"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
