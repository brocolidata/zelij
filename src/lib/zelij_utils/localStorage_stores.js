import { writable, get } from 'svelte/store';

const PREFIX = 'zelij_';
const isBrowser = typeof localStorage !== 'undefined';

export function localStorageStore(key, initialValue) {
    const storageKey = `${PREFIX}${key}`;

    // Load persisted subset from localStorage
    let persistedSubset = [];
    if (isBrowser) {
        const fromStorage = localStorage.getItem(storageKey);
        if (fromStorage) {
            try {
                persistedSubset = JSON.parse(fromStorage);
            } catch (e) {
                console.warn(`Failed to parse ${storageKey}`, e);
            }
        }
    }

    // Main store (full list, including items not persisted)
    // const store = writable(initialValue);
    const initialStoreValue =
        persistedSubset.length > 0 ? persistedSubset : initialValue;

    const store = writable(initialStoreValue);

    // Save persisted subset to localStorage
    function saveSubset() {
        if (!isBrowser) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(persistedSubset));
        } catch (e) {
            console.warn(`Failed to save ${storageKey}`, e);
        }
    }

    return {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update,

        getPersisted: () => persistedSubset,

        persistItem: (name) => {
            const all = get(store);
            const item = all.find((d) => d.name === name);
            if (!item) return;

            // Only add to persisted subset if it isn’t already there
            if (!persistedSubset.some(d => d.name === name)) {
                persistedSubset = [...persistedSubset, item];
                saveSubset();
            }
        },

        unpersistItem: (name) => {
            persistedSubset = persistedSubset.filter(d => d.name !== name);
            saveSubset();
        },
        storeKey: key,
        storageKey
    };
}

/**
 * Check if an object with a given property value exists in a localStorage store
 * @param {string} storeName - Store name without prefix (e.g., "dataSourcesIndex")
 * @param {string} prop - Property name to match (e.g., "id")
 * @param {any} value - Value to match
 * @returns {boolean}
 */
export function existsInLocalStorage(storeName, prop, value) {
    if (!isBrowser) return false;
    try {
        const key = PREFIX + storeName;
        const json = localStorage.getItem(key);
        if (!json) return false;

        const parsed = JSON.parse(json);

        // Handle array of objects
        if (Array.isArray(parsed)) {
            return parsed.some((item) => item?.[prop] === value);
        }

        // Handle object keyed by ID
        if (parsed && typeof parsed === 'object') {
            return Object.values(parsed).some((item) => item?.[prop] === value);
        }

        return false;
    } catch (e) {
        console.warn(`Error checking existence in ${storeName}`, e);
        return false;
    }
}