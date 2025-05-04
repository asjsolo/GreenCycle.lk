import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import redMarker from "../images/location_red.png"; // Path to your red marker icon

const redIcon = new L.Icon({
  iconUrl: redMarker,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

async function geocodeAddress(address) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }
  return null;
}

const RecyclingMapPage = () => {
  const [centers, setCenters] = useState([]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/RecyclingCenters")
      .then((res) => res.json())
      .then(async (data) => {
        const centersData = data.recyclingCenters || [];
        setCenters(centersData);
        const geocoded = await Promise.all(
          centersData.map(async (center) => {
            const coords = await geocodeAddress(center.location);
            return coords ? { ...center, ...coords } : null;
          })
        );
        setMarkers(geocoded.filter(Boolean));
      });
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h2 style={{ textAlign: "center" }}>Recycling Centers Map</h2>
      <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "90vh", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers.map((center, idx) => (
          <Marker key={idx} position={[center.lat, center.lng]} icon={redIcon}>
            <Popup>
              <b>{center.centerName}</b><br />
              {center.location}<br />
              {center.contactNumber}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RecyclingMapPage;
