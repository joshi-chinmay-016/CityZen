/*
OWNER: Sushanth
MODULE: Heatmap Severity Legend
*/

"use client";

import React from "react";

export default function SeverityLegend(): React.ReactElement {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/75 backdrop-blur-sm text-slate-900 text-sm shadow-md rounded-lg p-3 w-44 sm:w-48">
        <div className="font-semibold mb-2">Stress Legend</div>

        <ul className="space-y-2">
          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" aria-hidden />
            <span className="truncate">Low Stress</span>
          </li>

          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" aria-hidden />
            <span className="truncate">Medium Stress</span>
          </li>

          <li className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" aria-hidden />
            <span className="truncate">High Stress</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
