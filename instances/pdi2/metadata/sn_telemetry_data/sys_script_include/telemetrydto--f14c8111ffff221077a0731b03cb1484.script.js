var TelemetryDTO = Class.create();
TelemetryDTO.prototype = {
    initialize: function() {
        this.serviceName = '';
        this.metricName = '';
        this.metricType = '';
        this.aggregateColumn = '';
        this.aggregateFunction = '';
        this.rollup = '';
        this.dataCategory = '';
        this.dataType = 'observability_data';
        this.groupBys = [];
        this.sortBy = '';
        this.sortByOrder = '';
        this.filters = [];
        this.predicateComposition = {};
        this.startTime = '';
        this.endTime = '';
        this.projections = [];
        this.customPercentile = false;
        this.relativeAccuracy = TelemetryConstants.DEFAULT_RELATIVE_ACCURACY;
        this.limit;
        this.isShowOther = false;
        this.trendByInterval = '';
        this.pageNumber;
        this.appliedFilters = [];
        this.notAppliedFilters = [];
        this.isDARequest = false;
    },

    setServiceName: function(serviceName) {
        this.serviceName = serviceName || '';
    },

    getServiceName: function() {
        return this.serviceName;
    },

    setMetricName: function(metricName) {
        this.metricName = metricName || '';
    },

    getMetricName: function() {
        return this.metricName;
    },

    setMetricType: function(metricType) {
        this.metricType = metricType || '';
    },

    getMetricType: function() {
        return this.metricType;
    },

    setAggregateFunction: function(aggregateFunction) {
        // Validate that the provided value is a valid aggregate function
        aggregateFunction = aggregateFunction.toLowerCase();
        //var validFunctions = this.getValidAggregateFunctions();
        if (aggregateFunction) { // && validFunctions.indexOf(aggregateFunction) !== -1) {
            this.aggregateFunction = aggregateFunction;
        }
    },

    getAggregateFunction: function() {
        return this.aggregateFunction;
    },

    setAggregateColumn: function(aggregateColumn) {
        if (aggregateColumn)
            this.aggregateColumn = aggregateColumn;
    },

    getAggregateColumn: function() {
        return this.aggregateColumn;
    },

    setRollup: function(rollup) {
        this.rollup = rollup || '';
    },

    getRollup: function() {
        return this.rollup;
    },

    setDataCategory: function(dataCategory) {
        this.dataCategory = dataCategory || '';
    },

    getDataCategory: function() {
        return this.dataCategory;
    },

    setDataType: function(dataType) {
        this.dataType = dataType;
    },

    getDataType: function() {
        return this.dataType;
    },

    setGroupBys: function(groupBys) {
        this.groupBys = groupBys || [];
    },

    getGroupBys: function() {
        return this.groupBys;
    },

    setSortBy: function(sortBy) {
        this.sortBy = sortBy || '';
    },

    getSortBy: function() {
        return this.sortBy;
    },

    setSortByOrder: function(sortByOrder) {
        this.sortByOrder = sortByOrder || '';
    },

    getSortByOrder: function() {
        return this.sortByOrder;
    },

    addFilter: function(operand, operator = '=', value) {
        if (!operand || typeof operand !== 'string' || operand.trim().length === 0) {
            throw new Error('Operand must be a non-empty string');
        }

        if (value === null || value === undefined) {
            throw new Error('Value cannot be null or undefined');
        }

        var filterObj = {
            operand: operand.trim(),
            operator: operator.trim(),
            value: value
        };

        this.filters.push(filterObj);
    },

    getFilters: function() {
        return this.filters;
    },

    setPredicateComposition: function(predicateComposition) {
        this.predicateComposition = predicateComposition;
    },

    getPredicateComposition: function() {
        return this.predicateComposition;
    },

    getStartTime: function() {
        return this.startTime;
    },

    setStartTime: function(startTime) {
        this.startTime = startTime;
    },

    getEndTime: function() {
        return this.endTime;
    },

    setEndTime: function(endTime) {
        this.endTime = endTime;
    },

    // Helper method to get all valid aggregate functions
    getValidAggregateFunctions: function() {
        return Object.values(TelemetryConstants.AGGREGATE_FUNCTIONS);
    },

    addProjection: function(projection) {

        if (projection) {
            const entries = Object.entries(projection);

            if (entries.length === 1) {
                const [columnName, alias] = entries[0];
                this.projections.push({
                    field: columnName,
                    alias: alias
                });
            }
        }
    },

    getProjections: function() {
        return this.projections;
    },

    setCustomePercentile: function(value) {
        if (value)
            this.customPercentile = true;
    },

    isCustomPercentile: function() {
        return this.customPercentile;
    },

    setRelativeAccuracy: function(relativeAccuracy) {
        if (relativeAccuracy)
            this.relativeAccuracy = relativeAccuracy;
    },

    getRelativeAccuracy: function() {
        return this.relativeAccuracy;
    },

    setLimit: function(limit) {
        if (limit && limit > 0)
            this.limit = limit;
    },

    getLimit: function() {
        return this.limit;
    },

    setIsShowOther: function(isShowOther) {
        if (isShowOther)
            this.isShowOther = (isShowOther === true || isShowOther === "true");
    },

    getIsShowOther: function() {
        return this.isShowOther;
    },

    setTrendByInterval: function(trendByInterval) {
        this.trendByInterval = trendByInterval;
    },

    getTrendByInterval: function() {
        return this.trendByInterval;
    },

    setPageNumber: function(pageNumber) {
        if (pageNumber && pageNumber > 0)
            this.pageNumber = pageNumber;
    },

    getPageNumber: function() {
        return this.pageNumber;
    },

	addAppliedFilter: function(filter) {
		this.appliedFilters.push(filter);
	},

	getAppliedFilters: function() {
		return this.appliedFilters;
	},

	addNotAppliedFilter: function(filter) {
		this.notAppliedFilters.push(filter);
	},

	getNotAppliedFilters: function() {
		return this.notAppliedFilters;
	},

    setIsDARequest: function(isDARequest) {
        if (isDARequest)
            this.isDARequest = (isDARequest === true || isDARequest === "true");
    },

    getIsDARequest: function() {
        return this.isDARequest;
    },

    toString: function() {
        return JSON.stringify({
            serviceName: this.serviceName,
            metricName: this.metricName,
            metricType: this.metricType,
            aggregateFunction: this.aggregateFunction,
            rollup: this.rollup,
            dataCategory: this.dataCategory,
            groupBys: this.groupBys,
            sortBy: this.sortBy,
            sortByOrder: this.sortByOrder,
            filters: this.filters
        });
    },

    type: 'TelemetryDTO'
};
