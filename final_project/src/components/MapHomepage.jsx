import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

function HomepageMap({ incidents, highlightedIncidentId }) {
  return (
    <MapContainer 
      center={[34.0689, -118.4452]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
    <MapContent incidents={incidents} highlightedIncidentId={highlightedIncidentId} />
    </MapContainer>
  );
}

function MapContent({ incidents, highlightedIncidentId }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    if (highlightedIncidentId) {
      const highlightedIncident = incidents.find(incident => incident.id === highlightedIncidentId);
      if (highlightedIncident) {
        const { lat, lng } = highlightedIncident;
        map.flyTo([lat, lng], 15);
        if (markersRef.current[highlightedIncident.id]) {
          markersRef.current[highlightedIncident.id].openPopup();
        }
      }
    }
  }, [highlightedIncidentId, incidents, map]);

  return (
    <>
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        maxZoom={20}
        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        attribution='&copy; Google'
      />

      {incidents.map((incident) => (
        <Marker key={incident.id} position={[incident.lat, incident.lng]}
        ref = {(el) => {markersRef.current[incident.id] = el; }}
        >
          <Popup>
            {incident.title} <br />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default HomepageMap;