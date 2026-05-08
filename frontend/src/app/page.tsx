/*
Owned by Person 4
MODULE: Frontend Home Redirect
*/

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">CityZen</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Unified dashboard for reports, route intelligence, and hazard heatmaps.
        </p>
        <div className="flex gap-4">
          <Link className="rounded-md bg-indigo-600 px-5 py-3 text-white" href="/dashboard">
            Open Dashboard
          </Link>
          <Link className="rounded-md border border-slate-300 px-5 py-3" href="/map">
            Open Map
          </Link>
        </div>
      </section>
    </main>
  );
}
