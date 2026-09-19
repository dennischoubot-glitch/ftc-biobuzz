import { useState, useCallback } from 'react';
import { loadData, saveData } from '../utils/storage';

export function useData() {
  const [data, setData] = useState(() => loadData());

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveData(next);
      return next;
    });
  }, []);

  return [data, update];
}
