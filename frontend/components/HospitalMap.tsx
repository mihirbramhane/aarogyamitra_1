"use client";

import { useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Navigation, Phone } from "lucide-react";
import type { Hospital } from "@/lib/aarogyamitra";

const MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function directionsUrl(h: Hospital): string {
  if (h.latitude != null && h.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`;
}

function HospitalListItem({ h }: { h: Hospital }) {
  return (
    <div className="hospital-item">
      <div className="hospital-item-info">
        <strong>{h.name}</strong>
        <p>{h.address}</p>
        {h.distance_note && <p className="hospital-note">{h.distance_note}</p>}
      </div>
      <div className="hospital-item-actions">
        {h.phone && (
          <a className="btn-sm btn-teal" href={`tel:${h.phone}`}>
            <Phone size={14} /> Call
          </a>
        )}
        <a className="btn-sm btn-teal" href={directionsUrl(h)} target="_blank" rel="noopener noreferrer">
          <Navigation size={14} /> Directions
        </a>
      </div>
    </div>
  );
}

function MapView({
  hospitals,
  userLocation,
}: {
  hospitals: Hospital[];
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAP_KEY,
    id: "aarogyamitra-google-maps",
  });
  const [active, setActive] = useState<number | null>(null);

  const withCoords = hospitals.filter((h) => h.latitude != null && h.longitude != null);

  if (loadError || !isLoaded) return null;
  if (withCoords.length === 0) return null;

  const center = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : { lat: withCoords[0].latitude!, lng: withCoords[0].longitude! };

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "320px", borderRadius: "12px" }}
      center={center}
      zoom={12}
    >
      {userLocation && (
        <MarkerF
          position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
          icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
          title="You are here"
        />
      )}
      {withCoords.map((h, i) => (
        <MarkerF
          key={i}
          position={{ lat: h.latitude!, lng: h.longitude! }}
          onClick={() => setActive(i)}
        >
          {active === i && (
            <InfoWindowF onCloseClick={() => setActive(null)}>
              <div style={{ maxWidth: 200 }}>
                <strong>{h.name}</strong>
                <p style={{ fontSize: 12, margin: "4px 0" }}>{h.address}</p>
                <a href={directionsUrl(h)} target="_blank" rel="noopener noreferrer">
                  Get directions →
                </a>
              </div>
            </InfoWindowF>
          )}
        </MarkerF>
      ))}
    </GoogleMap>
  );
}

const VISIBLE_BY_DEFAULT = 3;

export default function HospitalMap({
  hospitals,
  userLocation,
}: {
  hospitals: Hospital[];
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const [showAll, setShowAll] = useState(false);

  if (hospitals.length === 0) return null;

  const visible = showAll ? hospitals : hospitals.slice(0, VISIBLE_BY_DEFAULT);
  const remaining = hospitals.length - visible.length;

  return (
    <div className="card hospital-map-card">
      <h3 className="section-title">
        <MapPin size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
        Nearby Hospitals
      </h3>
      {MAP_KEY ? (
        <MapView hospitals={hospitals} userLocation={userLocation} />
      ) : (
        <p className="section-desc">
          (Map unavailable — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show pins. Showing list below.)
        </p>
      )}
      <div className="hospital-list">
        {visible.map((h, i) => (
          <HospitalListItem key={i} h={h} />
        ))}
      </div>
      {remaining > 0 && (
        <button type="button" className="btn-ghost hospital-show-more" onClick={() => setShowAll(true)}>
          Show {remaining} more
        </button>
      )}
      <p className="hospital-disclaimer">⚠️ Always verify empanelment for your scheme before travelling.</p>
    </div>
  );
}
