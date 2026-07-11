# System Architecture

Jal-Kavach is designed around a clean separation of layers: Presentation (React Client Components), Logic/Security (Next.js Server Actions), and Data/Services (Gemini, WeatherAPI, Maps, Firestore).

```mermaid
graph TD
  Client[React Client Components / UI] -->|Call Server Actions| Actions[Next.js Server Actions]
  Client -->|Load Map UI| MapsAPI[Google Maps JS API]
  
  subgraph Server Side (Secure Zone)
    Actions -->|Prompt Engineering| Gemini[Google Gemini SDK]
    Actions -->|Fetch Forecast & Alerts| Weather[WeatherAPI.com Client]
  end

  Client -->|Sync Data| DB[Cloud Firestore]
  Client -->|Local Fallback| LS[Browser Local Storage]
```

## Folder Layout

- `src/app/`: Next.js app pages, layouts, and server actions.
- `src/components/`: Modular client-side UI tabs (Weather, Planner, Chat, Checklist, Travel).
- `src/lib/`: Custom SDK and database initialization wrappers (Gemini, Firebase).
- `src/services/`: Weather API service query engine.
- `docs/`: Design and judge documentation (PLAN, ALIGNMENT, ARCHITECTURE, SECURITY, DEMO).
- `.env.local`: Local secret environment variables (Gitignored).
