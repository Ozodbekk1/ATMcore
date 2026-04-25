"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
// @ts-expect-error missing leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RegionMarker } from './page';

const createIcon = (status: string) => {
  const isOptimal = status === 'optimal';
  const isWarning = status === 'warning';
  const bgColor = isOptimal ? '#9de1b9' : isWarning ? '#fbbf24' : '#fb7185';
  const shadowColor = isOptimal ? 'rgba(157,225,185,0.6)' : isWarning ? 'rgba(251,191,36,0.6)' : 'rgba(251,113,133,0.6)';

  return L.divIcon({
    className: 'custom-atm-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${!isOptimal ? `
        <div style="
          position: absolute;
          width: 30px;
          height: 30px;
          background: ${bgColor};
          opacity: 0.3;
          border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>
        ` : ''}
        <div style="
          position: relative;
          width: 14px; 
          height: 14px; 
          background: ${bgColor}; 
          border-radius: 50%; 
          box-shadow: 0 0 15px ${shadowColor};
          border: 2px solid #061814;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MMapContainer = MapContainer as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MTileLayer = TileLayer as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MMarker = Marker as any;

function MapController({ region, onMapClick }: { region: RegionMarker | null, onMapClick: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (region) {
      map.flyTo(region.coords, 10, { duration: 1.5 });
    }
  }, [region, map]);
  useMapEvents({
    click() {
      onMapClick();
    }
  });
  return null;
}

export default function MapComponent({ markers, selectedRegion, setSelectedRegion }: { markers: RegionMarker[], selectedRegion: RegionMarker | null, setSelectedRegion: (v: RegionMarker | null) => void }) {
  // Center is roughly between Tashkent and Bukhara to fit Uzbekistan
  return (
    <div style={{ width: '100%', height: '100vh', minHeight: '600px', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MMapContainer 
        center={[41.3, 64.6]} 
        zoom={6} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%', zIndex: 0, backgroundColor: '#061814' }}
        zoomControl={false}
      >
        <MapController region={selectedRegion} onMapClick={() => setSelectedRegion(null)} />
        <MTileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomleft" />
        
        {markers.map((m) => (
          <MMarker 
            key={m.id} 
            position={m.coords} 
            icon={createIcon(m.status)}
            eventHandlers={{
              click: () => setSelectedRegion(m)
            }}
          />
        ))}
      </MMapContainer>
    </div>
  );
}
