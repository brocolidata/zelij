// src/lib/dashboard/helpers/tileHelpers.ts
import gridHelp from "svelte-grid/build/helper/index.mjs";
import type { TileItem } from "../types"; // optional if you define types

const COLS = 6;

export function labelToName(label: string): string {
  return label.replace(/\s+/g, "_");
}

export function generateId(): string {
  return "_" + Math.random().toString(36).substr(2, 9);
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function createNewTile(editMode: boolean, existingItems: any[]): any {
  let newItem = {
    [COLS]: gridHelp.item({
      w: Math.round(randomInRange(1, 4)),
      h: Math.round(randomInRange(1, 4)),
      x: 0,
      y: 0,
      fixed: !editMode,
    }),
    id: generateId(),
  };

  const pos = gridHelp.findSpace(newItem, existingItems, COLS);
  newItem[COLS] = { ...newItem[COLS], ...pos };

  return newItem;
}

export function removeTile(items: any[], id: string, adjust = false): any[] {
  let updated = items.filter((item) => item.id !== id);
  return adjust ? gridHelp.adjust(updated, COLS) : updated;
}

// export function updateTile(items: any[], updated: any): any[] {
//   return items.map((item) =>
//     item.id === updated.id
//       ? {
//           ...item,
//           sqlQuery: updated.sqlQuery,
//           chartOptions: updated.chartOptions,
//         }
//       : item
//   );
// }
export function updateTile(items: any[], updated: any): any[] {
  return items.map((item) =>
    item.id === updated.id
      ? {
          ...item,
          chartConfiguration: updated.chartConfiguration, // <-- NEW
        }
      : item
  );
}


type Layout = {
  x: number;
  y: number;
  w: number;
  h: number;
  fixed?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  customDragger?: boolean;
  customResizer?: boolean;
};

export type GridItem = {
  id: string;
  [key: number]: Layout;
  chartConfiguration: object
  // other props (like id, name, etc.) can go here if needed
};

export function toggleEditInTiles(
  items: GridItem[],
  cols: number,
  editMode: boolean
): GridItem[] {
  const editProps = {
    fixed: false,
    resizable: true,
    draggable: true,
    // customDragger: true,
    // customResizer: true,
  };

  const editOnlyKeys = Object.keys(editProps);

  return items.map((item) => {
    const base = item[cols] ?? { x: 0, y: 0, w: 1, h: 1 };

    const cleanedBase = Object.fromEntries(
      Object.entries(base).filter(([key]) => !editOnlyKeys.includes(key))
    ) as Layout;

    return {
      ...item,
      [cols]: editMode
        ? { ...base, ...editProps }
        : { ...cleanedBase, fixed: true },
    };
  });
}



export interface DashboardState {
  name: string;
  label: string;
  description: string;
  definition_source: string;
  tiles: GridItem[];
}

/**
* Returns a deep copy of the dashboardState with all tiles
* set to display mode (fixed, not resizable/draggable).
*/
export function getExportableDashboardState(
  state: DashboardState,
  cols: number
): DashboardState {
  const editOnlyKeys = ['fixed', 'resizable', 'draggable', 'customDragger', 'customResizer'];

  const tiles = state.tiles.map((item) => {
    const layout = Object.fromEntries(
      Object.entries(item[cols]).filter(([key]) => !editOnlyKeys.includes(key))
    );

    return {
      ...item,
      [cols]: layout,
    };
  });

  return {
    ...state,
    tiles,
  };
}