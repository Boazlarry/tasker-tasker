import { useState, useEffect, useCallback } from 'react';

export interface Platform {
  id: string;
  type: 'jira' | 'notion'; // Add other platforms later
  name: string;
  url: string;
  auth: {
    username?: string;
    apiToken?: string;
    // Add other auth types later
  };
}

const STORAGE_KEY = 'tasker-platforms';

export function usePlatformManager() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPlatforms = localStorage.getItem(STORAGE_KEY);
      if (storedPlatforms) {
        setPlatforms(JSON.parse(storedPlatforms));
      }
    } catch (error) {
      console.error("Failed to parse platforms from localStorage", error);
    }
    setLoading(false);
  }, []);

  const savePlatforms = useCallback((newPlatforms: Platform[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlatforms));
      setPlatforms(newPlatforms);
    } catch (error) {
      console.error("Failed to save platforms to localStorage", error);
    }
  }, []);

  const addPlatform = useCallback((platform: Omit<Platform, 'id'>) => {
    const newPlatform = { ...platform, id: Date.now().toString() };
    const updatedPlatforms = [...platforms, newPlatform];
    savePlatforms(updatedPlatforms);
    return newPlatform;
  }, [platforms, savePlatforms]);

  const updatePlatform = useCallback((updatedPlatform: Platform) => {
    const updatedPlatforms = platforms.map(p => p.id === updatedPlatform.id ? updatedPlatform : p);
    savePlatforms(updatedPlatforms);
  }, [platforms, savePlatforms]);

  const deletePlatform = useCallback((platformId: string) => {
    const updatedPlatforms = platforms.filter(p => p.id !== platformId);
    savePlatforms(updatedPlatforms);
  }, [platforms, savePlatforms]);

  return {
    platforms,
    loading,
    addPlatform,
    updatePlatform,
    deletePlatform,
    savePlatforms, // For reordering
  };
}
