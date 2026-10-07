import { supabase } from './supabase';
import { SavedLocation, LocationType } from '../types';

export interface SupabaseLocation {
  id: string;
  user_id: string;
  label: string | null;
  city_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
}

/**
 * Fetch all locations saved by the current authenticated user.
 */
export const getLocations = async (
  userId?: string
): Promise<{ data: SavedLocation[] | null; error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const currentUserId = user.id;

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching locations from Supabase:', error.message);
      return { data: null, error };
    }

    const mapped: SavedLocation[] = (data || []).map((row: SupabaseLocation, index: number) => ({
      id: row.id,
      name: row.city_name || 'City',
      state: 'Saved Hub',
      type: (row.label as LocationType) || 'Home',
      lat: row.latitude || 19.076,
      lon: row.longitude || 72.8777,
      isPrimary: index === 0,
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Unexpected error in getLocations:', err);
    return { data: null, error: err };
  }
};

/**
 * Add a new location record for the current user in Supabase.
 */
export const createLocation = async (
  userId: string,
  location: {
    label: string;
    cityName: string;
    latitude: number;
    longitude: number;
  }
): Promise<{ data: SavedLocation | null; error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const currentUserId = user.id;

    const payload = {
      user_id: currentUserId,
      label: location.label,
      city_name: location.cityName,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    const { data, error } = await supabase
      .from('locations')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating location in Supabase:', error.message);
      return { data: null, error };
    }

    const mapped: SavedLocation = {
      id: data.id,
      name: data.city_name || location.cityName,
      state: 'Saved Hub',
      type: (data.label as LocationType) || 'Home',
      lat: data.latitude || location.latitude,
      lon: data.longitude || location.longitude,
    };

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Unexpected error in createLocation:', err);
    return { data: null, error: err };
  }
};

/**
 * Update an existing location record in Supabase.
 */
export const updateLocation = async (
  locationId: string,
  updates: {
    label?: string;
    cityName?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<{ data: any | null; error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError || new Error('User not authenticated') };
    }

    const payload: Partial<SupabaseLocation> = {};
    if (updates.label !== undefined) payload.label = updates.label;
    if (updates.cityName !== undefined) payload.city_name = updates.cityName;
    if (updates.latitude !== undefined) payload.latitude = updates.latitude;
    if (updates.longitude !== undefined) payload.longitude = updates.longitude;

    const { data, error } = await supabase
      .from('locations')
      .update(payload)
      .eq('id', locationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location in Supabase:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Unexpected error in updateLocation:', err);
    return { data: null, error: err };
  }
};

/**
 * Delete a location record from Supabase.
 */
export const deleteLocation = async (
  locationId: string
): Promise<{ error: Error | null }> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: authError || new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting location from Supabase:', error.message);
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    console.error('Unexpected error in deleteLocation:', err);
    return { error: err };
  }
};
