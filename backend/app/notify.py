"""Send the report via Twilio SMS or WhatsApp.

Setup required in backend/.env (see README/plan for the full walkthrough):
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN  -- from the Twilio Console
  TWILIO_SMS_FROM                        -- a purchased Twilio phone number, works immediately
  TWILIO_WHATSAPP_FROM                   -- "whatsapp:+14155238886" for the free Sandbox (dev/testing;
                                             the recipient must first send the sandbox join code to
                                             that number from WhatsApp), or your own Meta-approved
                                             WhatsApp sender for production.
"""
from app.config import get_settings

_MAX_BODY_CHARS = 1500  # keep well under SMS/WhatsApp body limits


def send_message(phone_number: str, channel: str, report_text: str) -> dict:
    s = get_settings()
    if not s.twilio_account_sid or not s.twilio_auth_token:
        return {"ok": False, "error": "Twilio is not configured on the server yet."}

    if channel not in ("sms", "whatsapp"):
        return {"ok": False, "error": "channel must be 'sms' or 'whatsapp'."}

    from_number = s.twilio_whatsapp_from if channel == "whatsapp" else s.twilio_sms_from
    if not from_number:
        return {"ok": False, "error": f"No Twilio '{channel}' sender configured on the server."}

    to = f"whatsapp:{phone_number}" if channel == "whatsapp" else phone_number
    body = report_text[:_MAX_BODY_CHARS]
    if len(report_text) > _MAX_BODY_CHARS:
        body += "\n\n(Report truncated — open the app for the full version.)"

    from twilio.base.exceptions import TwilioRestException
    from twilio.rest import Client

    client = Client(s.twilio_account_sid, s.twilio_auth_token)
    try:
        message = client.messages.create(from_=from_number, to=to, body=body)
        return {"ok": True, "sid": message.sid, "status": message.status}
    except TwilioRestException as exc:
        # 63016 / 63015-ish family: recipient hasn't joined the WhatsApp Sandbox yet.
        if channel == "whatsapp" and exc.code in (63016, 63015, 63018):
            return {
                "ok": False,
                "error": (
                    "This number hasn't joined the Twilio WhatsApp Sandbox yet. Ask the "
                    "recipient to send the sandbox's join code to the sandbox number on "
                    "WhatsApp first, then try again."
                ),
            }
        return {"ok": False, "error": f"Twilio error {exc.code}: {exc.msg}"}
