"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { routeService, RouteRequest } from '@/services/routeService';
import { SingleRoute } from '@/types/route';

interface RouteContextType {
  routes: SingleRoute[];
  selectedRouteIndex: number;
  isLoading: boolean;
  error: string | null;
  sourceCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  setSourceCoords: (coords: [number, number] | null) => void;
  setDestinationCoords: (coords: [number, number] | null) => void;
  selectingField: 'none' | 'source' | 'dest';
  setSelectingField: (f: 'none' | 'source' | 'dest') => void;
  fetchSafeRoutes: (params: RouteRequest) => Promise<void>;
  selectRoute: (index: number) => void;
  resetRoute: () => void;
  // Legacy support for single route
  routeResult: { stress_score: number; safe: boolean; route: any[] } | null;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<SingleRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [selectingField, setSelectingField] = useState<'none' | 'source' | 'dest'>('none');

  const fetchSafeRoutes = useCallback(async (params: RouteRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await routeService.getSafeRoutes(params);
      
      if (data && Array.isArray(data)) {
        setRoutes(data);
        setSelectedRouteIndex(0); // Select safest route by default
      } else {
        throw new Error('Invalid route data received from server.');
      }
    } catch (err: any) {
      console.error('[RouteContext Error]:', err);
      setError(err.message || 'Failed to calculate safe routes.');
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectRoute = useCallback((index: number) => {
    if (index >= 0 && index < routes.length) {
      setSelectedRouteIndex(index);
    }
  }, [routes.length]);

  const resetRoute = useCallback(() => {
    setRoutes([]);
    setSelectedRouteIndex(0);
    setError(null);
    setIsLoading(false);
  }, []);

  // Legacy support for single route
  const routeResult = routes.length > 0 
    ? {
        stress_score: routes[selectedRouteIndex].stress_score,
        safe: routes[selectedRouteIndex].safe,
        route: routes[selectedRouteIndex].route,
      }
    : null;

  return (
    <RouteContext.Provider value={{ 
      routes,
      selectedRouteIndex,
      isLoading, 
      error, 
      sourceCoords, 
      destinationCoords, 
      setSourceCoords, 
      setDestinationCoords, 
      selectingField,
      setSelectingField,
      fetchSafeRoutes, 
      selectRoute,
      resetRoute,
      routeResult,
    }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return context;
}
