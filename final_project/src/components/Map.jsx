import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MyMap({ onLocationSelect }) {
  // State to store marker position
  const [position, setPosition] = useState([34.0689, -118.4452]);

  // When position changes, pass it to the parent component
  useEffect(() => {
    if (position && onLocationSelect) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  // Function to handle drag end and update position
  const handleDragEnd = (event) => {
    const newPos = event.target.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
  };

  // Component to handle map clicks
  function MapClickHandler() {
    useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        maxZoom={20}
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='&copy; Google'
      />

      <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={{ dragend: handleDragEnd }}
      >
        <Popup>
          Report an Incident <br />
          Coords: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Allow clicking on the map to place marker */}
      <MapClickHandler />
    </MapContainer>
  );
}

export default MyMap;