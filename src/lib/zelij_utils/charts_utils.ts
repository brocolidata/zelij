import { getDataByQuery } from "./duckdb";

export const aggregationOptions = [
    { label: "Sum", value: "sum" },
    { label: "Count", value: "count" },
    { label: "Average", value: "avg" },
    { label: "Min", value: "min" },
    { label: "Max", value: "max" }
];

export async function fetchColumnOptions(tableName) {
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
    if (mainDimension && mainMetric?.column && !secondaryDimension  && secondaryMetrics.length === 0) {
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
    mainDimension?: string;
    secondaryDimension?: string;
    mainMetric?: Metric;
    secondaryMetrics?: Metric[];
};

export function buildChartQuery(
    {
        dataset,
        mainDimension,
        secondaryDimension,
        mainMetric,
        secondaryMetrics = [],
        orderByColumn,
        orderByType,
    }: QueryParams,
    filters: { column: string; value: any }[] = [],
): string {
    if (!dataset || !mainMetric?.column) return "-- Invalid configuration";

    const hasMainDim = !!mainDimension;
    const hasSecondaryDim = !!secondaryDimension;
    const mainAgg = mainMetric.aggregation.toLowerCase();
    let whereClause = "";
    if (filters && filters.length > 0) {
        const conditions = filters.map(
            (f) => `${f.column} = '${f.value}'`
        );
        whereClause = `WHERE ${conditions.join(" AND ")}`;
    }

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
        console.log('debug selectParts', selectParts);
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

export function buildOptionsFromUI({
    mainDimension,
    secondaryDimension,
    mainDimensionType,
    secondaryDimensionType,
    mainMetric,
    secondaryMetrics,
    seriesList,
    dimensionOnXAxis,
    chartProperties,
    theme = 'light' // default to light mode
}) {
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
            name: yAxisField
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
            selectedMode: 'single',
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
      const query: string = chartConfiguration.configuration?.query ?? '';
      const match = query.match(/from\s+([`"]?[\w.]+[`"]?)/i); // capture table after FROM
  
      if (match && match[1]) {
        return match[1].replace(/[`"]/g, ''); // remove backticks/quotes
      }
    }
  
    return null;
  }