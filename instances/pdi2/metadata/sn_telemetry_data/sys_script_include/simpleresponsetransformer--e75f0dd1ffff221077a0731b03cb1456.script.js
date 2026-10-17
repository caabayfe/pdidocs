var SimpleResponseTransformer = Class.create();
SimpleResponseTransformer.prototype = {
    initialize: function() {},

    transform: function(data, telemetryDTO) {
        try {
            // Parse data if it's a string
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    gs.error("SimpleResponseTransformer: Error parsing response data: " + e);
                    return this._getErrorResult("Failed to parse response data");
                }
            }
            // Validate required data structure
            if (!data || !data.columns || !data.rows) {
                gs.warn("SimpleResponseTransformer: Invalid response format, missing required fields");
                return this._getErrorResult("Invalid response format");
            }
            // Create result object
            let result = this._getResultObject(telemetryDTO);
            // Extract data from columns and rows
            const columnNames = ["value"];
            let values = [];
            if (data.rows?.length) {
                data.rows.forEach(row => {
                    if (Array.isArray(row) && row.length > 0) {
                        const value = row[0]; // Get first element
                        values.push(Array.isArray(value) ? value[0] : value);
                    }
                });
            }
            // Create the data arrays (keys and values)
            result.response.data = [columnNames, values];
            // Add metadata
            result.response.metadata = this._getMetaData(result.response, telemetryDTO);
            // Add filters
            result.response.filters = this._getFilters(telemetryDTO);
            return result;
        } catch (e) {
            gs.error("SimpleResponseTransformer: Error processing response: " + e);
            return this._getErrorResult("Error processing response");
        }
    },

    _getResultObject: function(telemetryDTO) {
        return {
            order: 0,
            response: {
                data: [],
                filters: {
                    "appliedFilters": [],
                    "notAppliedFilters": []
                },
                metadata: {
                    aggregateBy: 0,
                    aggregate: this._getAggregate(telemetryDTO),
                    format: {
                        frequency: this._getFrequency(),
                        precision: 0,
                        unitFormat: '{0}'
                    }
                }
            }
        };
    },

    _getAggregate: function(telemetryDTO) {
        if (!telemetryDTO) return {};
        try {
            const aggregateFunction = telemetryDTO.getAggregateFunction();
            const metricName = telemetryDTO.getMetricName();
            if (aggregateFunction && metricName) {
                return {
                    function: aggregateFunction,
                    name: metricName,
                    fieldType: 'decimal' // Default field type
                };
            }
        } catch (e) {
            gs.debug("Error getting aggregate: " + e);
        }
        return {};
    },

    _getFrequency: function() {
        // Default frequency value
        return 'daily';
    },

    _getMetaData: function(response, telemetryDTO) {
        const metadata = response.metadata || {};
        try {
            if (telemetryDTO) {
                // Use DTO start and end time if available
                const startTime = telemetryDTO.getStartTime();
                const endTime = telemetryDTO.getEndTime();
                if (startTime && endTime) {
                    metadata.scoreDate = this._formatDateData(startTime, endTime);
                }
                metadata.timeZone = "SESSION";
                // Add metric information if available
                const metricName = telemetryDTO.getMetricName();
                if (metricName) {
                    metadata.metricName = metricName;
                }
                const aggregateFunction = telemetryDTO.getAggregateFunction();
                if (aggregateFunction) {
                    metadata.aggregateFunction = aggregateFunction;
                }
            }

        } catch (e) {
            gs.debug("Error building metadata: " + e);
        }
        return metadata;
    },

    _formatDateData: function(startTime, endTime) {
        try {
            if (startTime && endTime) {
                if (typeof startTime.getLocalDate === 'function' && typeof endTime.getLocalDate === 'function') {
                    const localStartTime = startTime.getLocalDate();
                    const localEndTime = endTime.getLocalDate();
                    return `${localStartTime.getNumericValue()},${localEndTime.getNumericValue()}`;
                }
                return `${startTime},${endTime}`;
            }
        } catch (e) {
            gs.debug("Error formatting date data: " + e);
        }
        return '';
    },

    _getFilters: function(telemetryDTO) {
        const filters = {
            "appliedFilters": telemetryDTO.getAppliedFilters(),
            "notAppliedFilters": telemetryDTO.getNotAppliedFilters()
        };

        //TODO: Uncomment below code if UI needs filters.
        /*
        try {
            if (telemetryDTO) {
                // Get filters from telemetryDTO
                const telemetryFilters = telemetryDTO.getFilters();
                if (telemetryFilters && Array.isArray(telemetryFilters)) {
                    // Process each filter
                    telemetryFilters.forEach(function(filter) {
                        if (filter && filter.operand && filter.operator && filter.value !== undefined) {
                            filters.appliedFilters.push({
                                name: filter.operand,
                                operator: filter.operator,
                                value: filter.value
                            });
                        }
                    });
                }
                // Add service name filter if available
                const serviceName = telemetryDTO.getServiceName();
                if (serviceName) {
                    filters.appliedFilters.push({
                        name: 'ServiceName',
                        operator: 'eq',
                        value: serviceName
                    });
                }
                // Add metric name filter if available
                const metricName = telemetryDTO.getMetricName();
                if (metricName) {
                    filters.appliedFilters.push({
                        name: 'MetricName',
                        operator: 'eq',
                        value: metricName
                    });
                }
                // Add time range filters
                const startTime = telemetryDTO.getStartTime();
                const endTime = telemetryDTO.getEndTime();
                if (startTime) {
                    filters.appliedFilters.push({
                        name: 'timestamp',
                        operator: 'gte',
                        value: startTime
                    });
                }
                if (endTime) {
                    filters.appliedFilters.push({
                        name: 'timestamp',
                        operator: 'lte',
                        value: endTime
                    });
                }
            }
        } catch (e) {
            gs.debug("Error building filters: " + e);
        }
		*/

        return filters;
    },

    _getErrorResult: function(errorMessage) {
        const result = this._getResultObject();
        result.response.error = errorMessage;
        return result;
    },

    updateChangeInMetadata: function(metadata, previousStartTime, previousEndTime) {
        try {
            if (metadata) {
                // Add date metadata if available
                if (previousStartTime && previousEndTime) {
                    metadata.previousScoreDate = this._formatDateData(previousStartTime, previousEndTime);
                }

                const changeData = metadata.changeData;
                // Add change arrow metadata if available
                if (changeData && changeData.change !== null && changeData.change !== undefined) {
                    const change = changeData.change;
                    //let changeArrow = null;
                    //let cssCustomProperty = null;

                    // Determine change direction
                    const changeArrow = !change ? null : (change > 0 ? TelemetryConstants.CHANGE_ARROW.UP : (change < 0 ? TelemetryConstants.CHANGE_ARROW.DOWN : TelemetryConstants.CHANGE_ARROW.NEUTRAL));
                    const cssCustomProperty = changeArrow === TelemetryConstants.CHANGE_ARROW.UP ? TelemetryConstants.CHANGE_ARROW.COLORS.POSITIVE : (changeArrow === TelemetryConstants.CHANGE_ARROW.DOWN ? TelemetryConstants.CHANGE_ARROW.COLORS.NEGATIVE : null);

                    //changeArrow = change > 0 ? "up" : (change < 0 ? "down" : "neutral");
                    //cssCustomProperty = change > 0 ? "positive" : (change < 0 ? "negative" : null);

                    metadata.changeArrow = changeArrow;
                    metadata.changeColor = {
                        defaultColor: "30, 105, 34",
                        cssCustomProperty: cssCustomProperty
                    };
                }
            }
        } catch (error) {
            gs.debug('TelemetryUtils.generateMetadataFromData: Error generating metadata: ' + error.message);
        }

        return metadata;

    },

    type: 'SimpleResponseTransformer'
};
