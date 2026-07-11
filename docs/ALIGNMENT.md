# Problem Statement Alignment

| Requirement | How We Solved It | Location in Code |
| :--- | :--- | :--- |
| **Personalized Preparedness Plans** | Gemini model `gemini-1.5-flash` analyzes family size, housing type, and local weather to output custom MD plan. | [PlannerTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/PlannerTab.tsx) |
| **Weather-Aware Guidance** | Current weather, precipitation, and active storm advisories are fetched and injected into the Gemini prompt. | [actions.ts](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/app/actions.ts) |
| **Emergency Checklists** | Users can check off tasks, add new custom goals, track progress, import items from the AI Planner, and sync to Firestore. | [ChecklistTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/ChecklistTab.tsx) |
| **Travel Advisories / Routes** | Maps JavaScript API fetches driving path; Gemini analyzes safety risks along the route. | [TravelTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/TravelTab.tsx) |
| **Multilingual Assistance** | Interactive chatbot handles safety queries and translates responses to match user input language. | [ChatTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/ChatTab.tsx) |
| **Real-time Alerts** | Severe weather warnings and alerts are displayed on the weather dashboard, with warning banners displayed globally. | [WeatherTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/WeatherTab.tsx) |
| **Secure Secrets** | Private keys (Gemini, Weather API) are run strictly on Server Actions, keeping secrets hidden. | [actions.ts](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/app/actions.ts) |
| **Google Cloud Building Blocks** | Leveraging Google Gemini API and Google Maps API as the core AI/spatial components. | [gemini.ts](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/lib/gemini.ts) & [TravelTab.tsx](file:///c:/Users/Dell/OneDrive/Desktop/My%20Chapters/Main%20challenge/monsoon-app/src/components/TravelTab.tsx) |
