import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// This is the map that we are going to use for the homepage (no ability to report incident, just view incidents)
function HomepageMap({ incidents }) {
  return (
    <MapContainer 
      center={[34.0689, -118.4452]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        maxZoom={20}
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='&copy; Google'
      />

      {incidents.map((incident) => (
        <Marker key={incident.id} position={[incident.lat, incident.lng]}>
          <Popup>
            {incident.title} <br />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default HomepageMap;
