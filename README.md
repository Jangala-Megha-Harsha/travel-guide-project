# India AI Travel Guide

An India-focused travel guide with 50 destinations, local destination image carousels, search and filters, favorites, shareable destination URLs, and AI-generated multilingual audio guides.

## Project structure

```text
TRAVEL GUIDE/
├── Backend/
│   └── app.py
├── Frontend/
│   ├── index.html
│   ├── index.js
│   ├── api-config.js
│   ├── destinations-data.js
│   ├── carousel-data.js
│   └── assets/
│       ├── images/
│       └── vendor/
├── requirements.txt
├── render.yaml
├── netlify.toml
├── .env.example
└── .gitignore
```

## Local setup

### 1. Create and activate a virtual environment

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Configure backend secrets

Copy `.env.example` to `.env` or configure the variables in your shell. Never commit `.env`.

```text
GEMINI_API_KEY=your-gemini-api-key
MURF_API_KEY=your-murf-api-key
FRONTEND_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

The backend reads environment variables directly. If using a local `.env` file, load it through your shell or a process manager; the application intentionally does not store secrets in source code.

### 3. Start the API

For local development:

```powershell
python Backend\app.py
```

For production-like local execution:

```powershell
gunicorn --chdir Backend --bind 127.0.0.1:5000 app:app
```

Gunicorn is intended for Linux deployment. On Windows, use the Flask command for local development or run Gunicorn through WSL/Docker.

### 4. Start the frontend

Serve `Frontend` with a static server rather than opening `index.html` directly:

```powershell
cd Frontend
py -m http.server 5500
```

Open `http://127.0.0.1:5500`.

Set the API URL in [api-config.js](Frontend/api-config.js):

```javascript
window.TRAVEL_GUIDE_API_URL = "http://127.0.0.1:5000";
```

## Render deployment

1. Create a Render Web Service from this repository.
2. Use the included `render.yaml`, or configure:
   - Runtime: Python
   - Root directory: `Backend`
   - Build command: `pip install -r ../requirements.txt`
   - Start command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Health check: `/health`
3. Add these Render environment variables:

```text
GEMINI_API_KEY=your-rotated-gemini-key
MURF_API_KEY=your-rotated-murf-key
FRONTEND_ORIGINS=https://your-site.netlify.app
```

4. Verify:

```text
https://your-render-service.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

## Netlify deployment

1. Create a Netlify site from this repository.
2. The included `netlify.toml` publishes the `Frontend` directory.
3. After the Render service is live, update [api-config.js](Frontend/api-config.js):

```javascript
window.TRAVEL_GUIDE_API_URL = "https://your-render-service.onrender.com";
```

4. Redeploy Netlify.
5. Add the final Netlify URL to Render's `FRONTEND_ORIGINS` variable and redeploy the API if necessary.

Do not put Gemini or Murf credentials in `api-config.js` or any frontend file.

## API

### `GET /health`

Returns a lightweight deployment health response.

### `POST /generate-audio-guide`

Request body:

```json
{
  "place": "Taj Mahal",
  "answerType": "Summary",
  "language": "English",
  "voiceId": "Matthew",
  "locale": "en-US"
}
```

The response contains the generated description and Base64 MP3 audio.

## Production checklist

- Rotate any API keys that were previously present in source code.
- Set `FRONTEND_ORIGINS` to the exact deployed Netlify URL(s).
- Confirm `/health` returns HTTP 200.
- Test audio generation with each supported language and voice.
- Test direct destination URLs such as `?place=Taj+Mahal`.
- Check browser console and Network requests after deployment.
- Confirm all local images and fonts load from Netlify.
- Confirm no `.env`, virtual environment, cache, or secret files are committed.

## Deployment status

This repository is prepared for Render and Netlify, but a live deployment is not claimed until the services are created and manually verified with the deployed URLs.
## Credential security notice

Gemini and Murf credentials previously appeared in project source text and must be treated as compromised. Revoke both keys in their official provider dashboards and generate replacement keys before deployment. Store replacement values only in the deployment environment or an untracked local `.env` file; never commit them.
