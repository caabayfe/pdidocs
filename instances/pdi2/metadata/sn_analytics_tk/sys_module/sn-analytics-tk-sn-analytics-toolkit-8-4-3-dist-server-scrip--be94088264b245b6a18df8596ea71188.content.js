const createUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${random}`;
};
/**
 * Converts a visualization data configuration item to a MetricConfiguration object
 * that can be used by the analytics toolkit.
 *
 */
export const toMetricConfigurationInternal = (configuration) => {
    const id = configuration.metricId || `metric-${createUniqueId()}`;
    const aggregateFunction = configuration.aggregateFunction || 'COUNT';
    const { aggregateField } = configuration;
    const appliedMeasure = {
        id: `measure-${id}`,
        aggregate: {
            ...(aggregateField
                ? {
                    field: {
                        id: aggregateField,
                        name: aggregateField,
                        entityId: configuration.tableOrViewName,
                    },
                }
                : {}),
            function: aggregateFunction,
        },
        isExpression: false,
    };
    if (configuration.sourceType !== 'table') {
        throw new Error(`Unsupported source type: ${configuration.sourceType}`);
    }
    const model = {
        id: `model-${id}`,
        name: configuration.tableOrViewName,
        filter: {
            encodedQuery: configuration.filterQuery || '',
        },
        entities: [
            {
                id: configuration.tableOrViewName,
                name: configuration.tableOrViewName,
                label: configuration.tableOrViewLabel ||
                    configuration.label ||
                    configuration.tableOrViewName,
                sourceType: configuration.sourceType,
                details: {
                    tableName: configuration.tableOrViewName,
                },
            },
        ],
    };
    return {
        id,
        label: configuration.label,
        appliedMeasure,
        model,
        version: '1.0',
    };
};
/**
 * Converts an array of visualization data configurations to a single VisualizationConfiguration
 * that can be used by the analytics toolkit.
 */
export const convertDataConfigurationsToVisualizationPropsInternal = (configurations) => {
    const metrics = configurations.map(config => toMetricConfigurationInternal(config));
    // Create dimensions from all configurations
    const appliedDimensions = configurations.flatMap((config, configIndex) => {
        if (!metrics[configIndex]) {
            throw new Error('Invalid MetricConfiguration');
        }
        const metricId = metrics[configIndex].id;
        const dimensions = [];
        // Add dimensions from groupBy fields
        const groupByArray = Array.isArray(config.groupBy)
            ? config.groupBy
            : config.groupBy
                ? [config.groupBy]
                : [];
        groupByArray
            .filter(field => field && field.length > 0)
            .forEach((field, index) => {
            dimensions.push({
                id: `dimension-${metricId}-${index}`,
                metricId,
                field: {
                    id: field,
                    name: field,
                    entityId: config.tableOrViewName,
                },
                type: 'DISCRETE',
                showOthers: config.showOther,
                groupLimit: config.numberOfGroups,
                groupLimitBasedOn: config.numberOfGroupsBasedOn,
            });
        });
        // Add trendBy as a dimension if it exists and is not empty
        if (config.trendBy && config.trendBy.length > 0) {
            dimensions.push({
                id: `dimension-${metricId}-trend`,
                metricId,
                field: {
                    id: config.trendBy,
                    name: config.trendBy,
                    entityId: config.tableOrViewName,
                },
                type: 'CONTINUOUS',
                granularity: {
                    interval: config?.trendInterval?.toLowerCase() || 'date', // default to 'date' if trendInterval is not provided
                    ...(config.trendMinuteInterval
                        ? { intervalCount: config.trendMinuteInterval }
                        : {}),
                    calendar: 'standard', // there is also `business` calendar, but we do not have that in configuration
                },
            });
        }
        return dimensions;
    });
    const vizTitle = configurations.find(config => config.label)?.label;
    return {
        id: `vis-${createUniqueId()}`,
        label: vizTitle,
        appliedMetrics: metrics,
        appliedDimensions,
    };
};
