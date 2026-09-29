# Skyora - Intelligent Personalized Homepage (SIH PS 26076)

## Problem & Solution
Today, India's national weather app (**India Meteorological Department - IMD**) delivers the exact same generic dashboard to every citizen regardless of their routine, commute, or health considerations.

**Skyora Personalization Layer** solves this with an explainable, on-device intelligence engine:
```
GENERIC METEOROLOGICAL RADAR DATA
              ↓
      USER CONTEXT & ROUTINE
              ↓
   PERSONALIZATION ENGINE (Pure JS)
              ↓
  RELEVANT METEOROLOGICAL SIGNALS
              ↓
   DYNAMIC PERSONALIZED HOMEPAGE
              ↓
    CLEAR ACTIONABLE RECOMMENDATION
```

---

## 🌟 Demo Verification (Same Weather, Visibly Different Output)

You can live-switch between 3 pre-seeded demo personas using the top-bar dropdown or the **/test-personas** screen:

1. **Aarav Mehta · Runner (Mumbai, 28°C, Rain 70%):**
   - **Engine output:** Identifies that evening monsoon rain spikes to 75% after 6:00 PM.
   - **Actionable advice:** Prioritizes the **5:00 PM – 6:00 PM dry window** (25% rain chance) so he can complete his workout before the downpour.
   - **Card sequence:** Hero Weather → Dry Running Window Alert → Running Suitability Factor Matrix → Hourly Rain Curve.

2. **Neha Sharma · Commuter (Mumbai, 28°C, Rain 70%):**
   - **Engine output:** Correlates Mumbai coastal warning with her 6:00 PM – 7:00 PM Western Express Highway commute.
   - **Actionable advice:** Advises departing by **5:45 PM** before visibility drops and arterial junctions experience waterlogging delays.
   - **Card sequence:** Hero Weather → Commuter Road Visibility Warning → Driving Traction Breakdown.

3. **Rahul Varma · Traveller (Delhi Destination, 32°C, Rain 60%):**
   - **Engine output:** Triggers destination alert for Delhi's active IMD Yellow Watch (thundershowers and 40 km/h wind gusts).
   - **Actionable advice:** Provides flight delay warnings and an automated packing checklist (breathable fabrics + rain shell).

---

## 🏗️ Architecture & Pure JS Personalization Engine

- **`src/engine/rank.ts`:** Pure JavaScript module (zero React dependencies). Takes `(profile, weather, now, feedback, mode)` and produces a strictly prioritized array of card descriptors with slot designations (`hero`, `primary`, `chart`, `secondary`, `sidebar`).
- **`src/engine/suitability.ts`:** Explainable suitability scoring across Running, Cycling, Driving, Travelling, Farming, Sports, and Outdoor Work. Never a black box: breaks down temperature, rain probability, wind, visibility, and AQI with human-readable rationale.
- **`src/engine/timeFinder.ts`:** Contiguous time-window scanner across 24 hours of radar data to discover dry and mild activity slots.
- **`src/engine/alerts.ts`:** Statutory IMD Severe Alert processor (Orange & Red warnings receive priority override) + personalized routine impact alerts.
- **`src/engine/recommendations.ts`:** Synthesizes the core "What this means for you" actionable takeaway.
- **`src/services/askSkyora.ts`:** Contextual conversational assistant grounded in the user's active routine and IMD observations.
- **`src/store/useAppStore.ts`:** Zustand persistent store on localStorage with 100% on-device privacy.

---

## 📱 12 Complete Screens & Modules

1. **Personalized Home (`/`):** Dynamic slot-based layout controlled exclusively by the engine. Features greeting, temperature, actionable takeaway, dual-axis hourly SVG chart, activity conditions, and thumbs up/down feedback.
2. **Weather Details (`/weather-details`):** 24-hour hourly curve and table, 7-day outlook, solar arc, and air quality parameters.
3. **Activity Conditions (`/activities`):** Good/Moderate/Poor ratings with per-factor explanations and better times today.
4. **Smart Time Finder (`/time-finder`):** Activity, duration, and day scanner with a 24-hour visual suitability timeline and "Use this time" action.
5. **Ask Skyora AI (`/ask-skyora`):** Grounded assistant chat with suggested questions, typing simulation, and "What Skyora knows about you" context inspector.
6. **Alerts & Warnings (`/alerts`):** Official IMD bulletins with original warning text alongside plain "What this means" explanations and personalized alerts.
7. **Personal Habits (`/habits`):** Transparent behavioral pattern insights derived from interactions and feedback.
8. **Saved Locations (`/locations`):** Geographic hub management (Home, Work, Farm, Destination) with purposeful usage mapping.
9. **Profile & Preferences (`/profile`):** Explicit ("You told us") vs Inferred ("We noticed") preferences side-by-side, plus data reset and purge.
10. **Test Personas (`/test-personas`):** 3-column comparative view proving the core SIH objective.
11. **Welcome Splash (`/welcome`):** Clean product positioning and feature breakdown.
12. **Sign In (`/login`):** Local profile authentication with one-click demo login buttons.
13. **Onboarding Setup (`/onboarding`):** 4-step wizard with real-time live preview of the generated homepage.
