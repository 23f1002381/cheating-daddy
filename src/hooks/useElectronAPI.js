import { useEffect, useState } from 'react';

export const useElectronAPI = () => {
  const [isElectron] = useState(
    typeof window !== 'undefined' && window.electronAPI
  );
  return {
    isElectron,
    api: window.electronAPI
  };
};
