# RecommendTrip

A travel-recommendation web app that pairs a trained **K-Nearest Neighbors (KNN)** model with an **LLM-driven conversational layer**.

Recommendations come entirely from the ML model, so they are data-driven and explainable rather than LLM-hallucinated. Once a destination is selected, the Mistral LLM is used only for follow-up Q&A about that destination, grounded in its real dataset attributes.

> No authentication, no user accounts, no database. It is a single-session tool: fill the form, get recommendations, chat about one.

---

## Features

- **Structured preference form**: budget, preferred climate, 9 interest sliders (culture, adventure, nature, beaches, nightlife, cuisine, wellness, urban, seclusion), group size, travel month.
- **KNN recommendations**: top 5 nearest destinations from a 560-destination real-world dataset, returned with their real attributes and a match score.
- **Destination cards**: city, country, region, budget level, average temperature, description.
- **Grounded AI chat**: a chat interface scoped to the selected destination; the LLM cannot suggest or override other destinations.
- **Polished UX**: loading states, toast error notifications, empty states, responsive layout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS v4, Axios, react-router-dom, react-hot-toast |
| Backend | FastAPI, Pydantic, Uvicorn |
| ML | scikit-learn (`NearestNeighbors`), pandas, NumPy, joblib |
| LLM | Mistral API (`mistral-small-latest`) |
| Tooling | `uv` (Python), npm |

---

## Architecture

```
React (Vite)  --Axios-->  FastAPI service
                           |-- CORS middleware
                           |-- POST /recommend --> recommend_service --> KNN model (joblib)
                           '-- POST /chat      --> chat_service      --> Mistral API
```

- **Routers** handle HTTP concerns only (validation, status codes).
- **Services** hold the business logic (KNN lookup, prompt building, LLM call).
- **Schemas** (Pydantic) validate every request and response.
- The trained model, scaler, and dataset are loaded **once at startup**, not per request.

### ML pipeline

1. `preprocess.py` cleans the Kaggle CSV, averages 12 monthly temperatures into `avg_annual_temp`, and ordinal-encodes `budget_level` (Budget=0, Mid-range=1, Luxury=2).
2. `train_model.py` fits a `StandardScaler` and `NearestNeighbors` (Euclidean) on 11 features and saves both with joblib.
3. At runtime, the user's form input becomes an 11-value feature vector, is scaled, and queried against the model to get the nearest destinations.

---

## Project Structure

```
RecommendTrip/
├── frontend/
│   └── src/
│       ├── components/    # Navbar, Footer, FormSlider, DestinationCard, ChatBubble
│       ├── pages/         # LandingPage, PreferencesPage, ResultsPage, ChatPage
│       ├── services/      # recommendService.js, chatService.js (Axios)
│       ├── App.jsx
│       └── main.jsx
└── ml-service/
    └── app/
        ├── core/          # config.py (env vars)
        ├── routers/       # recommend_router.py, chat_router.py
        ├── schemas/       # recommend_schema.py, chat_schema.py
        ├── services/      # recommend_service.py, chat_service.py
        ├── ml/
        │   ├── data/              # raw + processed dataset
        │   ├── trained_model/     # knn_model.joblib, scaler.joblib
        │   ├── preprocess.py
        │   └── train_model.py
        └── main.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/recommend` | Takes structured preferences, returns the top 5 matching destinations |
| `POST` | `/chat` | Takes a destination, message, and history; returns a grounded LLM reply |

Interactive docs are available at `http://127.0.0.1:8000/docs` when the server is running.

### `POST /recommend` example

```json
{
  "budget_level": "Mid-range",
  "preferred_temp": 27,
  "culture": 2,
  "adventure": 2,
  "nature": 3,
  "beaches": 5,
  "nightlife": 3,
  "cuisine": 3,
  "wellness": 2,
  "urban": 1,
  "seclusion": 2,
  "group_size": 2,
  "preferred_month": 7
}
```

### `POST /chat` example

```json
{
  "destination": {
    "city": "Freetown",
    "country": "Sierra Leone",
    "region": "africa",
    "short_description": "Lively streets filled with vibrant markets.",
    "budget_level": "Budget",
    "avg_annual_temp": 27.4
  },
  "message": "What's the best time of year to visit?",
  "conversation_history": []
}
```

### Error codes

| Code | Meaning |
|---|---|
| 404 | `/recommend` found no matching destinations |
| 422 | Request failed Pydantic validation |
| 500 | Internal ML error, or `MISTRAL_API_KEY` is missing |
| 502 | Could not reach the Mistral API |
| 504 | Mistral API timed out |

---

## Getting Started

### Prerequisites

- Python 3.10+ and [`uv`](https://docs.astral.sh/uv/)
- Node.js 18+
- A [Mistral API key](https://console.mistral.ai/)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd RecommendTrip
```

### 2. Backend setup

```bash
cd ml-service
uv sync
```

Create `ml-service/.env`:

```
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 3. Dataset and model training

Download the **Worldwide Travel Cities (Ratings and Climate)** dataset from Kaggle and place the CSV at:

```
ml-service/app/ml/data/worldcities.csv
```

Then preprocess and train (trained `.joblib` files are gitignored, so this step is required after cloning):

```bash
uv run python app/ml/preprocess.py
uv run python app/ml/train_model.py
```

### 4. Run the backend

```bash
uv run uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### 5. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Design Decisions

- **KNN for recommendations, LLM only for chat.** Keeps results deterministic and explainable; the LLM never generates or overrides recommendations.
- **`NearestNeighbors`, not `KNeighborsClassifier`.** There are no labels; this is unsupervised similarity search.
- **`StandardScaler` before KNN.** Euclidean distance is scale-sensitive, and temperature (about -20 to 35) would otherwise dominate 1-5 interest scores.
- **Annual average temperature.** A deliberate simplicity trade-off that keeps the model static and pre-trainable.
- **Stateless backend.** Chat history lives in React state and is resent with each request.
- **Secrets stay server-side.** The Mistral key is read from `.env` and never reaches the frontend.

---

## Future Improvements

- Month-aware climate matching using the user's selected travel month
- Streaming chat responses
- Rate limiting and caching on `/chat`
- Saved trips with optional authentication and a database
- Hybrid recommendations (content-based plus collaborative filtering)
- Deployment: frontend on Vercel, API on Render or Railway

---

## Author

Made by **Lavnish Saini**.