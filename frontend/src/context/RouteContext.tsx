"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { routeService, RouteRequest, SafeRouteResponse } from '@/services/routeService';

interface RouteContextType {
  routeResult: SafeRouteResponse | null;
  isLoading: boolean;
  error: string | null;
  sourceCoords: [number, number] | null;
  destinationCoords: [number, number] | null;
  selectedRouteIndex: number;
  setSelectedRouteIndex: (index: number) => void;
  setSourceCoords: (coords: [number, number] | null) => void;
  setDestinationCoords: (coords: [number, number] | null) => void;
  selectingField: 'none' | 'source' | 'dest';
  setSelectingField: (f: 'none' | 'source' | 'dest') => void;
  fetchSafeRoute: (params: RouteRequest) => Promise<void>;
  resetRoute: () => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routeResult, setRouteResult] = useState<SafeRouteResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [selectingField, setSelectingField] = useState<'none' | 'source' | 'dest'>('none');
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const fetchSafeRoute = useCallback(async (params: RouteRequest) => {
    setIsLoading(true);
    setError(null);
    setSelectedRouteIndex(0); // Reset selection on new fetch
    try {
      const data = await routeService.getSafeRoute(params);
      
      if (data && Array.isArray(data.route)) {
        setRouteResult(data);
      } else {
        throw new Error('Invalid route data received from server.');
      }
    } catch (err: any) {
      console.error('[RouteContext Error]:', err);
      setError(err.message || 'Failed to calculate safe route.');
      setRouteResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetRoute = useCallback(() => {
    setRouteResult(null);
    setError(null);
    setIsLoading(false);
    setSelectedRouteIndex(0);
  }, []);

  return (
    <RouteContext.Provider value={{ 
      routeResult, 
      isLoading, 
      error, 
      sourceCoords, 
      destinationCoords, 
      selectedRouteIndex,
      setSelectedRouteIndex,
      setSourceCoords, 
      setDestinationCoords, 
      selectingField,
      setSelectingField,
      fetchSafeRoute, 
      resetRoute 
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
