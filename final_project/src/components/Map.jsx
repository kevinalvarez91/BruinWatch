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
          Report a Incident <br />
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default MyMap;