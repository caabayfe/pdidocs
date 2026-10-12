var TelemetryGenericConfigAdaptor = Class.create();
TelemetryGenericConfigAdaptor.prototype = {
    initialize: function() {
        this.telemetryUtils = new TelemetryUtils();
    },

    /**
     * Creates GenericDataConfig from TelemetryDTO
     * @param {TelemetryDTO} telemetryDto - The TelemetryDTO object to convert
     * @returns {GenericDataConfig} - The converted GenericDataConfig
     */
    createGenericDataConfigObject: function(telemetryDto) {
        var genericDataConfig = new GenericDataConfig();
        this._mapPaging(telemetryDto, genericDataConfig);
        // Map TelemetryDTO fields to GenericDataConfig
        this._mapMetricType(telemetryDto, genericDataConfig);
        this._mapProjections(telemetryDto, genericDataConfig);
        this._mapAggregateFunction(telemetryDto, genericDataConfig);
        this._mapGroupBys(telemetryDto, genericDataConfig);
        this._mapOrderBy(telemetryDto, genericDataConfig);
        this._mapFilters(telemetryDto, genericDataConfig);
        this._mapAPIKey(telemetryDto, genericDataConfig);
        this._mapPredicates(telemetryDto, genericDataConfig);
        this._mapLimit(telemetryDto, genericDataConfig);
        this._mapTrendBy(telemetryDto, genericDataConfig);
        return genericDataConfig;
    },

    _mapMetricType: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getMetricType()) {
            genericDataConfig.setMetricType(telemetryDto.getMetricType());
        }
    },

    _mapProjections: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getProjections()?.length > 0) {
            genericDataConfig.setProjections(telemetryDto.getProjections());
        }
    },

    /**
     * Maps aggregate function from TelemetryDTO to GenericDataConfig
     * @param {TelemetryDTO} telemetryDto - Source TelemetryDTO object
     * @param {GenericDataConfig} genericDataConfig - Target GenericDataConfig
     */
    _mapAggregateFunction: function(telemetryDto, genericDataConfig) {
        var aggregateFunction = telemetryDto.getAggregateFunction();
        var aggregateColumn = telemetryDto.getAggregateColumn();
        if (telemetryDto.isCustomPercentile())
            aggregateFunction = 'histogramQuantiles';

        if (aggregateFunction && aggregateColumn)
            genericDataConfig.addAggregate(aggregateFunction, aggregateColumn);

        this._mapRelativeAccuracy(telemetryDto, genericDataConfig);
    },

    /**
     * Maps groupBys from TelemetryDTO to GenericDataConfig
     * @param {TelemetryDTO} telemetryDto - Source TelemetryDTO object
     * @param {GenericDataConfig} genericDataConfig - Target GenericDataConfig
     */
    _mapGroupBys: function(telemetryDto, genericDataConfig) {
        var groupBys = telemetryDto.getGroupBys();
        if (groupBys) {
            for (var i = 0; i < groupBys.length; i++) {
                const groupBy = this.telemetryUtils.transformAttribute(groupBys[i]);
                genericDataConfig.addGroupBy(groupBy);
            }

            if (telemetryDto.getIsShowOther())
                genericDataConfig.setIsShowOther(telemetryDto.getIsShowOther());
        }
    },

    /**
     * Maps sortBy and sortByOrder from TelemetryDTO to GenericDataConfig
     * @param {TelemetryDTO} telemetryDto - Source TelemetryDTO object
     * @param {GenericDataConfig} genericDataConfig - Target GenericDataConfig
     */
    _mapOrderBy: function(telemetryDto, genericDataConfig) {
        var sortBy = telemetryDto.getSortBy();
        var sortByOrder = telemetryDto.getSortByOrder();
        var orderDirection = sortByOrder || 'ASC';
        if (sortBy)
            genericDataConfig.addOrderBy(sortBy, orderDirection);
    },

    /**
     * Maps filters from TelemetryDTO to GenericDataConfig
     * @param {TelemetryDTO} telemetryDto - Source TelemetryDTO object
     * @param {GenericDataConfig} genericDataConfig - Target GenericDataConfig
     */
    _mapFilters: function(telemetryDto, genericDataConfig) {
        // 1. Add serviceName filter if available
        var serviceName = telemetryDto.getServiceName();
        if (serviceName) {
            genericDataConfig.addFilterCondition('ServiceName', 'eq', serviceName);
        }

        // 2. Add metricName filter
        var metricName = telemetryDto.getMetricName();
        if (metricName) {
            genericDataConfig.addFilterCondition('MetricName', 'eq', metricName);
        }

        // 3. Add date range filters (startTime and endTime)
        var startTime = telemetryDto.getStartTime();
        var endTime = telemetryDto.getEndTime();

        // Add the date range filters
        if (startTime) {
            genericDataConfig.addFilterCondition('StartTime', 'gte', startTime);
        }

        if (endTime) {
            genericDataConfig.addFilterCondition('StartTime', 'lte', endTime);
        }

        // Add existing filters from the telemetryDto
        var filters = telemetryDto.getFilters();
        if (filters && Array.isArray(filters) && filters.length > 0) {
            filters.forEach(function(filter) {
                if (filter && filter.operand && filter.operator && filter.value !== undefined
                   && ((Array.isArray(filter.value) && filter.value.length > 0) ||
                       (!Array.isArray(filter.value) && filter.value !== null && filter.value !== ''))) {
                    genericDataConfig.addFilterCondition(filter.operand, filter.operator, filter.value);
                }
            });
        }
    },

    _mapAPIKey: function(telemetryDto, genericDataConfig) {
        if (telemetryDto) {
            const apiKey = new APIKeyBuilder().buildFromDTO(telemetryDto);
            if (apiKey)
                genericDataConfig.setApiKey(apiKey);
        }
    },

    _mapPredicates: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getPredicateComposition())
            genericDataConfig.setPredicates(telemetryDto.getPredicateComposition());
    },

    _mapRelativeAccuracy: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getRelativeAccuracy())
            genericDataConfig.setRelativeAccuracy(telemetryDto.getRelativeAccuracy());

    },

    _mapLimit: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getLimit() > 0)
            genericDataConfig.setLimit(telemetryDto.getLimit());

    },

    _mapTrendBy: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getTrendByInterval())
            genericDataConfig.setRollup(telemetryDto.getTrendByInterval());
    },

    _mapPaging: function(telemetryDto, genericDataConfig) {
        if (telemetryDto.getPageNumber())
            genericDataConfig.setPageNumber(telemetryDto.getPageNumber());
    },

    type: 'TelemetryGenericConfigAdaptor'
};
