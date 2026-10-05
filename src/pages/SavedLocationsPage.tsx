import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { SavedLocation, LocationType } from '../types';
import { POPULAR_LOCATIONS } from '../services/mockScenarios';
import { createLocation, deleteLocation } from '../services/locationsService';
import {
  MapPin,
  Plus,
  Trash2,
  Check,
  Building,
  Home,
  GraduationCap,
  Sprout,
  Plane,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const SavedLocationsPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, updateProfile, setActiveLocation, addLocation, removeLocation } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState(POPULAR_LOCATIONS[0].city);
  const [selectedType, setSelectedType] = useState<LocationType>('Home');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const locationTypeIcons: Record<LocationType, any> = {
    Home: Home,
    Work: Building,
    College: GraduationCap,
    Farm: Sprout,
    'Travel destination': Plane,
    Current: Navigation,
  };

  const locationTypePurpose: Record<LocationType, string> = {
    Home: 'Used for regular morning overviews, evening sport suitability, and local emergency alerts.',
    Work: 'Monitors highway visibility, precipitation, and traffic delay factors during your commute window.',
    College: 'Tracks daily transit conditions and umbrella advisories between classes.',
    Farm: 'Calculates soil water accumulation, pesticide drift windows, and irrigation scheduling.',
    'Travel destination': 'Generates packing checklists, destination warnings, and extended 7-day outlooks.',
    Current: 'Real-time GPS coordinates for immediate localized radar updates.',
  };

  const handleAddLocation = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const pop = POPULAR_LOCATIONS.find((p) => p.city === selectedCity) || POPULAR_LOCATIONS[0];

    if (user) {
      setIsSaving(true);
      try {
        const { data: newLoc, error } = await createLocation(user.id, {
          cityName: pop.city,
          label: selectedType,
          latitude: pop.lat,
          longitude: pop.lon,
        });

        if (error || !newLoc) {
          setErrorMsg('Unable to save this location. Please try again.');
        } else {
          addLocation(newLoc);
          setSuccessMsg(`Location ${pop.city} added successfully.`);
          setShowAddForm(false);
          setTimeout(() => setSuccessMsg(null), 3000);
        }
      } catch {
        setErrorMsg('Unable to save this location.');
      } finally {
        setIsSaving(false);
      }
    } else {
      const newLoc: SavedLocation = {
        id: `loc-${Date.now()}`,
        name: pop.city,
        state: pop.state,
        type: selectedType,
        lat: pop.lat,
        lon: pop.lon,
      };
      updateProfile({
        locations: [...profile.locations, newLoc],
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (profile.locations.length <= 1) return; // Keep at least one
    setErrorMsg(null);

    if (user) {
      setDeletingId(id);
      try {
        const { error } = await deleteLocation(id);
        if (error) {
          setErrorMsg('Unable to delete location from cloud.');
        } else {
          removeLocation(id);
        }
      } catch {
        setErrorMsg('Unable to delete location.');
      } finally {
        setDeletingId(null);
      }
    } else {
      const filtered = profile.locations.filter((l) => l.id !== id);
      updateProfile({
        locations: filtered,
        activeLocationId: profile.activeLocationId === id ? filtered[0].id : profile.activeLocationId,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Saved Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure routine places and destination hubs to tailor weather intelligence to your daily geography
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Location Modal / Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-md animate-in fade-in duration-150">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Add New Geographic Hub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Select City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                {POPULAR_LOCATIONS.map((p) => (
                  <option key={p.city} value={p.city}>
                    {p.city}, {p.state} ({p.country})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Location Role & Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as LocationType)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="College">College</option>
                <option value="Farm">Farm</option>
                <option value="Travel destination">Travel destination</option>
                <option value="Current">Current location</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddLocation}
              disabled={isSaving}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:bg-slate-700 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              <span>{isSaving ? 'Saving...' : 'Save Location'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Locations Cards List */}
      <div className="space-y-4">
        {profile.locations.map((loc) => {
          const Icon = locationTypeIcons[loc.type] || MapPin;
          const isCurrentActive = loc.id === profile.activeLocationId;

          return (
            <div
              key={loc.id}
              className={`rounded-xl border p-5 shadow-xs transition-all flex flex-wrap items-center justify-between gap-4 ${
                isCurrentActive
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                    isCurrentActive
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {loc.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({loc.state})
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {loc.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 max-w-xl leading-relaxed">
                    <strong className="text-slate-700 font-semibold">What it's used for: </strong>
                    {locationTypePurpose[loc.type]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isCurrentActive ? (
                  <button
                    type="button"
                    onClick={() => setActiveLocation(loc.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
                  >
                    Set as Active
                  </button>
                ) : (
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Currently Active
                  </span>
                )}

                {profile.locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    disabled={deletingId === loc.id}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Remove location"
                    aria-label="Remove location"
                  >
                    {deletingId === loc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
