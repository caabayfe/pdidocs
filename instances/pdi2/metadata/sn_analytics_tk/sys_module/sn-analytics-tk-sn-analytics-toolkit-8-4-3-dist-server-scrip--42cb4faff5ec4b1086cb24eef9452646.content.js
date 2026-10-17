const SOURCE_TYPES = {
    indicator: 'indicator',
    table: 'table',
    appsee: 'appsee',
};
export const convertVisualizationConfigToVisualizationPropsInternal = (visualizationConfig, additionalProps = {}) => {
    const { appliedMetrics, appliedDimensions = [] } = visualizationConfig;
    if (!appliedMetrics.length) {
        throw new Error('MetricConfigs must not be empty.');
    }
    const metrics = appliedMetrics.map(metricConfig => {
        const measure = metricConfig.appliedMeasure;
        return {
            id: measure.id,
            label: measure.label ?? '',
            dataSource: metricConfig.model.id,
            aggregateFunction: measure.aggregate.function,
            aggregateField: measure.aggregate.field?.name,
        };
    });
    const dataSources = appliedMetrics.map(metricConfig => {
        const { model } = metricConfig;
        if (!model.entities.length) {
            throw new Error('Model must have at least one entity.');
        }
        const entity = model.entities[0];
        if (!entity) {
            throw new Error('Model must have at least one entity.');
        }
        const baseDataSource = {
            id: model.id,
            label: model.label,
            sourceType: entity?.sourceType,
        };
        if (entity.sourceType === SOURCE_TYPES.table) {
            return {
                ...baseDataSource,
                tableOrViewName: entity.details.tableName,
                reportSourceSysId: entity.details.reportSource,
                filterQuery: model.filter?.encodedQuery ?? '',
            };
        }
        return {
            ...baseDataSource,
            uuid: {
                indicator: entity.details.indicator,
                elementFilter: entity.details.elementFilter,
                breakdowns: entity.details.breakdowns,
            },
        };
    });
    const visualizationPropsObj = {
        dataSources,
        metrics,
        sortBy: '',
        sortByOrder: '',
        ...additionalProps,
    };
    const discreteDimensions = appliedDimensions.filter(dimension => dimension.type === 'DISCRETE');
    const groupByProps = discreteDimensions?.map(dim => ({
        maxNumberOfGroups: dim?.groupLimit,
        numberOfGroupsBasedOn: dim?.groupLimitBasedOn
            ? 'NO_OF_GROUP_BASED_ON_FIRST_METRIC'
            : 'NO_OF_GROUP_BASED_ON_PER_METRIC',
        showOthers: dim?.showOthers,
    }))?.[0] ?? {};
    if (dataSources.length > 1) {
        visualizationPropsObj.groupBy = [
            {
                groupBy: appliedMetrics.flatMap(metricConfig => discreteDimensions
                    .filter(dim => dim.metricId === metricConfig.id)
                    .map(dim => ({
                    dataSource: metricConfig.id,
                    groupByField: dim.field.name,
                }))),
                ...groupByProps,
            },
        ];
    }
    else {
        const metricConfig = appliedMetrics[0];
        if (!metricConfig) {
            throw new Error('MetricConfigs must not be empty.');
        }
        visualizationPropsObj.groupBy = discreteDimensions.map(dim => ({
            groupBy: [
                {
                    dataSource: metricConfig.model.id,
                    groupByField: dim.field.name,
                },
            ],
            ...groupByProps,
        }));
    }
    const continuousDimensions = appliedDimensions.filter(dimension => dimension.type === 'CONTINUOUS');
    if (continuousDimensions?.length) {
        const dimension = continuousDimensions[0];
        visualizationPropsObj.trendBy = {
            trendByFields: appliedMetrics.flatMap(metricConfig => appliedDimensions
                .filter(dim => dim.type === 'CONTINUOUS' && dim.metricId === metricConfig.id)
                .map(dim => ({
                metric: metricConfig.appliedMeasure.id,
                field: dim.field.name,
            }))),
            trendByMinuteInterval: dimension?.granularity.intervalCount,
            trendByFrequency: dimension?.granularity.interval || '',
        };
    }
    return visualizationPropsObj;
};
