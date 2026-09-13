import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Component to recenter map when lat/lng change from outside
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const LocationPickerMap = ({ lat, lng, onLocationSelect }) => {
  const defaultCenter = [28.6692, 77.4538];
  const position = (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) ? [parseFloat(lat), parseFloat(lng)] : null;
  const center = position || defaultCenter;

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-64 w-full relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {position && <Marker position={position} icon={customIcon} />}
        {position && <MapRecenter lat={position[0]} lng={position[1]} />}
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600 border border-slate-200 z-[1000] shadow-sm">
        💡 Click map to set exact GPS pin
      </div>
    </div>
  );
};

export default LocationPickerMap;
