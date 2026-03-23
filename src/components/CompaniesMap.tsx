import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import mapEurope from '@/assets/map-europe.png';

interface Company {
  id: string;
  company_name: string;
  company_type: string;
  country: string;
  fit: number;
}

interface CompaniesMapProps {
  companies: Company[];
  savedCompanies?: Set<string>;
  useSavedView?: boolean;
}

// Approximate coordinates for countries (lng, lat)
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-95.7129, 37.0902],
  'Germany': [10.4515, 51.1657],
  'China': [104.1954, 35.8617],
  'France': [2.2137, 46.2276],
  'United Kingdom': [-3.4360, 55.3781],
  'Japan': [138.2529, 36.2048],
  'Netherlands': [5.2913, 52.1326],
  'Sweden': [18.6435, 60.1282],
  'Brazil': [-51.9253, -14.2350],
  'Canada': [-106.3468, 56.1304],
  'Switzerland': [8.2275, 46.8182],
  'South Korea': [127.7669, 35.9078],
  'Italy': [12.5674, 41.8719],
  'Spain': [-3.7492, 40.4637],
  'Poland': [19.1451, 51.9194],
  'Denmark': [9.5018, 56.2639],
  'Finland': [25.7482, 61.9241],
  'Belgium': [4.4699, 50.5039],
  'Austria': [14.5501, 47.5162],
  'Norway': [8.4689, 60.4720],
};

// Map image bounds (approx lng/lat covered by the Europe map image)
const MAP_BOUNDS = {
  west: -25,
  east: 45,
  north: 72,
  south: 30,
};

// Convert lng/lat to percentage position on the map image
const lngLatToPercent = (lng: number, lat: number): { x: number; y: number } | null => {
  if (lng < MAP_BOUNDS.west || lng > MAP_BOUNDS.east || lat < MAP_BOUNDS.south || lat > MAP_BOUNDS.north) {
    return null;
  }
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;
  return { x, y };
};

export const CompaniesMap = ({ companies, savedCompanies = new Set(), useSavedView = false }: CompaniesMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(useSavedView ? 1.15 : 1.8);

  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [15, 50],
      zoom: 3.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add companies as markers
    const displayedCompanies = showSavedOnly 
      ? companies.filter(c => savedCompanies.has(c.id))
      : companies;

    const companiesByCountry = displayedCompanies.reduce((acc, company) => {
      if (!acc[company.country]) {
        acc[company.country] = [];
      }
      acc[company.country].push(company);
      return acc;
    }, {} as Record<string, Company[]>);

    Object.entries(companiesByCountry).forEach(([country, countryCompanies]) => {
      const coords = countryCoordinates[country];
      if (!coords) return;

      const avgFit = Math.round(
        countryCompanies.reduce((sum, c) => sum + c.fit, 0) / countryCompanies.length
      );

      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#94a3b8';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '9px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';
      el.textContent = countryCompanies.length.toString();

      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${country}</h3>
          <p style="margin: 2px 0; font-size: 12px;">Companies: ${countryCompanies.length}</p>
          <p style="margin: 2px 0; font-size: 12px;">Avg Fit: ${avgFit}%</p>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [companies, isTokenSet, mapboxToken, showSavedOnly, savedCompanies]);


  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  // Group companies by country for dots
  const displayedCompanies = showSavedOnly 
    ? companies.filter(c => savedCompanies.has(c.id))
    : companies;

  const companiesByCountry = displayedCompanies.reduce((acc, company) => {
    if (!acc[company.country]) acc[company.country] = [];
    acc[company.country].push(company);
    return acc;
  }, {} as Record<string, Company[]>);

  // Use mockup image
  if (!isTokenSet) {
    return (
      <div className="relative w-full h-full min-h-0 border border-border rounded-lg overflow-hidden">
        <div className="relative w-full h-full" style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center',
          transition: 'transform 0.3s ease',
        }}>
          <img 
            src={mapEurope} 
            alt="Company locations map - Europe" 
            className="w-full h-full"
            style={{ objectFit: 'fill' }}
          />
          {/* Company dots */}
          {Object.entries(companiesByCountry).map(([country, countryCompanies]) => {
            const coords = countryCoordinates[country];
            if (!coords) return null;
            const pos = lngLatToPercent(coords[0], coords[1]);
            if (!pos) return null;
            const count = countryCompanies.length;
            const size = Math.max(20, Math.min(36, 16 + count * 3));
            return (
              <div
                key={country}
                className="absolute flex items-center justify-center rounded-full bg-primary border-2 border-background shadow-md cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`${country}: ${count} companies`}
              >
                <span className="text-primary-foreground text-[9px] font-bold">{count}</span>
              </div>
            );
          })}
        </div>
        
        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-9 w-9 p-0 bg-background hover:bg-muted shadow-md border-border"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-9 w-9 p-0 bg-background hover:bg-muted shadow-md border-border"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-0 border border-border rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="h-9 w-9 p-0 bg-white hover:bg-gray-50 shadow-md border-gray-300"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="h-9 w-9 p-0 bg-white hover:bg-gray-50 shadow-md border-gray-300"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

    </div>
  );
};
