import { getDataByQuery } from "./duckdb";
import { getDatasetColumns } from "./stores";

export const aggregationOptions = [
    { label: "Sum", value: "sum" },
    { label: "Count", value: "count" },
    { label: "Average", value: "avg" },
    { label: "Min", value: "min" },
    { label: "Max", value: "max" }
];


export function getDataSourceOptions(data_sources) {
    return data_sources.map((source) => ({
        label: source.label,
        value: source.name,
    }));
}

export function getDataColumnsOptions(chartDataColumns) {
    return chartDataColumns.map((col) => ({
        label: col,
        value: col,
    }));
}

export function inferSeries({
    mainDimension,
    secondaryDimension,
    mainMetric,
    secondaryMetrics,
    columns
}) {
    // Case 1: Main dimension and main metric (optional secondary metrics)
    if (mainDimension && mainMetric?.column && !secondaryDimension && secondaryMetrics.length === 0) {
        console.log('inferSeries Case 1');
        return [{
            column: `${mainMetric.aggregation}_${mainMetric.column.replace(/\s/g, "_")}`,
            type: "bar", // or another chart type depending on preference
        }];
    }

    // Case 2: Main dimension, secondary dimension, and main metric (pivoted by secondary dimension)
    if (mainDimension && secondaryDimension && mainMetric?.column) {
        console.log('inferSeries Case 2');
        return columns
            .filter((col) => col !== mainDimension && col !== secondaryDimension)
            .map((col) => ({
                column: col,
                type: "bar", // or another chart type depending on preference
            }));
    }

    // Case 3: Main dimension, main metric, and secondary metrics (one series per secondary metric)
    if (mainDimension && mainMetric?.column && secondaryMetrics.length > 0) {
        console.log('inferSeries Case 3');
        return [mainMetric, ...secondaryMetrics]
            .filter((m) => m?.column)
            .map((m) => ({
                column: `${m.aggregation}_${m.column}`,
                type: "bar", // you can customize the type if needed
            }));
    }

    return [];
}

type Metric = {
    column: string;
    aggregation: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
}

type QueryParams = {
    dataset: string;
    dimensions: {
        main: string, secondary: string
    }; 
    metrics: {
        main: Metric;
        secondary?: Metric[];
    };
};

function getWhereClauseForUI(
    filters: { column: string; value: any }[],
    datasetColumns: { label: string, value: string, type: string }[]
) {
    let whereClause = ''; // Initialize whereClause

    if (filters && filters.length > 0) {
        // 1. Group filters by column
        const groupedFilters = {};
        filters.forEach(filter => {
            const column = filter.column;
            const value = filter.value;
            if (!groupedFilters[column]) {
                groupedFilters[column] = new Set(); // Use a Set to store unique values for each column
            }
            groupedFilters[column].add(value);
        });

        // 2. Build conditions based on grouped filters
        const conditions = [];
        for (const column in groupedFilters) {
            if (groupedFilters.hasOwnProperty(column)) {
                const values = Array.from(groupedFilters[column]); // Convert Set to Array

                // Find the column type from your datasetColumns array
                const columnObj = datasetColumns.find(
                    ({ value }) => value === column
                );
                const columnType = columnObj ? columnObj.type : 'VARCHAR'; // Default to VARCHAR if type not found

                if (values.length === 1) {
                    // Single value: use "="
                    const value = values[0];
                    if (columnType === "TIMESTAMP_NS") {
                        conditions.push(`"${column}" = epoch_ms(${value})`);
                    } else {
                        conditions.push(`"${column}" = '${value}'`);
                    }
                } else if (values.length > 1) {
                    // Multiple values: use "IN"
                    const formattedValues = values.map(value => {
                        if (columnType === "TIMESTAMP_NS") {
                            return `epoch_ms(${value})`;
                        } else {
                            return `'${value}'`;
                        }
                    });
                    conditions.push(`"${column}" IN (${formattedValues.join(", ")})`);
                }
                // If values.length is 0, no condition is added for this column
            }
        }

        if (conditions.length > 0) {
            whereClause = `WHERE ${conditions.join(" AND ")}`;
        }
    }
    return whereClause;
}

export function buildChartQuery(
    {
        dataset,
        dimensions,
        metrics,
        orderByColumn,
        orderByType,
    }: QueryParams,
    datasetColumns: { label: string, value: string, type: string }[] = [],
    filters: { column: string; value: any }[] = [],
): string {
    if (!dataset || !metrics.main?.column) return "-- Invalid configuration";
    const mainDimension = dimensions?.main;
    const secondaryDimension = dimensions?.secondary;
    const mainMetric = metrics.main;
    const secondaryMetrics = metrics?.secondary || [];

    const hasMainDim = !!mainDimension;
    const hasSecondaryDim = !!secondaryDimension;
    const mainAgg = mainMetric.aggregation.toLowerCase();

    const whereClause = getWhereClauseForUI(filters, datasetColumns);

    // CASE 1: Pivot table
    if (hasMainDim && hasSecondaryDim) {
        const orderByStatement = `ORDER BY "${orderByColumn}" ${orderByType}`;
        return `
            WITH filtered as (
                SELECT * FROM ${dataset}
                ${whereClause}
            )
            PIVOT filtered
            ON "${secondaryDimension}"
            USING ${mainAgg}("${mainMetric.column}")
            GROUP BY "${mainDimension}"
            ${orderByColumn ? orderByStatement : ""}
        `.trim();
    }

    // CASE 2: Grouped aggregation by main dimension
    if (hasMainDim && !hasSecondaryDim) {
        const metrics = [mainMetric, ...secondaryMetrics].filter(
            m => m.column && m.aggregation
        );
        const selectParts = [
            `"${mainDimension}"`,
            ...metrics.map(
                m => `${m.aggregation.toLowerCase()}("${m.column}") AS ${m.aggregation.toLowerCase()}_${m.column.replace(/\s/g, "_")}`
            )
        ];
        const orderByStatement = `ORDER BY "${orderByColumn}" ${orderByType}`;
        return `
            SELECT
                ${selectParts.join(",\n  ")}
            FROM ${dataset}
            ${whereClause}
            GROUP BY "${mainDimension}"
            ${orderByColumn ? orderByStatement : ""}
        `.trim();
    }

    // CASE 3: No dimension, simple aggregation
    const orderByStatement = `ORDER BY "${orderByColumn}" ${orderByType}`;
    return `
        SELECT ${mainAgg}("${mainMetric.column}") AS ${mainAgg}_${mainMetric.column}
        FROM ${dataset}
        ${whereClause}
        ${orderByColumn ? orderByStatement : ""}
    `.trim();
}


export async function runChartQuery(chartQuery) {
    try {
        const arrowTable = await getDataByQuery(chartQuery);
        const columns = arrowTable.schema.fields.map((field) => field.name);
        const rawRows = arrowTable.toArray();
        const rows = rawRows.map((row) => {
            const rowData = {};
            columns.forEach((col, index) => {
                rowData[col] = row[col];
            });
            return rowData;
        });
        return { columns: columns, rows: rows };
    } catch (error) {
        console.error("Error executing query:", error);
        return { columns: [], rows: [] };
    }
}

export function getColumnType(datasetName, columnName) {
    console.log('DEBUG getColumnType | datasetName: ', datasetName);
    console.log('DEBUG getColumnType | columnName: ', columnName);
    const datasetColumns = getDatasetColumns(datasetName);
    if (!datasetColumns) {
        return undefined;
    }
    const column = datasetColumns.find(col => col.value === columnName);
    return column ? column.type : undefined;
}

export function buildOptionsFromUI({
    dataset,
    dimensions,
    metrics,
    seriesList,
    dimensionOnXAxis,
    chartProperties,
    theme = 'light' // default to light mode
}) {
    const mainDimension = dimensions?.main;
    const secondaryDimension = dimensions?.secondary;
    const mainDimensionType = getColumnType(dataset, mainDimension);
    const secondaryDimensionType = getColumnType(dataset, secondaryDimension);
    const mainMetric = metrics.main;
    const secondaryMetrics = metrics?.secondary || [];
    if (!mainDimension || !mainMetric || !seriesList) {
        return {};
    }

    const xAxisField = dimensionOnXAxis ? mainDimension : mainMetric.column;
    const yAxisField = dimensionOnXAxis ? mainMetric.column : mainDimension;

    // Define theme-aware selection style
    const selectItemStyle = {
        borderColor: theme === 'dark' ? '#fff' : '#000',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
    };
    let dimensionAxisType;
    if (["VARCHAR", "BIGINT", "DOUBLE"].includes(mainDimensionType)) {
        dimensionAxisType = "category";
    } else if (["TIMESTAMP_NS"].includes(mainDimensionType)) {
        dimensionAxisType = "time";
    } else {
        dimensionAxisType = "value";
    };

    return {
        dataset: {
            // The `source` will be injected separately in the component
        },
        grid: {
            containLabel: true,
            left: 2
        },
        title: {
            text: chartProperties?.chartLabel || '',
            subtext: chartProperties?.chartDescription || '',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: 'bottom'
        },
        xAxis: {
            type: dimensionOnXAxis ? 'value' : dimensionAxisType,
            name: xAxisField
        },
        yAxis: {
            type: dimensionOnXAxis ? dimensionAxisType : 'value',
            name: yAxisField,
            axisLabel: {
                width: 200
            }
        },
        series: seriesList.map((series) => ({
            type: series.type || 'bar',
            name: series.column,
            encode: {
                x: dimensionOnXAxis ? series.column : mainDimension,
                y: dimensionOnXAxis ? mainDimension : series.column,
            },
            select: {
                itemStyle: selectItemStyle
            },
            selectedMode: 'multiple',
            emphasis: {
                focus: 'self'
            }
        })),
        ...(
            dimensionAxisType === "time" ? {
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0,
                        end: 10
                    },
                    {
                        start: 0,
                        end: 10
                    }
                ],
            } : {}
        ),
    };
}

export function extractDatasetFromChartConfiguration(chartConfiguration: any): string | null {

    if (!chartConfiguration?.type) return null;

    if (chartConfiguration.type === 'ui') {
        return chartConfiguration.configuration?.dataset ?? null;
    }

    if (chartConfiguration.type === 'advanced') {
        const query: string = chartConfiguration.configuration?.sqlQuery ?? '';
        const match = query.match(/from\s+([`"]?[\w.]+[`"]?)/i); // capture table after FROM

        if (match && match[1]) {
            return match[1].replace(/[`"]/g, ''); // remove backticks/quotes
        }
    }

    return null;
}

function formatValueForSql(value, type) {
    switch (type.toUpperCase()) {
        case 'VARCHAR':
        case 'TEXT':
        case 'DATE':
        case 'DATETIME':
        case 'TIMESTAMP':
            return `'${String(value).replace(/'/g, "''")}'`; // Escape single quotes
        case 'INTEGER':
        case 'NUMERIC':
        case 'DECIMAL':
        case 'FLOAT':
        case 'DOUBLE':
            return String(value);
        default:
            // Default to string formatting for unknown types
            return `'${String(value).replace(/'/g, "''")}'`;
    }
};

export function addWhereStatement(
    query: string,
    datasetColumns: { label: string, value: string, type: string }[] = [],
    filters: { column: string; value: any }[] = [],
): string {
    // Regular expression to find the table name after 'FROM' or 'JOIN'
    // This regex tries to capture the first table name it encounters after FROM or JOIN.
    // It's a simplification and might not work for all complex SQL queries (e.g., subqueries in FROM).
    const fromRegex = /(?:FROM|JOIN)\s+([a-zA-Z0-9_`"\[\]\.]+)/i;
    const match = query.match(fromRegex);

    if (!match || !match[1]) {
        console.error("Could not extract table name from the original query. Please ensure it contains a 'FROM' or 'JOIN' clause with a clear table name.");
        return query; // Return original query if table name cannot be extracted
    }

    const originalTableName = match[1];
    const cteName = 'filtered_data'; // Name for the Common Table Expression

    // Group filters by column
    const groupedFilters: { [key: string]: Set<any> } = {};
    if (filters && filters.length > 0) {
        filters.forEach(filter => {
            const column = filter.column;
            const value = filter.value;
            if (!groupedFilters[column]) {
                groupedFilters[column] = new Set(); // Use a Set to store unique values
            }
            groupedFilters[column].add(value);
        });
    }

    // Build the WHERE clause from the grouped filters
    const newWhereClauses: string[] = [];
    for (const column in groupedFilters) {
        if (Object.prototype.hasOwnProperty.call(groupedFilters, column)) {
            const values = Array.from(groupedFilters[column]); // Convert Set to Array

            // Find column info by value (which is the column name in this context)
            const columnInfo = datasetColumns.find(col => col.value === column);
            const columnType = columnInfo ? columnInfo.type : 'VARCHAR'; // Default to VARCHAR if type not found

            if (values.length === 1) {
                // If only one value, use '='
                const formattedValue = formatValueForSql(values[0], columnType);
                newWhereClauses.push(`${column} = ${formattedValue}`);
            } else if (values.length > 1) {
                // If multiple values, use 'IN'
                const formattedValues = values.map(value => formatValueForSql(value, columnType));
                newWhereClauses.push(`${column} IN (${formattedValues.join(', ')})`);
            }
            // If values.length is 0, no clause is added for this column
        }
    }

    const newWhereClauseString = newWhereClauses.length > 0 ? ` WHERE ${newWhereClauses.join(' AND ')}` : '';

    // Check if the original query already has a WHERE clause
    const hasExistingWhere = /WHERE/i.test(query);

    let finalCteWhereClause = '';

    if (newWhereClauses.length > 0) {
        // If there are new filters to apply
        if (hasExistingWhere) {
            // If original query has WHERE, extract it and combine with new filters
            // This regex captures everything after the first 'WHERE' keyword (case-insensitive)
            const existingWhereContentRegex = /WHERE\s+(.*)/is;
            const existingWhereMatch = query.match(existingWhereContentRegex);
            let existingConditions = '';
            if (existingWhereMatch && existingWhereMatch[1]) {
                existingConditions = existingWhereMatch[1].trim();
            }

            if (existingConditions) {
                finalCteWhereClause = ` WHERE (${existingConditions}) AND (${newWhereClauses.join(' AND ')})`;
            } else {
                finalCteWhereClause = ` WHERE ${newWhereClauses.join(' AND ')}`;
            }
        } else {
            // No existing WHERE, just add the new filters
            finalCteWhereClause = ` WHERE ${newWhereClauses.join(' AND ')}`;
        }
    } else if (hasExistingWhere) {
        // If no new filters, but there's an existing WHERE, retain it for the CTE
        const existingWhereContentRegex = /WHERE\s+(.*)/is;
        const existingWhereMatch = query.match(existingWhereContentRegex);
        if (existingWhereMatch && existingWhereMatch[1]) {
            finalCteWhereClause = ` WHERE ${existingWhereMatch[1].trim()}`;
        }
    }


    // Construct the CTE
    // The CTE will now include the combined WHERE clause
    const cte = `WITH ${cteName} AS (\n  SELECT *\n  FROM ${originalTableName}${finalCteWhereClause}\n)`;

    // Remove the original WHERE clause from the main query if it exists,
    // as its conditions are now handled within the CTE.
    let modifiedQueryWithoutOriginalWhere = query.replace(/\s+WHERE\s+.*$/is, '');

    // Replace the original table name with the CTE name in the query
    // We only replace the first occurrence to avoid issues with table names appearing in column aliases or other parts.
    const modifiedQuery = modifiedQueryWithoutOriginalWhere.replace(originalTableName, cteName);

    // Prepend the CTE to the modified query
    return `${cte}\n${modifiedQuery}`;
}