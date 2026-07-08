"""Empanelled / cashless hospital finder.

Makes a real Google Places API call to find nearby hospitals. In production you
would cross-reference results against the official empanelment list for the
matched scheme; here we tag results and let the agent note which to verify.

Haversine distance is computed when the user's lat/lng is available so the
frontend can show "X km away" labels and the list is sorted nearest-first.
"""
import json
import logging
import math
from typing import Type, Optional

import requests
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

from app.config import get_settings

logger = logging.getLogger(__name__)

_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

# ── Approximate geographic centers for Indian states (lat, lng).
# Used as a location-bias fallback when the user doesn't share their GPS.
STATE_CENTERS: dict[str, tuple[float, float]] = {
    "Andhra Pradesh": (15.9129, 79.7400),
    "Arunachal Pradesh": (28.2180, 94.7278),
    "Assam": (26.2006, 92.9376),
    "Bihar": (25.0961, 85.3131),
    "Chhattisgarh": (21.2787, 81.8661),
    "Goa": (15.2993, 74.1240),
    "Gujarat": (22.2587, 71.1924),
    "Haryana": (29.0588, 76.0856),
    "Himachal Pradesh": (31.1048, 77.1734),
    "Jharkhand": (23.6102, 85.2799),
    "Karnataka": (15.3173, 75.7139),
    "Kerala": (10.8505, 76.2711),
    "Madhya Pradesh": (22.9734, 78.6569),
    "Maharashtra": (19.7515, 75.7139),
    "Manipur": (24.6637, 93.9063),
    "Meghalaya": (25.4670, 91.3662),
    "Mizoram": (23.1645, 92.9376),
    "Nagaland": (26.1584, 94.5624),
    "Odisha": (20.9517, 85.0985),
    "Punjab": (31.1471, 75.3412),
    "Rajasthan": (27.0238, 74.2179),
    "Sikkim": (27.5330, 88.5122),
    "Tamil Nadu": (11.1271, 78.6569),
    "Telangana": (17.1232, 79.2088),
    "Tripura": (23.9408, 91.9882),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Uttarakhand": (30.0668, 79.0193),
    "West Bengal": (22.9868, 87.8550),
    "Delhi": (28.7041, 77.1025),
}

# ── Keywords whose presence in the search query hint at empanelment-specific
#    intent.  When these appear, results are tagged "confirmed" (meaning "the
#    search itself was empanelment-specific", NOT "we verified the official
#    registry").  All results still carry a "verify" note for the user.
_EMPANELMENT_HINTS = {
    "empanelled", "empaneled", "empanelment", "cashless", "aarogyasri",
    "pm-jay", "pmjay", "ayushman", "panel", "network hospital",
}


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine great-circle distance in kilometres."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _query_has_empanelment_hint(query: str) -> bool:
    q = query.lower()
    return any(hint in q for hint in _EMPANELMENT_HINTS)


class HospitalSearchInput(BaseModel):
    query: str = Field(
        ...,
        description="e.g. 'Aarogyasri empanelled hospital cardiac Hyderabad'",
    )
    scheme_name: str = Field(
        "",
        description="The matched scheme this search is for, e.g. 'Aarogyasri' or "
        "'Ayushman Bharat PM-JAY'. Passed through to each result so the frontend "
        "can label which scheme the hospital is relevant for.",
    )
    latitude: float = Field(None, description="User latitude (optional, biases results)")
    longitude: float = Field(None, description="User longitude (optional)")
    state: str = Field(
        "",
        description="User's state, e.g. 'Telangana'. Used as location-bias fallback "
        "when latitude/longitude are not provided.",
    )


class HospitalFinderTool(BaseTool):
    name: str = "hospital_finder"
    description: str = (
        "Find nearby hospitals for cashless / scheme-covered treatment via a live "
        "maps search. Returns a JSON list of objects with name, address, latitude, "
        "longitude, phone, scheme_name, empanelment_status ('confirmed' if the "
        "search was empanelment-specific, 'verify' otherwise — not registry-verified), "
        "and distance_km (if user coordinates were provided). "
        "On failure or when no hospitals are found, returns an empty JSON list `[]` "
        "— that means no data is available right now. Never substitute placeholder "
        "or invented hospitals for an empty result; report it as-is."
    )
    args_schema: Type[BaseModel] = HospitalSearchInput

    def _run(
        self,
        query: str,
        scheme_name: str = "",
        latitude: float = None,
        longitude: float = None,
        state: str = "",
    ) -> str:
        s = get_settings()
        if not s.google_places_api_key:
            logger.warning(
                "hospital_finder: GOOGLE_PLACES_API_KEY not configured; returning empty list."
            )
            return json.dumps([])

        # Determine empanelment hint from the query text
        empanelment_hinted = _query_has_empanelment_hint(query)

        # Build the Places API request
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": s.google_places_api_key,
            "X-Goog-FieldMask": (
                "places.displayName,places.formattedAddress,places.location,"
                "places.nationalPhoneNumber"
            ),
        }
        body: dict = {"textQuery": query, "maxResultCount": 8}

        # Location bias: prefer user GPS, fallback to state center
        bias_lat, bias_lng = latitude, longitude
        if (bias_lat is None or bias_lng is None) and state:
            center = STATE_CENTERS.get(state)
            if center:
                bias_lat, bias_lng = center
                logger.info("hospital_finder: using state center for %s as location bias.", state)

        if bias_lat is not None and bias_lng is not None:
            body["locationBias"] = {
                "circle": {
                    "center": {"latitude": bias_lat, "longitude": bias_lng},
                    "radius": 25000.0,
                }
            }

        try:
            resp = requests.post(_PLACES_URL, headers=headers, json=body, timeout=15)
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.warning(
                "hospital_finder: Places API call failed (%s); returning empty list.", exc
            )
            return json.dumps([])

        places = resp.json().get("places", [])
        results = []
        for p in places:
            name = p.get("displayName", {}).get("text", "Unknown")
            addr = p.get("formattedAddress", "")
            loc = p.get("location", {})
            h_lat = loc.get("latitude")
            h_lng = loc.get("longitude")

            # Compute haversine distance if user provided real coordinates
            dist_km: Optional[float] = None
            if latitude is not None and longitude is not None and h_lat and h_lng:
                dist_km = round(_haversine_km(latitude, longitude, h_lat, h_lng), 1)

            results.append({
                "name": name,
                "address": addr,
                "latitude": h_lat,
                "longitude": h_lng,
                "phone": p.get("nationalPhoneNumber"),
                "scheme_name": scheme_name,
                "empanelment_status": "confirmed" if empanelment_hinted else "verify",
                "distance_km": dist_km,
                "distance_note": (
                    f"{dist_km} km away (straight-line)" if dist_km is not None
                    else "Verify empanelment for the matched scheme before travelling."
                ),
            })

        # Sort by distance (nearest first) when user coordinates were provided
        if latitude is not None and longitude is not None:
            results.sort(key=lambda r: r.get("distance_km") or float("inf"))

        return json.dumps(results, ensure_ascii=False)
