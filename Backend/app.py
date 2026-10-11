import base64
import os
import tempfile

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai

app = Flask(__name__)
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500,"
        "https://megha-harsha-travel-guide-levelx.netlify.app,"
        "https://megha-harsha-ttsp-levelx.netlify.app",
    ).split(",")
    if origin.strip()
]
CORS(
    app,
    resources={r"/*": {"origins": allowed_origins}},
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

MURF_API_KEY = os.getenv("MURF_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


class MurfAPIError(Exception):
    def __init__(self, status_code, provider_message):
        self.status_code = status_code
        self.provider_message = provider_message
        super().__init__(provider_message)

PROMPTS = {
    "Summary": """
You are a professional tourist guide.
Provide a high-level overview of "{place}" in {language}.

Focus on:
- The historical significance
- Why the place is famous
- Key architectural or cultural highlights

Keep the explanation concise, engaging, and easy to follow.
Avoid excessive details and dates.
Limit the response to around 200 words.

Respond ONLY in {language}.
""",

    "Detailed": """
You are a professional tourist guide.
Provide a detailed and immersive explanation of "{place}" in {language}.

Cover:
- Historical background and timeline
- Architectural design and unique features
- Cultural importance and notable events
- Interesting facts and visitor insights

Explain concepts clearly and in a storytelling manner.
Include relevant details and examples to create a rich experience.
Limit the response to around 400 words.

Respond ONLY in {language}.
"""
}


def get_gemini_client():
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=GEMINI_API_KEY)


def generate_speech(text, voice_id, locale):
    if not MURF_API_KEY:
        raise RuntimeError("MURF_API_KEY is not configured")

    temp_audio = None
    try:
        response = requests.post(
            "https://api.murf.ai/v1/speech/stream",
            headers={
                "api-key": MURF_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "voice_id": voice_id,
                "text": text,
                "locale": locale,
                "model": "falcon-2",
                "format": "MP3",
                "sampleRate": 24000,
                "channelType": "MONO",
            },
            timeout=120,
        )
        if not response.ok:
            provider_message = "Murf rejected the audio request"
            try:
                error_data = response.json()
                provider_message = (
                    error_data.get("message")
                    or error_data.get("error")
                    or provider_message
                )
            except ValueError:
                pass
            raise MurfAPIError(response.status_code, str(provider_message)[:300])

        temp_audio = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
        temp_audio.close()
        with open(temp_audio.name, "wb") as audio_file:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    audio_file.write(chunk)
        if os.path.getsize(temp_audio.name) == 0:
            raise MurfAPIError(502, "Murf returned an empty audio response")
        return temp_audio
    except Exception:
        if temp_audio and os.path.exists(temp_audio.name):
            os.unlink(temp_audio.name)
        raise



def generate_description(place, answer_type, language):
    if answer_type not in PROMPTS:
        raise ValueError("answerType must be Summary or Detailed")

    prompt = PROMPTS[answer_type].format(
        place=place,
        language=language
    )

    client = get_gemini_client()

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text



@app.get("/health")
def health():
    return {"status": "ok"}


@app.route("/generate-audio-guide", methods=["POST"])
def generate_audio_guide():
    data = request.get_json(silent=True) or {}
    required_fields = ("place", "answerType", "language", "voiceId", "locale")
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    audio_path = None
    try:
        app.logger.info(
            "Audio guide request place=%r answerType=%s language=%s voiceId=%s locale=%s",
            data["place"],
            data["answerType"],
            data["language"],
            data["voiceId"],
            data["locale"],
        )
        text_description = generate_description(
            data["place"],
            data["answerType"],
            data["language"],
        )
        audio_path = generate_speech(
            text_description,
            data["voiceId"],
            data["locale"],
        )
        with open(audio_path.name, "rb") as audio_file:
            encoded_audio = base64.b64encode(audio_file.read()).decode("utf-8")
        if not encoded_audio:
            raise MurfAPIError(502, "Murf returned no audio data")
        return jsonify({
            "description": text_description,
            "audioBase64": encoded_audio,
        })
    except MurfAPIError as error:
        app.logger.error(
            "Murf API failed status=%s message=%s",
            error.status_code,
            error.provider_message,
        )
        return jsonify({
            "error": error.provider_message,
            "source": "murf",
        }), 502
    except (RuntimeError, ValueError) as error:
        app.logger.exception("Audio guide configuration or validation error")
        return jsonify({"error": str(error)}), 400
    except requests.RequestException as error:
        app.logger.error(
            "Murf API network failure type=%s message=%s",
            type(error).__name__,
            str(error)[:300],
        )
        return jsonify({
            "error": "Audio provider could not be reached. Please try again.",
            "source": "murf",
        }), 502
    except Exception:
        app.logger.exception("Audio guide generation failed")
        return jsonify({"error": "Unable to generate the audio guide"}), 500
    finally:
        if audio_path and os.path.exists(audio_path.name):
            os.unlink(audio_path.name)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")))