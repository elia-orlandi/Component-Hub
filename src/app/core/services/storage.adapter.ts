export type SupabaseStorageAdapter = {
    getItem(key: string): Promise<string | null> | string | null;
    setItem(key: string, value: string): Promise<void> | void;
    removeItem(key: string): Promise<void> | void;
  };
  
  // L'implementazione rimane la stessa, ma ora rispetta il nostro tipo definito localmente.
  export const SessionStorageAdapter: SupabaseStorageAdapter = {
    getItem: (key) => {
      // La guardia `typeof` è fondamentale perché questo codice potrebbe
      // essere eseguito in un ambiente non-browser (SSR) in futuro.
      if (typeof sessionStorage === 'undefined') {
        return null;
      }
      return sessionStorage.getItem(key);
    },
    setItem: (key, value) => {
      if (typeof sessionStorage === 'undefined') {
        return;
      }
      sessionStorage.setItem(key, value);
    },
    removeItem: (key) => {
      if (typeof sessionStorage === 'undefined') {
        return;
      }
      sessionStorage.removeItem(key);
    },
  };