/*
OWNER: Sushanth
MODULE: Heatmap Severity Legend
*/

"use client";

import React from "react";

export default function SeverityLegend(): React.ReactElement {
  return (
    <div className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
      <div className="w-44 rounded-2xl border border-white/10 bg-[#0b1220]/82 p-3 text-sm text-white shadow-xl backdrop-blur-md sm:w-48">
        <div className="mb-2 font-semibold text-white/88">Stress Legend</div>

        <ul className="space-y-2">
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" aria-hidden />
            <span className="truncate text-white/70">Low Stress</span>
          </li>

          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" aria-hidden />
            <span className="truncate text-white/70">Medium Stress</span>
          </li>

          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" aria-hidden />
            <span className="truncate text-white/70">High Stress</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
