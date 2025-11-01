import usePersistentState from './usePersistentState';
import { LOCAL_STORAGE_KEYS } from '../constants';

export interface Settings {
  lineWrapEnabled: boolean;
  fontSize: number;
}

const defaultSettings: Settings = {
  lineWrapEnabled: false,
  fontSize: 14,
};

/**
 * A custom hook to manage and persist user settings in localStorage.
 */
export const useSettings = () => {
  return usePersistentState<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, defaultSettings);
};
