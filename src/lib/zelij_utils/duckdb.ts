import { base } from '$app/paths';
import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

import { getDataSources } from './zelij_config';
import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';

let db: AsyncDuckDB | null = null;

const instantiateDuckDb = (() => {
    let dbPromise: Promise<AsyncDuckDB> | null = null;

    return async () => {
        if (db) return db;
        if (dbPromise) return dbPromise;

        const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
            mvp: {
                mainModule: duckdb_wasm,
                mainWorker: mvp_worker,
            },
            eh: {
                mainModule: duckdb_wasm_eh,
                mainWorker: eh_worker,
            },
        };

        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const logger = new duckdb.ConsoleLogger();
        const worker = new Worker(bundle.mainWorker!);

        dbPromise = new Promise(async (resolve, reject) => {
            try {
                db = new duckdb.AsyncDuckDB(logger, worker);
                await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
                resolve(db);
            } catch (err) {
                reject(err);
            }
        });

        return dbPromise;
    };
})();

export async function queryData(tableName) {
    try {
        console.log(`Querying ${tableName}...`);
        const db = await instantiateDuckDb();
        const conn = await db.connect();
        const results = await conn.query(`SELECT * FROM ${tableName}`);
        await conn.close();
        console.log('Logging results', results);
        return results;
    } catch (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw error;
    }
}

export async function getDataByQuery(query) {
    try {
        console.log('Running the following query:', query);
        const db = await instantiateDuckDb();
        const conn = await db.connect();
        const results = await conn.query(query);
        await conn.close();
        console.log('Logging results', results);
        return results;
    } catch (error) {
        console.error('Error when running query:', error);
        throw error;
    }
}

async function createTable(data_source) {
    try {
        const tableName = data_source.name;
        const filePath = `data/${data_source.path}`;
        console.log(`Loading ${tableName} from ${filePath}`);
        const db = await instantiateDuckDb();
        await db.registerFileURL(`${tableName}.parquet`, `${base}/${filePath}`, 4, false);
        const conn = await db.connect();
        await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM parquet_scan('${tableName}.parquet')`);
        await conn.close();
        console.log(`Successfully loaded ${tableName}`);
    } catch (error) {
        console.error(`Error loading table ${data_source.name}:`, error);
        throw error;
    }
}

export async function uploadParquetToTable(parquetFile, tableName) {
    try {
        
        console.log(`Loading ${tableName} uploaded by user`);
        const db = await instantiateDuckDb();
        await db.registerFileHandle(parquetFile.name, parquetFile, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
        const conn = await db.connect();
        await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM parquet_scan('${parquetFile.name}')`);
        await conn.close();
        console.log(`Successfully loaded ${tableName}`);
    } catch (error) {
        console.error(`Error loading table ${tableName}:`, error);
        throw error;
    }
}

export async function loadData() {
    const data_sources = getDataSources();
    try {
        for (const data_source of data_sources) {
            await createTable(data_source);
        }
        console.log("All data_sources loaded successfully.");
    } catch (error) {
        console.error("Error loading data_sources:", error);
        throw error;
    }
}

export function initializeApp() {
    return new Promise((resolve, reject) => {
        loadData()
            .then(() => {
                console.log("Data loading completed.");
                resolve();
            })
            .catch((error) => {
                console.error("Data loading failed:", error);
                reject(error);
            });
    });
}

export async function loadDataSync() {
    try {
        await initializeApp();
        console.log("App is ready for user interaction.");
        return true;
        // Initialize UI or other components here.
    } catch (error) {
        console.error("Failed to initialize app:", error);
    }
}

export async function fetchTableColumns(tableName: string) {
    try {
        const arrowTable = await getDataByQuery(`DESCRIBE ${tableName}`);
        const results = arrowTable.toArray();
        return results.map((col) => ({
            label: col.column_name,
            value: col.column_name,
            type: col.column_type
        }));
    } catch (err) {
        console.error("Failed to fetch column names:", err);
        return [];
    }
}


export async function getRowCount(tableName: string) {
    if (!tableName) {
        throw new Error("Table name must be provided to getRowCount.");
    }
    try {
        // Construct the COUNT(*) query. Double-quote the table name for safety.
        const countQuery = `SELECT COUNT(*) AS ROW_COUNT FROM "${tableName}";`;

        // Use the existing getDataByQuery function
        const arrowTable = await getDataByQuery(countQuery);

        // Extract the count value from the Arrow Table
        // The result of COUNT(*) will be a single row, single column Arrow Table
        // if (arrowTable && arrowTable.numRows > 0 && arrowTable.schema.fields.length > 0) {
        if (arrowTable && arrowTable.numRows > 0 && arrowTable.schema.fields.length > 0) {
            // Get the value from the first row, first column
            const count = arrowTable.get(0)["ROW_COUNT"];
            return Number(count); // Ensure it's returned as a number
        } else {
            console.warn(`No count returned for table: ${tableName}. Query result was:`, arrowTable);
            return 0; // Return 0 if no results or empty table
        }
    } catch (error) {
        console.error(`Error getting row count for table ${tableName}:`, error);
        throw error; // Re-throw to allow error handling in the calling component
    }
}

function buildOrderByClause(sortingState) {
    if (!sortingState || sortingState.length === 0) {
        return ""; // No sorting applied
    }

    const orderByParts = sortingState.map(sort => {
        const direction = sort.desc ? "DESC" : "ASC";
        // Ensure column names are properly quoted if they contain spaces or special characters
        // For DuckDB, often just enclosing in double quotes is sufficient.
        return `"${sort.id}" ${direction}`;
    });

    return `ORDER BY ${orderByParts.join(", ")}`;
}

function buildSelectClause(columnVisibility) {
    const excludedColumns = [];

    // Iterate through the columnVisibility object
    for (const columnName in columnVisibility) {
        // Ensure it's an own property, not from the prototype chain
        if (Object.prototype.hasOwnProperty.call(columnVisibility, columnName)) {
            if (columnVisibility[columnName] === false) {
                // If the column is marked as false (should be excluded),
                // add its name to the list, double-quoted for DuckDB safety.
                excludedColumns.push(`"${columnName}"`);
            }
        }
    }
    
    if (excludedColumns.length === 0) {
        return "SELECT *";
    } else {
        // Otherwise, use the EXCLUDE syntax
        const excludedColumnsString = excludedColumns.join(", ");
        return `SELECT * EXCLUDE(${excludedColumnsString})`;
    }
}

export async function paginateData(tableName, columnVisibility, pagination, sorting) {
    try {
        const orderByClause = buildOrderByClause(sorting);
        const offsetClause = pagination.pageIndex * pagination.pageSize;
        const selectClause = buildSelectClause(columnVisibility);
        const limitClause = pagination.pageSize;        
        const sqlQuery = `
            ${selectClause}
            FROM "${tableName}"
            ${orderByClause}
            LIMIT ${limitClause}
            OFFSET ${offsetClause};
        `;
        const results = await getDataByQuery(sqlQuery);
        return results;
    } catch (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw error;
    }
}