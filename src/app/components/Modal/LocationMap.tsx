'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  position: [number, number];
}

export default function LocationMap({ position }: LocationMapProps) {
  if (!position || position.length !== 2) {
    return <div>Data lokasi tidak valid.</div>;
  }

  return (
    <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        // Ganti URL dan Atribusi ke Stadia OSM Bright
        url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={customMarkerIcon}>
        <Popup>Lokasi absen Anda di sini.</Popup>
      </Marker>
    </MapContainer>
  );
}