import { get, writable } from 'svelte/store';
import { getDashboards, getDataApps, getDataSources } from '$lib/zelij_utils/zelij_config'
import { fetchTableColumns } from "$lib/zelij_utils/duckdb";

// Initial index state for dashboards, data sources
export const dashboardsIndex = writable([]);
export const dataAppsIndex = writable([]);
export const dataSourcesIndex = writable([]);
export const dataLoaded = writable(false);


/**
 * Adds a new dashboard object to the dashboardsIndex store.
 * 
 * @param {Object} dashboard - The dashboard object to add.
 * @param {string} dashboard.name - The name of the dashboard.
 */
export function initializeDashboards() {
  const initialStaticDashboards = getDashboards();
  if (initialStaticDashboards && Array.isArray(initialStaticDashboards)) {
    dashboardsIndex.update((currentDashboards) => {
      return [...currentDashboards, ...initialStaticDashboards];
    });
  } else {
    console.warn("initializeDashboards called with non-array or empty initialStaticDashboards.");
  }
}

export function initializeDataApps() {
  const initialStaticDataApps = getDataApps();
  if (initialStaticDataApps && Array.isArray(initialStaticDataApps)) {
    dataAppsIndex.update((currentDataApps) => {
      return [...currentDataApps, ...initialStaticDataApps];
    });
  } else {
    console.warn("initializeDataApps called with non-array or empty initialStaticDataApps.");
  }
}

export function initializeDataSources() {
  const initialStaticDataSources = getDataSources();
  if (initialStaticDataSources && Array.isArray(initialStaticDataSources)) {
    dataSourcesIndex.update((currentDataSources) => {
      return [...currentDataSources, ...initialStaticDataSources];
    });
  } else {
    console.warn("initializeDataSources called with non-array or empty initialStaticDataSources.");
  }
}

export function initializeAppStores() {
  initializeDashboards();
  initializeDataApps();
  initializeDataSources();
}

export function createDashboard(dashboard) {
  dashboardsIndex.update((currentDashboards) => {
    // Check if the dashboard already exists (e.g., by name) to avoid duplicates
    if (currentDashboards.some(d => d.name === dashboard.name)) {
      console.warn(`Dashboard with name "${dashboard.name}" already exists.`);
      return currentDashboards;
    }
    // Add the new dashboard to the list
    return [...currentDashboards, dashboard];
  });
}

/**
 * Checks if a dashboard with the given name already exists in the dashboardsIndex store.
 * @param {string} newDashboardName - The name of the dashboard to check.
 * @returns {boolean} - True if a dashboard with the name exists, false otherwise.
 */
export function dashboardNameExists(newDashboardName) {
  const dashboards = get(dashboardsIndex); // Get the current state of the store
  return dashboards.some(dashboard => dashboard.name === newDashboardName);
}

export function createDataApp(dataApp) {
  dataAppsIndex.update((currentDataApps) => {
    // Check if the data app already exists (e.g., by name) to avoid duplicates
    if (currentDataApps.some(da => da.name === dataApp.name)) {
      console.warn(`Data app with name "${dataApp.name}" already exists.`);
      return currentDataApps;
    }
    // Add the new data app to the list
    console.log(`Successfully added ${dataApp.name} to dataAppsIndex`)
    return [...currentDataApps, dataApp];
  });
}

/**
 * Function to delete a dashboard by name.
 * @param {string} name - The name of the dashboard to delete.
 */
export function deleteDashboard(name) {
  dashboardsIndex.update((dashboards) => {
    if (dashboards.some((dashboard) => dashboard.name === name)) {
      return dashboards.filter((dashboard) => dashboard.name !== name); // Remove the dashboard by name
    }
    console.warn(`Dashboard with name "${name}" does not exist.`);
    return dashboards; // No changes if the name doesn't exist
  });
}

/**
 * Function to update a dashboard by name.
 * @param {string} name - The name of the dashboard to update.
 * @param {object} updates - The updates to apply to the dashboard.
 */
export function updateDashboard(name, updates) {
  dashboardsIndex.update((dashboards) => {
    const index = dashboards.findIndex((dashboard) => dashboard.name === name);
    if (index !== -1) {
      const updatedDashboard = { ...dashboards[index], ...updates };
      return [
        ...dashboards.slice(0, index),
        updatedDashboard,
        ...dashboards.slice(index + 1),
      ];
    }
    console.warn(`Dashboard with name "${name}" does not exist.`);
    return dashboards; // No changes if the dashboard doesn't exist
  });
}

/**
 * Function to get a dashboard object by name.
 * @param {string} name - The name of the dashboard to fetch.
 * @returns {object} - The dashboard object if found, or an empty object if not found.
 */
export function getDashboardByName(name) {
  const dashboards = get(dashboardsIndex); // Get the current state of the store
  return dashboards.find((dashboard) => dashboard.name === name) || {};
}

/**
 * Function to get a data app object by name.
 * @param {string} name - The name of the dashboard to fetch.
 * @returns {object} - The dashboard object if found, or an empty object if not found.
 */
export function getDataAppByName(name) {
  const dataApps = get(dataAppsIndex); // Get the current state of the store
  return dataApps.find((dataApp) => dataApp.name === name) || {};
}

export function getDashboardsForDataApp(dashboardNames) {
  if (dashboardNames) {
    const allDashboards = get(dashboardsIndex);

    return dashboardNames.flatMap((name) =>
      allDashboards.filter((dashboard) => dashboard.name === name)
    );
  } else {
    console.log('No dashboard found for active data app');
    return [];
  }
}

export function addDashboardToDataApp(dataAppName, dashboardName) {
  dataAppsIndex.update((currentDataApps) => {
    const dataAppIndex = currentDataApps.findIndex(
      (dataApp) => dataApp.name === dataAppName
    );

    if (dataAppIndex !== -1) {
      const updatedDataApps = currentDataApps.map((dataApp, index) => {
        if (index === dataAppIndex) {
          // Check if the dashboard already exists
          if (dataApp.dashboards.some((dashboard) => dashboard === dashboardName)) {
            console.warn(
              `Dashboard with name "${dashboardName}" already exists in DataApp "${dataAppName}".`
            );
            return dataApp; // Return the original dataApp without changes
          }
          return {
            ...dataApp,
            dashboards: [...dataApp.dashboards, dashboardName],
          };
        }
        return dataApp;
      });
      console.log(
        `Dashboard "${dashboardName}" added to DataApp "${dataAppName}".`
      );
      return updatedDataApps;
    } else {
      console.warn(`DataApp with name "${dataAppName}" does not exist.`);
      return currentDataApps; // No changes if the DataApp doesn't exist
    }
  });
}

export function updateDashboardsInDataApp(dataAppName, dashboardNames) {
  dataAppsIndex.update((currentDataApps) => {
    const dataAppIndex = currentDataApps.findIndex(
      (dataApp) => dataApp.name === dataAppName
    );

    if (dataAppIndex === -1) {
      console.warn(`DataApp with name "${dataAppName}" does not exist.`);
      return currentDataApps;
    }

    const updatedDataApps = currentDataApps.map((dataApp, index) => {
      if (index !== dataAppIndex) return dataApp;

      // Ensure dataApp.dashboards is an array, defaulting to an empty array if not.
      const currentDashboards = Array.isArray(dataApp.dashboards)
        ? dataApp.dashboards
        : [];

      const existingDashboards = new Set(currentDashboards);
      const dashboardsToAdd = [];

      dashboardNames.forEach((name) => {
        const trimmedName = name.trim();
        if (!existingDashboards.has(trimmedName)) {
          dashboardsToAdd.push(trimmedName);
          existingDashboards.add(trimmedName);
        } else {
          console.warn(
            `Dashboard "${trimmedName}" already exists in DataApp "${dataAppName}".`
          );
        }
      });

      if (dashboardsToAdd.length === 0) return dataApp;

      console.log(
        `Dashboards "${dashboardsToAdd.join('", "')}" added to DataApp "${dataAppName}".`
      );

      return {
        ...dataApp,
        dashboards: [...currentDashboards, ...dashboardsToAdd], // Use currentDashboards here
      };
    });

    return updatedDataApps;
  });
}

export async function updateDataSourcesWithColumnTypes() {
    // 1. Get the current value of the store
    let currentDataSources = [];
    dataSourcesIndex.subscribe(value => {
        currentDataSources = value;
    })(); // Call the unsubscribe function immediately to get the current value

    // 2. Create a copy to work with
    const updatedDataSources = [...currentDataSources];

    // 3. Map over the data sources and create promises for fetching columns
    const fetchPromises = updatedDataSources.map(async (dataSource) => {
        // Ensure dataSource.name exists and is a string for fetchTableColumns
        if (!dataSource.columns && typeof dataSource.name === 'string') {
            try {
                const columns = await fetchTableColumns(dataSource.name);
                return {
                    ...dataSource,
                    columns // Assuming 'columns' is the property name for column types
                };
            } catch (error) {
                console.error(`Failed to fetch columns for table ${dataSource.name}:`, error);
                return {
                    ...dataSource,
                    columns: [] // Return empty array or handle error appropriately
                };
            }
        }
        return dataSource; // Return original if already has columns or name is not valid
    });

    // 4. Await all promises to resolve
    const finalDataSources = await Promise.all(fetchPromises);

    // 5. Update the store with the fully resolved data
    dataSourcesIndex.set(finalDataSources);
    // OR if you want to use update for some reason (less direct in this scenario):
    // dataSourcesIndex.update(() => finalDataSources);

    console.log("dataSourcesIndex updated with column types:", finalDataSources);
}

export function getDataSourceByName(name) {
  const dataSources = get(dataSourcesIndex); // Get the current state of the store
  return dataSources.find((dataSource) => dataSource.name === name) || {};
}


export function createFiltersStore() {
  return writable([]);
}