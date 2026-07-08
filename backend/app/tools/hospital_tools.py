"""Empanelled / cashless hospital finder.

Makes a real Google Places API call to find nearby hospitals. In production you
would cross-reference results against the official empanelment list for the
matched scheme; here we tag results and let the agent note which to verify.
"""
import json
import logging
from typing import Type

import requests
from pydantic import BaseModel, Field
from crewai.tools import BaseTool

from app.config import get_settings

logger = logging.getLogger(__name__)

_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"


class HospitalSearchInput(BaseModel):
    query: str = Field(..., description="e.g. 'Aarogyasri empanelled hospital cardiac Hyderabad'")
    latitude: float = Field(None, description="User latitude (optional, biases results)")
    longitude: float = Field(None, description="User longitude (optional)")


class HospitalFinderTool(BaseTool):
    name: str = "hospital_finder"
    description: str = (
        "Find nearby hospitals for cashless / scheme-covered treatment via a live "
        "maps search. Returns a JSON list of objects with name, address, latitude, "
        "longitude and phone (verify empanelment before relying on any result). "
        "On failure or when no hospitals are found, returns an empty JSON list `[]` "
        "— that means no data is available right now. Never substitute placeholder "
        "or invented hospitals for an empty result; report it as-is."
    )
    args_schema: Type[BaseModel] = HospitalSearchInput

    def _run(self, query: str, latitude: float = None, longitude: float = None) -> str:
        s = get_settings()
        if not s.google_places_api_key:
            logger.warning("hospital_finder: GOOGLE_PLACES_API_KEY not configured; returning empty list.")
            return json.dumps([])

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": s.google_places_api_key,
            "X-Goog-FieldMask": (
                "places.displayName,places.formattedAddress,places.location,"
                "places.nationalPhoneNumber"
            ),
        }
        body = {"textQuery": query, "maxResultCount": 6}
        if latitude is not None and longitude is not None:
            body["locationBias"] = {
                "circle": {
                    "center": {"latitude": latitude, "longitude": longitude},
                    "radius": 15000.0,
                }
            }
        try:
            resp = requests.post(_PLACES_URL, headers=headers, json=body, timeout=15)
            resp.raise_for_status()
        except requests.RequestException as exc:
            logger.warning("hospital_finder: Places API call failed (%s); returning empty list.", exc)
            return json.dumps([])

        places = resp.json().get("places", [])
        results = []
        for p in places:
            name = p.get("displayName", {}).get("text", "Unknown")
            addr = p.get("formattedAddress", "")
            loc = p.get("location", {})
            results.append({
                "name": name,
                "address": addr,
                "latitude": loc.get("latitude"),
                "longitude": loc.get("longitude"),
                "phone": p.get("nationalPhoneNumber"),
                "distance_note": "Verify empanelment for the matched scheme before travelling.",
            })
        return json.dumps(results, ensure_ascii=False)
