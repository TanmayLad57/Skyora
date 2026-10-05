import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  getUserPreferences,
  saveUserPreferences,
  parseTimeToHour,
} from '../services/preferencesService';
import { getLocations, createLocation } from '../services/locationsService';
import { getFeedback } from '../services/feedbackService';
import { getInteractions } from '../services/interactionsService';
import { useAppStore } from '../store/useAppStore';
import { ActivityType, TemperatureUnit } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { syncWithSupabase } = useAppStore();

  const syncUserDataFromSupabase = useCallback(async (authUser: User) => {
    try {
      const userId = authUser.id;
      const fullName =
        authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Skyora User';

      // 1. Fetch / Initialize User Preferences
      const { data: prefData } = await getUserPreferences(userId);
      let activities: ActivityType[] = ['Running', 'Driving'];
      let units: TemperatureUnit = 'C';
      let commuteStart = 18;
      let commuteEnd = 19;
      let timeOfDay: 'morning' | 'evening' = 'evening';
      let notifications = true;

      if (prefData) {
        if (prefData.activities && prefData.activities.length > 0) {
          activities = prefData.activities as ActivityType[];
        }
        if (prefData.preferred_units === 'F' || prefData.preferred_units === 'C') {
          units = prefData.preferred_units as TemperatureUnit;
        }
        if (prefData.commute_start) {
          commuteStart = parseTimeToHour(prefData.commute_start);
        }
        if (prefData.commute_end) {
          commuteEnd = parseTimeToHour(prefData.commute_end);
        }
        if (prefData.morning_or_evening === 'morning' || prefData.morning_or_evening === 'evening') {
          timeOfDay = prefData.morning_or_evening;
        }
        if (prefData.notifications_enabled !== undefined) {
          notifications = prefData.notifications_enabled;
        }
      } else {
        // First-time user: seed initial preferences row in Supabase
        await saveUserPreferences(userId, {
          activities: ['Running', 'Driving'],
          preferredUnits: 'C',
          morningOrEvening: 'evening',
          commuteStartHour: 18,
          commuteEndHour: 19,
          notificationsEnabled: true,
        });
      }

      // 2. Fetch / Initialize User Locations
      let { data: locData } = await getLocations(userId);
      if (!locData || locData.length === 0) {
        // Seed default initial location in Supabase
        const { data: newLoc } = await createLocation(userId, {
          cityName: 'Mumbai',
          label: 'Home',
          latitude: 19.076,
          longitude: 72.8777,
        });
        locData = newLoc ? [newLoc] : [];
      }

      // 3. Fetch User Feedback History
      const { data: feedbackData } = await getFeedback(userId);

      // 4. Fetch User Interaction History
      const { data: interactionData } = await getInteractions(userId);

      // Sync into zustand store
      syncWithSupabase({
        profile: {
          id: userId,
          name: fullName,
          units: units,
          primaryActivity: activities[0] || 'Running',
          selectedActivities: activities,
          preferences: {
            preferredTimeOfDay: timeOfDay,
            commuteWindow: { startHour: commuteStart, endHour: commuteEnd },
            activityWindow: { activity: activities[0] || 'Running', startHour: 18, endHour: 19 },
            notificationsEnabled: notifications,
            rainThresholdSensitivity: 'high',
          },
        },
        locations: locData || undefined,
        feedbacks: feedbackData || undefined,
        interactions: interactionData || undefined,
      });
    } catch (err) {
      console.error('Error syncing user data from Supabase:', err);
    }
  }, [syncWithSupabase]);

  const refreshUserData = useCallback(async () => {
    if (user) {
      await syncUserDataFromSupabase(user);
    }
  }, [user, syncUserDataFromSupabase]);

  useEffect(() => {
    let mounted = true;

    // 1. Check initial session
    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error }) => {
        if (error) {
          console.error('Error fetching Supabase session:', error.message);
        }
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await syncUserDataFromSupabase(initialSession.user);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Unexpected error checking session:', err);
        if (mounted) {
          setIsLoading(false);
        }
      });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await syncUserDataFromSupabase(newSession.user);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserDataFromSupabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      session: null,
      user: null,
      isLoading: true,
      signOut: async () => {},
      refreshUserData: async () => {},
    };
  }
  return context;
};
