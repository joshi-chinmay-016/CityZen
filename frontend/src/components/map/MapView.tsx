"use client";

/*
OWNER: Sushanth
MODULE: Dynamic Map Wrapper
*/

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
});

export default function MapView() {
  return <LeafletMap />;
}