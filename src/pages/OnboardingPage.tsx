import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { saveUserPreferences } from '../services/preferencesService';
import { createLocation } from '../services/locationsService';
import { supabase } from '../services/supabase';
import { ActivityType, TemperatureUnit, LocationType, UserProfile } from '../types';
import { POPULAR_LOCATIONS } from '../services/mockScenarios';
import { getWeatherData } from '../services/weather';
import { rankCards } from '../engine/rank';
import { WeatherArt } from '../components/ui/WeatherArt';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Activity,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Eye,
  Loader2,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeOnboarding } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState<string>(user?.user_metadata?.full_name || '');
  const [units, setUnits] = useState<TemperatureUnit>('C');
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([
    'Running',
    'Driving',
  ]);
  const [primaryActivity, setPrimaryActivity] = useState<ActivityType>('Running');
  const [selectedCity, setSelectedCity] = useState<string>('Mumbai');
  const [locationType, setLocationType] = useState<LocationType>('Home');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('evening');
  const [commuteStart, setCommuteStart] = useState<number>(18);
  const [notifications, setNotifications] = useState<boolean>(true);

  React.useEffect(() => {
    if (user?.user_metadata?.full_name && !name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  const allActivities: { type: ActivityType; desc: string }[] = [
    { type: 'Running', desc: 'Rain-free roads & low heat stress' },
    { type: 'Cycling', desc: 'Wind resistance & pavement grip' },
    { type: 'Driving', desc: 'Commute visibility & flood alerts' },
    { type: 'Travelling', desc: 'Destination forecasts & luggage advice' },
    { type: 'Farming', desc: 'Rain accumulation & spray suitability' },
    { type: 'Sports', desc: 'Outdoor field safety & hydration' },
    { type: 'Outdoor work', desc: 'UV indices & continuous rain impact' },
    { type: 'Family', desc: 'Weekend leisure & park comfort' },
    { type: 'General', desc: 'Daily temperature & umbrella alerts' },
  ];

  const handleToggleActivity = (act: ActivityType) => {
    let list = [...selectedActivities];
    if (list.includes(act)) {
      if (list.length > 1) {
        list = list.filter((a) => a !== act);
      }
    } else {
      list.push(act);
    }
    setSelectedActivities(list);
    if (!list.includes(primaryActivity)) {
      setPrimaryActivity(list[0]);
    }
  };

  // Construct draft profile for live preview
  const draftProfile: UserProfile = {
    id: user?.id || 'user-custom',
    name: name.trim() || user?.user_metadata?.full_name || 'User',
    units,
    primaryActivity,
    selectedActivities,
    locations: [
      {
        id: 'loc-custom',
        name: selectedCity,
        state: 'Maharashtra',
        type: locationType,
        lat: 19.076,
        lon: 72.8777,
        isPrimary: true,
      },
    ],
    activeLocationId: 'loc-custom',
    preferences: {
      preferredTimeOfDay: timeOfDay,
      commuteWindow: { startHour: commuteStart, endHour: commuteStart + 1 },
      activityWindow: { activity: primaryActivity, startHour: 18, endHour: 19 },
      notificationsEnabled: notifications,
      rainThresholdSensitivity: 'high',
    },
    inferredPreferences: {},
  };

  // Preview weather & engine rank
  const previewWeather = getWeatherData(selectedCity, 17, units);
  const previewCards = rankCards(draftProfile, previewWeather, 17, []);
  const topRecCard = previewCards.find((c) => c.type === 'top_recommendation');

  const handleFinish = async () => {
    setIsSubmitting(true);
    const finalName = name.trim() || user?.user_metadata?.full_name || 'User';
    try {
      if (user) {
        // 1. Persist preferences to Supabase
        await saveUserPreferences(user.id, {
          activities: selectedActivities,
          preferredUnits: units,
          morningOrEvening: timeOfDay,
          commuteStartHour: commuteStart,
          commuteEndHour: commuteStart + 1,
          notificationsEnabled: notifications,
        });

        // 2. Persist location to Supabase
        const pop = POPULAR_LOCATIONS.find((p) => p.city === selectedCity) || POPULAR_LOCATIONS[0];
        await createLocation(user.id, {
          label: locationType,
          cityName: selectedCity,
          latitude: pop.lat,
          longitude: pop.lon,
        });

        // 3. Update auth user name metadata if present
        if (finalName && finalName !== user.user_metadata?.full_name) {
          await supabase.auth.updateUser({ data: { full_name: finalName } });
        }
      }
      completeOnboarding({
        ...draftProfile,
        id: user?.id || draftProfile.id,
        name: finalName,
      });
      navigate('/');
    } catch (err) {
      console.error('Error saving onboarding data to Supabase:', err);
      completeOnboarding({
        ...draftProfile,
        id: user?.id || draftProfile.id,
        name: finalName,
      });
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans select-none">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Personalization Setup · Step {step} of 4
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              {step === 1 && 'Identity & Measurement Units'}
              {step === 2 && 'What activities matter to you?'}
              {step === 3 && 'Your Primary Location Hub'}
              {step === 4 && 'Daily Schedule & Routine Windows'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-all ${
                  s === step ? 'bg-amber-500 w-12' : s < step ? 'bg-slate-800' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2-Column Layout: Form on Left, Live Interactive Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Step Area (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            {/* STEP 1: Name and Units */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    What should Skyora call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used to greet you with routine-tailored weather summaries.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Temperature Scale
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUnits('C')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        units === 'C'
                          ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-bold">Celsius (°C)</div>
                      <div className="text-[11px] text-slate-500">Standard Indian meteorological scale</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnits('F')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        units === 'F'
                          ? 'border-amber-500 bg-amber-50/50 text-slate-900 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-bold">Fahrenheit (°F)</div>
                      <div className="text-[11px] text-slate-500">Imperial meteorological units</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Activities Selection */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <p className="text-xs text-slate-500">
                  Select all activities you regularly engage in. You can also pick which one holds top priority.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allActivities.map((act) => {
                    const isSelected = selectedActivities.includes(act.type);
                    const isPrimary = primaryActivity === act.type;

                    return (
                      <div
                        key={act.type}
                        onClick={() => handleToggleActivity(act.type)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:bg-slate-100/60'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{act.type}</span>
                            {isPrimary && (
                              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {act.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {selectedActivities.length > 1 && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Which activity should lead your daily homepage?
                    </label>
                    <select
                      value={primaryActivity}
                      onChange={(e) => setPrimaryActivity(e.target.value as ActivityType)}
                      className="text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {selectedActivities.map((act) => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Location Hub */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Select Your City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white"
                  >
                    {POPULAR_LOCATIONS.map((p) => (
                      <option key={p.city} value={p.city}>
                        {p.city}, {p.state} ({p.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Location Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Home', 'Work', 'College', 'Farm', 'Travel destination'] as LocationType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLocationType(t)}
                        className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          locationType === t
                            ? 'border-amber-500 bg-amber-50/60 font-semibold text-slate-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Preferences */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    When do you usually perform your primary routine?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimeOfDay('morning')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        timeOfDay === 'morning'
                          ? 'border-amber-500 bg-amber-50/60 font-semibold text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Morning Hours</div>
                      <div className="text-[10px] text-slate-500">06:00 AM – 09:00 AM</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeOfDay('evening')}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        timeOfDay === 'evening'
                          ? 'border-amber-500 bg-amber-50/60 font-semibold text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold">Evening Hours</div>
                      <div className="text-[10px] text-slate-500">05:00 PM – 08:00 PM</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Commute Departure Window
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={commuteStart}
                      onChange={(e) => setCommuteStart(Number(e.target.value))}
                      className="text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-mono"
                    >
                      <option value={8}>08:00 AM – 09:00 AM (Morning Transit)</option>
                      <option value={9}>09:00 AM – 10:00 AM (Late Morning)</option>
                      <option value={17}>05:00 PM – 06:00 PM (Early Evening)</option>
                      <option value={18}>06:00 PM – 07:00 PM (Evening Rush Hour)</option>
                      <option value={19}>07:00 PM – 08:00 PM (Night Transit)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Enable Rain & Severe Weather Alerts
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Highlights urgent dry windows and statutory alerts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Profile to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Launch Skyora</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Live Preview Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-100/80 rounded-2xl border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>Live Personalization Engine Preview</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Notice how changing your activity to <strong>{primaryActivity}</strong> or city to <strong>{selectedCity}</strong> immediately recalculates the top recommendation card below:
            </p>

            {/* Mini Simulated Hero Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{selectedCity} · Good evening, {name.split(' ')[0]}</span>
                <span className="font-mono">{previewWeather.temp}°{units}</span>
              </div>

              {/* Dynamic Top Recommendation in Preview */}
              {topRecCard && (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                  <div className="text-[10px] font-bold text-amber-900 uppercase">
                    {topRecCard.data.contextTag}
                  </div>
                  <div className="font-bold text-slate-900 text-xs">
                    {topRecCard.data.headline}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    {topRecCard.data.subtext}
                  </div>
                </div>
              )}

              {/* Preview Slot Hierarchy */}
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700">Calculated Card Sequence:</div>
                {previewCards.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex justify-between font-mono">
                    <span>{i + 1}. {c.type}</span>
                    <span>priority: {c.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
