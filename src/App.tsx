import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Screen Pages
import { HomePage } from './pages/HomePage';
import { WeatherDetailsPage } from './pages/WeatherDetailsPage';
import { ActivityConditionsPage } from './pages/ActivityConditionsPage';
import { SmartTimeFinderPage } from './pages/SmartTimeFinderPage';
import { AskSkyoraPage } from './pages/AskSkyoraPage';
import { AlertsPage } from './pages/AlertsPage';
import { HabitsPage } from './pages/HabitsPage';
import { SavedLocationsPage } from './pages/SavedLocationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TestPersonasPage } from './pages/TestPersonasPage';
import { SplashPage } from './pages/SplashPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Standalone Marketing Screen */}
          <Route path="/welcome" element={<SplashPage />} />

          {/* Public Authentication Screens */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Onboarding Wizard */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Main Application Shell with Sidebar and TopBar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="weather-details" element={<WeatherDetailsPage />} />
              <Route path="activities" element={<ActivityConditionsPage />} />
              <Route path="time-finder" element={<SmartTimeFinderPage />} />
              <Route path="ask-skyora" element={<AskSkyoraPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="locations" element={<SavedLocationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="test-personas" element={<TestPersonasPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
