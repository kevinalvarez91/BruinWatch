import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MyMap() {
  return (
    <MapContainer center={[34.0689, -118.4452]} zoom={15} style={{ height: "500px", width: "300%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[34.0689, -118.4452]}>
        <Popup>Hello! I'm a marker.</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MyMap;
