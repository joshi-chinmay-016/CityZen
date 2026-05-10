"use client";

import { useRouteContext } from '@/context/RouteContext';

export function useSafeRoute() {
  return useRouteContext();
}
