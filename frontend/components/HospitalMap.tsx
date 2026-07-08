"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Navigation, Phone, ShieldCheck, AlertTriangle, List, Map as MapIcon } from "lucide-react";
import type { Hospital } from "@/lib/aarogyamitra";

const MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/* ── Helper: Google Maps directions link ── */
function directionsUrl(h: Hospital): string {
  if (h.latitude != null && h.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`;
}

/* ── SVG marker creator (inlined so we don't need external files) ── */
function markerIcon(color: string, scale = 1): google.maps.Symbol {
  return {
    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: scale,
    anchor: new google.maps.Point(12, 22),
  };
}

function userMarkerIcon(): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "#0f766e",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 3,
    scale: 10,
  };
}

/* ── Marker colors from design system ── */
const MARIGOLD = "#f59e0b"; // accent-500 — empanelment "confirmed"
const GRAY_TEAL = "#94a3b8"; // slate-400 — empanelment "verify"

/* ──────────────────────────────────────────────────────────────────────
   HospitalCard — one entry in the scrollable list panel
   ────────────────────────────────────────────────────────────────────── */
interface CardProps {
  hospital: Hospital;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

function HospitalCard({ hospital: h, index, isSelected, onSelect }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  const isConfirmed = h.empanelment_status === "confirmed";

  return (
    <div
      ref={cardRef}
      className={`hospital-card ${isSelected ? "hospital-card--selected" : ""}`}
      onClick={() => onSelect(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(index)}
    >
      {/* Card header: name + badge */}
      <div className="hospital-card__header">
        <h4 className="hospital-card__name">{h.name}</h4>
        {isConfirmed ? (
          <span className="trust-badge trust-badge--confirmed" title="Empanelment-specific search match">
            <ShieldCheck size={13} />
            Empanelled
          </span>
        ) : (
          <span className="trust-badge trust-badge--verify" title="Verify empanelment at hospital">
            <AlertTriangle size={13} />
            Verify
          </span>
        )}
      </div>

      {/* Address */}
      <p className="hospital-card__address">{h.address}</p>

      {/* Meta row: distance + scheme */}
      <div className="hospital-card__meta">
        {h.distance_km != null && (
          <span className="hospital-card__distance">
            <MapPin size={13} />
            {h.distance_km} km away
          </span>
        )}
        {h.scheme_name && (
          <span className="hospital-card__scheme">{h.scheme_name}</span>
        )}
      </div>

      {/* Actions */}
      <div className="hospital-card__actions">
        {h.phone && (
          <a className="hospital-card__btn" href={`tel:${h.phone}`} onClick={(e) => e.stopPropagation()}>
            <Phone size={14} /> Call
          </a>
        )}
        <a
          className="hospital-card__btn hospital-card__btn--primary"
          href={directionsUrl(h)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <Navigation size={14} /> Get Directions
        </a>
      </div>

      {/* Verify note for non-confirmed */}
      {!isConfirmed && (
        <p className="hospital-card__verify-note">
          Verify empanelment at hospital before treatment.
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   MapPanel — the Google Map with markers + info windows
   ────────────────────────────────────────────────────────────────────── */
interface MapPanelProps {
  hospitals: Hospital[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
  mapHeight?: string;
}

function MapPanel({ hospitals, userLocation, selectedIndex, onSelectIndex, mapHeight = "100%" }: MapPanelProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAP_KEY,
    id: "aarogyamitra-google-maps",
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitBounds(map, hospitals, userLocation);
    },
    [hospitals, userLocation]
  );

  // When selectedIndex changes, pan the map to that hospital
  useEffect(() => {
    if (selectedIndex == null || !mapRef.current) return;
    const h = hospitals[selectedIndex];
    if (h?.latitude != null && h?.longitude != null) {
      mapRef.current.panTo({ lat: h.latitude, lng: h.longitude });
      if ((mapRef.current.getZoom() ?? 0) < 14) {
        mapRef.current.setZoom(14);
      }
    }
  }, [selectedIndex, hospitals]);

  if (loadError) {
    return (
      <div className="hospital-map__error">
        <p>Failed to load Google Maps. Check your API key configuration.</p>
      </div>
    );
  }
  if (!isLoaded) {
    return <div className="hospital-map__loading">Loading map…</div>;
  }

  const withCoords = hospitals.filter((h) => h.latitude != null && h.longitude != null);
  if (withCoords.length === 0) return null;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: mapHeight, borderRadius: "12px" }}
      onLoad={onLoad}
      zoom={12}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {/* User location marker */}
      {userLocation && (
        <MarkerF
          position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
          icon={userMarkerIcon()}
          title="Your location"
          zIndex={1000}
        />
      )}

      {/* Hospital markers */}
      {withCoords.map((h, i) => {
        const realIndex = hospitals.indexOf(h);
        const isConfirmed = h.empanelment_status === "confirmed";
        return (
          <MarkerF
            key={i}
            position={{ lat: h.latitude!, lng: h.longitude! }}
            icon={markerIcon(isConfirmed ? MARIGOLD : GRAY_TEAL, 1.6)}
            onClick={() => onSelectIndex(realIndex)}
            zIndex={selectedIndex === realIndex ? 999 : 1}
          >
            {selectedIndex === realIndex && (
              <InfoWindowF onCloseClick={() => onSelectIndex(null)}>
                <div style={{ maxWidth: 240, fontFamily: "inherit" }}>
                  <strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
                    {h.name}
                  </strong>
                  <p style={{ fontSize: 12, color: "#475569", margin: "2px 0" }}>{h.address}</p>
                  {h.distance_km != null && (
                    <p style={{ fontSize: 12, color: "#0f766e", fontWeight: 600, margin: "4px 0" }}>
                      📍 {h.distance_km} km away
                    </p>
                  )}
                  <p style={{
                    fontSize: 11,
                    color: isConfirmed ? "#b45309" : "#64748b",
                    margin: "4px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    {isConfirmed ? "✅ Empanelment search match" : "⚠️ Verify empanelment"}
                  </p>
                  <a
                    href={directionsUrl(h)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      fontSize: 12,
                      color: "#0f766e",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Get Directions →
                  </a>
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        );
      })}
    </GoogleMap>
  );
}

/* Auto-fit map bounds to include all markers + user location */
function fitBounds(
  map: google.maps.Map,
  hospitals: Hospital[],
  userLocation: { latitude: number; longitude: number } | null
) {
  const bounds = new google.maps.LatLngBounds();
  let hasPoints = false;

  for (const h of hospitals) {
    if (h.latitude != null && h.longitude != null) {
      bounds.extend({ lat: h.latitude, lng: h.longitude });
      hasPoints = true;
    }
  }
  if (userLocation) {
    bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
    hasPoints = true;
  }

  if (hasPoints) {
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    // Prevent over-zoom on single marker
    const listener = google.maps.event.addListenerOnce(map, "idle", () => {
      if ((map.getZoom() ?? 0) > 15) map.setZoom(15);
    });
  }
}

/* ──────────────────────────────────────────────────────────────────────
   HospitalMap — the main exported component
   ────────────────────────────────────────────────────────────────────── */
export default function HospitalMap({
  hospitals,
  userLocation,
}: {
  hospitals: Hospital[];
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  /* ── Empty state ── */
  if (hospitals.length === 0) {
    return (
      <div className="card hospital-empty">
        <div className="hospital-empty__icon">
          <MapPin size={32} />
        </div>
        <h3 className="hospital-empty__title">No empanelled hospitals found</h3>
        <p className="hospital-empty__desc">
          No hospitals matching your scheme were found nearby. This may be because
          the scheme's empanelled hospital list isn't indexed yet, or there are none
          in this area.
        </p>
        <a
          className="hospital-empty__link"
          href="https://pmjay.gov.in/hospital"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check the official PM-JAY hospital portal →
        </a>
      </div>
    );
  }

  /* ── Missing API key state ── */
  if (!MAP_KEY) {
    return (
      <div className="card hospital-map-card">
        <h3 className="section-title">
          <MapPin size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          Nearby Hospitals
        </h3>
        <div className="hospital-map__key-missing">
          <AlertTriangle size={20} />
          <div>
            <strong>Google Maps API key not configured</strong>
            <p>
              Set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{" "}
              <code>frontend/.env.local</code> to show the interactive map.
              Showing list only.
            </p>
          </div>
        </div>
        {/* Still show the list without the map */}
        <div className="hospital-list-only">
          {hospitals.map((h, i) => (
            <HospitalCard
              key={i}
              hospital={h}
              index={i}
              isSelected={selectedIndex === i}
              onSelect={setSelectedIndex}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Full split-panel layout ── */
  return (
    <div className="card hospital-map-card hospital-map-card--split">
      <div className="hospital-map__header">
        <h3 className="section-title">
          <MapPin size={18} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          Nearby Hospitals
          <span className="hospital-map__count">{hospitals.length} found</span>
        </h3>
        {/* Mobile toggle */}
        <div className="hospital-map__toggle">
          <button
            className={`toggle-btn ${mobileView === "list" ? "toggle-btn--active" : ""}`}
            onClick={() => setMobileView("list")}
          >
            <List size={14} /> List
          </button>
          <button
            className={`toggle-btn ${mobileView === "map" ? "toggle-btn--active" : ""}`}
            onClick={() => setMobileView("map")}
          >
            <MapIcon size={14} /> Map
          </button>
        </div>
      </div>

      <div className="hospital-split">
        {/* List panel */}
        <div className={`hospital-split__list ${mobileView === "map" ? "hospital-split__list--hidden-mobile" : ""}`}>
          {hospitals.map((h, i) => (
            <HospitalCard
              key={i}
              hospital={h}
              index={i}
              isSelected={selectedIndex === i}
              onSelect={setSelectedIndex}
            />
          ))}
        </div>

        {/* Map panel */}
        <div className={`hospital-split__map ${mobileView === "list" ? "hospital-split__map--hidden-mobile" : ""}`}>
          <MapPanel
            hospitals={hospitals}
            userLocation={userLocation}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            mapHeight="100%"
          />
        </div>
      </div>

      <p className="hospital-disclaimer">
        ⚠️ Always verify empanelment for your specific scheme at the hospital before travelling.
        Distances are straight-line estimates.
      </p>
    </div>
  );
}
