import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

function HomepageMap({ incidents, highlightedIncidentId, filterStatus}) {
  const filteredIncidents = incidents.filter(incident => 
    filterStatus === "all" || (filterStatus === "resolved" ? incident.isResolved : !incident.isResolved)
  );

  return (
    <MapContainer 
      center={[34.0689, -118.4452]} 
      zoom={15} 
      style={{ height: "100%", width: "100%" }}
    >
      <MapContent incidents={filteredIncidents} highlightedIncidentId={highlightedIncidentId} />
    </MapContainer>
  );
}

function MapContent({ incidents, highlightedIncidentId }) {
  const markersRef = useRef({});
  const map = useMap();

  useEffect(() => {
    if (highlightedIncidentId) {
      const highlightedIncident = incidents.find(incident => incident.id === highlightedIncidentId);
      if (highlightedIncident) {
        const { lat, lng } = highlightedIncident;
        map.flyTo([lat, lng], 15);
        if (markersRef.current && markersRef.current[highlightedIncident.id]) {
          markersRef.current[highlightedIncident.id].openPopup();
        }
      }
    } else {
      if (markersRef.current) {
        Object.values(markersRef.current).forEach(marker => {
          if (marker) marker.closePopup();
        });
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
      <Marker
      key={incident.id || `${incident.lat}-${incident.lng}`} 
      position={[incident.lat, incident.lng]}
      ref={(el) => markersRef.current[incident.id] = el}
      >
        <Popup>
          <b>{incident.title}</b>
        </Popup>
      </Marker>
    ))}
    </>
  );
}

export default HomepageMap;
