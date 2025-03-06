import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MyMap({ onLocationSelect }) {
  // State to store marker position
  const [position, setPosition] = useState([34.0689, -118.4452]);
  const [locationName, setLocationName] = useState('Fetching location...');
  
  const fetchLocationName = async ([lat, lng]) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        let formattedLocation = data.display_name.split(', Los Angeles County')[0];
        setLocationName(formattedLocation);
        onLocationSelect({ lat, lng, location: data.display_name });
      } else {
        setLocationName('Unknown location');
        onLocationSelect({ lat, lng, location: 'Unknown location' });
      }
    } catch (error) {
      setLocationName('Error fetching location');
      onLocationSelect({ lat, lng, location: 'Error fetching location' });
    }
  };

  // When position changes, pass it to the parent component
  useEffect(() => {
    if (position) {
      fetchLocationName(position);
    }
  }, [position]);

  // Function to handle drag end and update position


  const handleDragEnd = (event) => {
    const newPos = event.target.getLatLng();
    setPosition([newPos.lat, newPos.lng]);
  };

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
          <b>Report an Incident</b> <br />
          Location: {locationName} <br />
          Coords: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </Popup>
      </Marker>

      <MapClickHandler />
    </MapContainer>
  );
}

export default MyMap;