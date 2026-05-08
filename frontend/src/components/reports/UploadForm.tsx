/*
====================================================
OWNER: Sushanth
MODULE: Maps & Route Visualization

RESPONSIBILITIES:
- Map Rendering
- Heatmaps
- Route Visualization
- Current Location Tracking
- Report Markers
====================================================
*/

'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [type, setType] = useState('traffic');

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Report Hazard</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hazard Type</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="traffic">Traffic Jam</option>
            <option value="pothole">Pothole</option>
            <option value="safety">Safety Issue</option>
          </select>
        </div>
        <button className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors">
          Submit Report
        </button>
      </div>
    </div>
  );
}
