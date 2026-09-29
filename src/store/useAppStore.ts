import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, ActivityType, TemperatureUnit, CardFeedback, UserInteraction } from '../types';

// Preset personas for immediate live evaluation
export const DEMO_PERSONAS: Record<string, UserProfile> = {
  aarav: {
    id: 'persona-aarav',
    name: 'Aarav Mehta',
    units: 'C',
    primaryActivity: 'Running',
    selectedActivities: ['Running', 'Cycling', 'Outdoor work'],
    locations: [
      { id: 'loc-1', name: 'Mumbai', state: 'Maharashtra', type: 'Home', lat: 19.076, lon: 72.8777, isPrimary: true },
      { id: 'loc-2', name: 'Pune', state: 'Maharashtra', type: 'Travel destination', lat: 18.5204, lon: 73.8567 },
    ],
    activeLocationId: 'loc-1',
    preferences: {
      preferredTimeOfDay: 'evening',
      commuteWindow: { startHour: 9, endHour: 10 },
      activityWindow: { activity: 'Running', startHour: 18, endHour: 19 },
      notificationsEnabled: true,
      rainThresholdSensitivity: 'high',
    },
    inferredPreferences: {
      frequentActivity: 'Running',
      checkedPeakHours: [7, 17, 18],
      dislikedCardTypes: [],
      travelIntent: false,
    },
  },
  neha: {
    id: 'persona-neha',
    name: 'Neha Sharma',
    units: 'C',
    primaryActivity: 'Driving',
    selectedActivities: ['Driving', 'Family', 'General'],
    locations: [
      { id: 'loc-1', name: 'Mumbai', state: 'Maharashtra', type: 'Home', lat: 19.076, lon: 72.8777, isPrimary: true },
      { id: 'loc-3', name: 'Bandra Kurla Complex', state: 'Maharashtra', type: 'Work', lat: 19.066, lon: 72.868 },
    ],
    activeLocationId: 'loc-1',
    preferences: {
      preferredTimeOfDay: 'evening',
      commuteWindow: { startHour: 18, endHour: 19 },
      activityWindow: { activity: 'Driving', startHour: 18, endHour: 19 },
      notificationsEnabled: true,
      rainThresholdSensitivity: 'moderate',
    },
    inferredPreferences: {
      frequentActivity: 'Driving',
      checkedPeakHours: [8, 17, 19],
      dislikedCardTypes: [],
      travelIntent: false,
    },
  },
  rahul: {
    id: 'persona-rahul',
    name: 'Rahul Varma',
    units: 'C',
    primaryActivity: 'Travelling',
    selectedActivities: ['Travelling', 'Sports', 'General'],
    locations: [
      { id: 'loc-delhi', name: 'Delhi', state: 'Delhi NCR', type: 'Travel destination', lat: 28.6139, lon: 77.209, isPrimary: true },
      { id: 'loc-mum', name: 'Mumbai', state: 'Maharashtra', type: 'Home', lat: 19.076, lon: 72.8777 },
      { id: 'loc-lon', name: 'London', state: 'Greater London', type: 'Travel destination', lat: 51.5074, lon: -0.1278 },
    ],
    activeLocationId: 'loc-delhi',
    preferences: {
      preferredTimeOfDay: 'morning',
      commuteWindow: { startHour: 8, endHour: 9 },
      activityWindow: { activity: 'Travelling', startHour: 10, endHour: 18 },
      notificationsEnabled: true,
      rainThresholdSensitivity: 'moderate',
    },
    inferredPreferences: {
      frequentActivity: 'Travelling',
      checkedPeakHours: [9, 14, 20],
      dislikedCardTypes: [],
      travelIntent: true,
    },
  },
};

interface AppState {
  profile: UserProfile;
  activePersonaId: 'aarav' | 'neha' | 'rahul' | 'custom';
  simulatedHour: number; // 0-23 (default 17:30 = 17)
  activeModeOverride?: ActivityType;
  feedbacks: CardFeedback[];
  interactions: UserInteraction[];
  hasCompletedOnboarding: boolean;

  // Actions
  setPersona: (personaKey: 'aarav' | 'neha' | 'rahul') => void;
  setModeOverride: (mode?: ActivityType) => void;
  setSimulatedHour: (hour: number) => void;
  setActiveLocation: (locationId: string) => void;
  setCityDirectly: (cityName: string) => void;
  submitFeedback: (cardId: string, cardType: string, vote: 'up' | 'down') => void;
  logInteraction: (type: UserInteraction['type'], target: string) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  toggleActivity: (activity: ActivityType) => void;
  setUnits: (unit: TemperatureUnit) => void;
  resetPersonalization: () => void;
  deleteUserData: () => void;
  completeOnboarding: (newProfile: UserProfile) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: DEMO_PERSONAS.aarav,
      activePersonaId: 'aarav',
      simulatedHour: 17, // default to 5:30 PM evening demo
      activeModeOverride: undefined,
      feedbacks: [],
      interactions: [
        { id: 'i-1', type: 'view_screen', target: 'home', timestamp: Date.now() - 3600000 * 2, hourOfDay: 17 },
        { id: 'i-2', type: 'view_screen', target: 'activities', targetName: 'Running', timestamp: Date.now() - 3600000, hourOfDay: 17 } as any,
      ],
      hasCompletedOnboarding: true,

      setPersona: (personaKey) => {
        const persona = DEMO_PERSONAS[personaKey];
        if (persona) {
          set({
            profile: JSON.parse(JSON.stringify(persona)),
            activePersonaId: personaKey,
            activeModeOverride: undefined,
          });
          get().logInteraction('switch_mode', `persona_${personaKey}`);
        }
      },

      setModeOverride: (mode) => {
        set({ activeModeOverride: mode });
        if (mode) {
          get().logInteraction('switch_mode', mode);
        }
      },

      setSimulatedHour: (hour) => {
        set({ simulatedHour: hour });
        get().logInteraction('switch_mode', `time_${hour}h`);
      },

      setActiveLocation: (locationId) => {
        set((state) => ({
          profile: {
            ...state.profile,
            activeLocationId: locationId,
          },
        }));
        get().logInteraction('click_card', `location_${locationId}`);
      },

      setCityDirectly: (cityName) => {
        set((state) => {
          const existing = state.profile.locations.find(
            (l) => l.name.toLowerCase() === cityName.toLowerCase()
          );
          if (existing) {
            return {
              profile: {
                ...state.profile,
                activeLocationId: existing.id,
              },
            };
          } else {
            const newLoc = {
              id: `loc-${Date.now()}`,
              name: cityName,
              state: 'Region',
              type: 'Travel destination' as const,
              lat: 20,
              lon: 75,
            };
            return {
              profile: {
                ...state.profile,
                locations: [...state.profile.locations, newLoc],
                activeLocationId: newLoc.id,
              },
            };
          }
        });
      },

      submitFeedback: (cardId, cardType, vote) => {
        set((state) => {
          // Remove existing feedback for same card if re-voted
          const filtered = state.feedbacks.filter((f) => f.cardId !== cardId);
          return {
            feedbacks: [
              ...filtered,
              { cardId, cardType, vote, timestamp: Date.now() },
            ],
          };
        });
        get().logInteraction('click_card', `feedback_${vote}_${cardType}`);
      },

      logInteraction: (type, target) => {
        set((state) => ({
          interactions: [
            ...state.interactions.slice(-40), // keep last 40
            {
              id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              type,
              target,
              timestamp: Date.now(),
              hourOfDay: new Date().getHours(),
            },
          ],
        }));
      },

      updateProfile: (partial) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...partial,
          },
          activePersonaId: 'custom',
        }));
      },

      toggleActivity: (activity) => {
        set((state) => {
          const list = [...state.profile.selectedActivities];
          const idx = list.indexOf(activity);
          if (idx >= 0) {
            if (list.length > 1) list.splice(idx, 1);
          } else {
            list.push(activity);
          }
          return {
            profile: {
              ...state.profile,
              selectedActivities: list,
              primaryActivity: list[0] || state.profile.primaryActivity,
            },
            activePersonaId: 'custom',
          };
        });
      },

      setUnits: (unit) => {
        set((state) => ({
          profile: {
            ...state.profile,
            units: unit,
          },
        }));
      },

      resetPersonalization: () => {
        set({
          profile: JSON.parse(JSON.stringify(DEMO_PERSONAS.aarav)),
          activePersonaId: 'aarav',
          activeModeOverride: undefined,
          feedbacks: [],
          interactions: [],
          simulatedHour: 17,
        });
      },

      deleteUserData: () => {
        localStorage.clear();
        set({
          profile: JSON.parse(JSON.stringify(DEMO_PERSONAS.aarav)),
          activePersonaId: 'aarav',
          feedbacks: [],
          interactions: [],
          hasCompletedOnboarding: false,
        });
      },

      completeOnboarding: (newProfile) => {
        set({
          profile: newProfile,
          activePersonaId: 'custom',
          hasCompletedOnboarding: true,
        });
      },
    }),
    {
      name: 'skyora-app-storage',
    }
  )
);
