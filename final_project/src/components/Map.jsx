import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MyMap() {
  // State to store marker position
  const [position, setPosition] = useState([34.0689, -118.4452]);

  // Function to handle drag end and update position
  const handleDragEnd = (event) => {
    const newPos = event.target.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
  };

  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }} // Full height and width of the container
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={{ dragend: handleDragEnd }}
      >
        <Popup>
          Drag me around! <br /> Current position: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MyMap;