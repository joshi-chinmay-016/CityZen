/*
Owned by Person 1
MODULE: Map Page
*/

import Navbar from '../../components/common/Navbar';
import MapView from '../../components/map/MapView';
import UploadForm from '../../components/reports/UploadForm';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <MapView />
        </div>
        <aside className="w-96 bg-white border-l border-slate-200 p-6 overflow-y-auto">
          <UploadForm />
          <div className="mt-8">
            <h3 className="font-semibold text-slate-800 mb-4">Legend</h3>
            {/* Severity Legend */}
          </div>
        </aside>
      </main>
    </div>
  );
}
