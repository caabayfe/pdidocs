var GenericDataConfig = Class.create();
GenericDataConfig.prototype = {
    initialize: function() {
        this.projections = []; // selected columns
        this.aggregates = []; // aggregate function
        this.filterConditions = []; // filter condition/where clause
        this.havingConditions = []; // having condition
        this.groupBys = []; // group By Condition
        this.orderBys = []; // order By Condition
        this.limit; // limit condition
        this.offset = "";
        this.apiKey = "";
        this.predicates = {}; // variable predicates
        this.metricType = '';
        this.relativeAccuracy;
        this.telemetryUtils = new TelemetryUtils();
        this.isShowOther = false;
        this.rollup = "";
        this.pageNumber;
    },

    getConfigObject: function() {
        return this.config;
    },

    _buildAggregate: function(aggregateFunction, aggregateColumn) {
        return {
            aggregateFunction: aggregateFunction,
            aggregateColumn: aggregateColumn,
            alias: this.telemetryUtils.sanitizeColumnAlias(aggregateColumn)
        };
    },

    _buildQuery: function(field, operator, value) {
        return {
            field: field,
            operator: operator,
            value: value
        };
    },

    _buildHavingQuery: function(operand, operator, value) {
        return {
            operand: operand,
            operator: operator,
            value: value
        };
    },

    setProjections: function(projections) {
        if (projections && Array.isArray(projections) && projections.length > 0)
            this.projections = projections;
    },

    addProjection: function(projection) {
        this.projections.push(projection);
    },

    getProjections: function() {
        return this.projections;
    },

    addAggregate: function(aggregateFunction, aggregateColumn) {
        this.aggregates.push(this._buildAggregate(aggregateFunction, aggregateColumn));
    },

    getAggregates: function() {
        return this.aggregates;
    },

    addFilterCondition: function(field, operator, value) {
        this.filterConditions.push(this._buildQuery(field, operator, value));
    },

    getFilterConditions: function() {
        return this.filterConditions;
    },

    addHavingCondition: function(operand, operator, value) {
        this.havingConditions.push(this._buildHavingQuery(operand, operator, value));
    },

    getHavingConditions: function() {
        return this.havingConditions;
    },

    addGroupBy: function(groupBy) {
        this.groupBys.push(groupBy);
    },

    getGroupBys: function() {
        return this.groupBys;
    },

    addOrderBy: function(column, order) {
        this.orderBys.push({
            column: column,
            order: order
        });
    },

    getOrderBys: function() {
        return this.orderBys;
    },

    setLimit: function(limit) {
        this.limit = limit;
    },

    getLimit: function() {
        return this.limit;
    },

    setOffset: function(offset) {
        this.offset = offset;
    },

    getOffset: function() {
        return this.offset;
    },

    setApiKey: function(key) {
        this.apiKey = key;
    },

    getApiKey: function() {
        //TODO: Remove this hardcode logic. Its added for testing flow.
        //return "testApiKey1"; //this.apiKey;
        return this.apiKey;
    },

    setPredicates: function(predicates) {
        this.predicates = predicates;
    },

    getPredicates: function() {
        return this.predicates;
    },

    setMetricType: function(metricType) {
        this.metricType = metricType;
    },

    getMetricType: function() {
        return this.metricType;
    },

    setRelativeAccuracy: function(relativeAccuracy) {
        if (relativeAccuracy)
            this.relativeAccuracy = relativeAccuracy;
    },

    getRelativeAccuracy: function() {
        return this.relativeAccuracy;
    },

    setIsShowOther: function(isShowOther) {
        this.isShowOther = isShowOther;
    },

    getIsShowOther: function() {
        return this.isShowOther;
    },

    setRollup: function(rollup) {
        this.rollup = rollup;
    },

    getRollup: function() {
        return this.rollup;
    },

    setPageNumber: function(pageNumber) {
        this.pageNumber = pageNumber;
    },

    getPageNumber: function() {
        return this.pageNumber;
    },

    type: 'GenericDataConfig'
};
