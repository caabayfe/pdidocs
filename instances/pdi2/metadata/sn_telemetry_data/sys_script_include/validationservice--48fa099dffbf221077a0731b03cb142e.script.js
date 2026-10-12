var ValidationService = Class.create();
ValidationService.prototype = {
    initialize: function() {
        this.telemetryUtils = new TelemetryUtils();
    },

    /**
     * Validates an TelemetryDTO object
     * @param {TelemetryDTO} telemetryDto - The DTO to validate
     * @returns {Boolean} - True if valid, false otherwise
     */
    validate: function(telemetryDto) {
        if (!telemetryDto) {
            gs.error("ValidateService: TelemetryDTO is null or undefined");
            return false;
        }

        // Check required fields
        if (!this._validateRequiredFields(telemetryDto)) {
            return false;
        }

        // Check data types
        if (!this._validateDataTypes(telemetryDto)) {
            return false;
        }

        // Check aggregation compatibility
        if (!this._validateAggregationCompatibility(telemetryDto)) {
            return false;
        }

        // Check "showOthers" prop for trendBy with groupBy visualization
        if (!this._validateShowOtherPropForTrend(telemetryDto)) {
            return false;
        }

        return true;
    },

    /**
     * Validates required fields in the TelemetryDTO
     * @param {TelemetryDTO} telemetryDto - The DTO to validate
     * @returns {Boolean} - True if all required fields are present, false otherwise
     * @private
     */
    _validateRequiredFields: function(telemetryDto) {
        // Check that at least serviceName and metricName are provided
        if (!telemetryDto.getServiceName()) {
            gs.error("ValidateService: serviceName is required");
            return false;
        }

        if (!telemetryDto.getMetricName()) {
            gs.error("ValidateService: metricName is required");
            return false;
        }

        return true;
    },

    /**
     * Validates data types in the TelemetryDTO
     * @param {TelemetryDTO} telemetryDto - The DTO to validate
     * @returns {Boolean} - True if all fields have correct data types, false otherwise
     * @private
     */
    _validateDataTypes: function(telemetryDto) {
        // Check that groupBys is an array
        var groupBys = telemetryDto.getGroupBys();
        if (groupBys && !Array.isArray(groupBys)) {
            gs.error("ValidateService: groupBys must be an array");
            return false;
        }

        // Check that filters is an array with valid structure
        var filters = telemetryDto.getFilters();
        if (filters) {
            if (!Array.isArray(filters)) {
                gs.error("ValidateService: filters must be an array");
                return false;
            }

            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if (!filter.operand || !filter.operator || filter.value === undefined) {
                    gs.error("ValidateService: filter is missing required fields");
                    return false;
                }
            }
        }

        return true;
    },

    /**
     * Validates that the aggregateFunction is compatible with the metricType
     * @param {TelemetryDTO} telemetryDto - The Telemetry DTO object
     * @return {Boolean} - True if valid, false otherwise
     * @private
     */
    _validateAggregationCompatibility: function(telemetryDto) {
        var aggregateFunction = telemetryDto.getAggregateFunction();
        var metricType = telemetryDto.getMetricType();

        // Ensure aggregateFunction is valid
        //var aggregateFunction = telemetryDto.getAggregateFunction();
        // Bypass validation check if date category is list or aggregateFunction is percentile-based functions (p50, p90, p99, etc.)
        if (telemetryDto.getDataCategory() === TelemetryConstants.DATA_CATEGORY.LIST || this.telemetryUtils.isPercentile(aggregateFunction)) {
            return true;
        }

        var validFunctions = telemetryDto.getValidAggregateFunctions();
        if (!aggregateFunction || validFunctions.indexOf(aggregateFunction) === -1) {
            gs.error("ValidateService: Invalid aggregate function: " + aggregateFunction);
            throw new Error('Please provide or configure the valid aggregate function in Metric.');
        }

        //Validate the aggregate function is its DA request
        if (telemetryDto.getIsDARequest()) {
            var result = this.telemetryUtils.getAggregations(aggregateFunction, metricType);
            if (!(result.aggregateFunction && result.aggregateColumn))
                throw new Error(`Unsupported aggregate function ${aggregateFunction} for metric type : ${metricType}. Please configure appropriate aggregation in metric.`);
        }

        return true;
    },

    _validateShowOtherPropForTrend: function(telemetryDto) {
        if (telemetryDto.getDataCategory() === TelemetryConstants.DATA_CATEGORY.TREND && telemetryDto.getGroupBys()?.length && telemetryDto.getIsShowOther()) {
            var errorMessage = gs.getMessage("'Show Other' is not supported for trendBy with groupBy configuration. Please disable the option.");
            throw new Error(errorMessage);
        }
        return true;
    },

    /**
     * Validates an TelemetryDTO object
     * @param {TelemetryDTO} telemetryDto - The DTO to validate
     * @returns {Boolean} - True if valid, false otherwise
     */
    validateMetadata: function(telemetryDto) {
        // Check that at least serviceName is provided
        if (!telemetryDto.getServiceName()) {
            gs.error("ValidateService: serviceName is required");
            return false;
        }

        return true;
    },

    type: 'ValidationService'
};
