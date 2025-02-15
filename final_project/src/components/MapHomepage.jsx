import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This is the map that we are going to use for the homepage (no ability to report incident, just view incidents)
function HomepageMap() {
  // Array to store multiple marker positions
  const markerPositions = [ // This will have to change when implementing the database for the incident reporting
    [34.0689, -118.4452], // Marker 1
    [34.0700, -118.4440], // Marker 2
    [34.0665, -118.4465], // Marker 3
  ];

  return (
    <MapContainer 
      center={[34.0689, -118.4452]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }} // Full height and width of the container
    >
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        maxZoom={20}
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='&copy; Google'
      />

      {/* Render multiple markers */}
      {markerPositions.map((position, index) => (
        <Marker key={index} position={position}>
          <Popup>
            Incident Location {index + 1} <br />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default HomepageMap;
