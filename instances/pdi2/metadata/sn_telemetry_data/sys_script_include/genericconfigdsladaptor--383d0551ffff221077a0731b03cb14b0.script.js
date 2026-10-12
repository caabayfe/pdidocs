var GenericConfigDSLAdaptor = Class.create();
GenericConfigDSLAdaptor.prototype = {
    initialize: function() {
        this.telemetryUtils = new TelemetryUtils();
    },

    /**
     * Convert a GenericDataConfig object to DSL format
     * @param {Object} genericDataConfig - The GenericDataConfig object to convert
     * @return {Object} - The DSL object
     */
    convert: function(genericDataConfig) {
        if (!genericDataConfig) {
            gs.error('GenericDSLAdapter.convert: genericDataConfig is null or undefined');
            return null;
        }
        try {
            //TODO: Correct the condition
            var metricType = genericDataConfig.getMetricType() ? "telemetry_" + genericDataConfig.getMetricType() : '';
            var rollup = genericDataConfig.getRollup();
            var dsl = {
                query: {
                    projection: []
                }
            };
            if (rollup) {
                dsl.query.type = {
                    [metricType]: {
                        rollup: rollup
                    }
                };
            } else {
                dsl.query.type = metricType;
            }

            this._addProjections(dsl.query, genericDataConfig);
            this._addGrouping(dsl.query, genericDataConfig);
            this._addAggregates(dsl.query, genericDataConfig);
            this._addFilters(dsl.query, genericDataConfig);
            this._addOrdering(dsl.query, genericDataConfig);
            if (this._isEmpty(genericDataConfig.getGroupBys())) {
                this._addLimitAndOffset(dsl, genericDataConfig);
            }
            return dsl;
        } catch (e) {
            gs.error('Error in GenericDSLAdapter.convert: ' + e.message);
            return null;
        }
    },

    /**
     * Add projection fields to the DSL query
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addProjections: function(query, genericDataConfig) {
        var projections = genericDataConfig.getProjections();
        if (!projections || projections.length === 0) {
            return;
        }
        for (var i = 0; i < projections.length; i++) {
            var proj = projections[i];
            // Handle regular field projections
            if (proj.field) {
                var projObj = {};
                if (proj.alias) {
                    projObj[proj.field] = proj.alias;
                } else {
                    projObj = proj.field;
                }
                query.projection.push(projObj);
            }
        }
    },

    /**
     * Add aggregate functions to the DSL query
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addAggregates: function(query, genericDataConfig) {
        var aggregates = genericDataConfig.getAggregates();
        if (!aggregates || aggregates.length === 0) {
            return;
        }
        for (var i = 0; i < aggregates.length; i++) {
            var agg = aggregates[i];

            if (agg.aggregateFunction && agg.aggregateColumn) {
                let aggregateFunction = agg.aggregateFunction;
                let aggregateColumn = agg.aggregateColumn;
                // Use the TelemetryUtils.getAggregations method to get the configured aggregations
                var result = this.telemetryUtils.getAggregations(aggregateFunction, genericDataConfig.getMetricType());
                aggregateFunction = result.aggregateFunction ? result.aggregateFunction : aggregateFunction;
                aggregateColumn = result.aggregateColumn ? result.aggregateColumn : aggregateColumn;
                let alias = aggregateColumn ? this.telemetryUtils.sanitizeColumnAlias(aggregateColumn) : agg.alias;
                if (alias == aggregateColumn) {
                    alias = alias + '_1'; // If alias is same as column name, append _1 to it
                }
                agg.alias = alias;
                // Special handling for histogramQuantiles with percentile values
                if (aggregateFunction === "histogramQuantiles") {
                    var percentileMatch = aggregateColumn.match(/P(\d+)/i);
                    if (percentileMatch) {
                        var percentValue = parseInt(percentileMatch[1], 10) / 100; // Convert P90 to 0.9
                        var funcName = this._getDSLFunction(aggregateFunction);
                        var projObj = {
                            [funcName]: {
                                "field": "Quantiles",
                                "relative_accuracy": genericDataConfig.getRelativeAccuracy(), //TODO: Move default accuracy value to property. Also, prefer the value set by user.
                                "percent": [percentValue]
                            }
                        };

                        // Add alias if provided
                        if (alias) {
                            projObj.alias = alias;
                        }

                        query.projection.push(projObj);
                        continue; // Skip the standard processing below
                    }
                }

                // Map function to supported DSL function
                funcName = this._getDSLFunction(aggregateFunction);
                if (!funcName) {
                    gs.warn('GenericDSLAdapter: Skipping unsupported aggregate function: ' + aggregateFunction);
                    continue;
                }
                var aggObj = {};
                aggObj[funcName] = aggregateColumn;
                // Add alias if provided
                if (alias) {
                    aggObj.alias = alias;
                }
                query.projection.push(aggObj);
            }
        }
    },

    /**
     * Add filters to the DSL query, handling nested logic and combinations
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addFilters: function(query, genericDataConfig) {
        var filters = genericDataConfig.getFilterConditions();
        if (!filters || this._isEmpty(filters)) {
            return;
        }

        var processedFilters = this._processFilterNode(filters);
        if (Object.keys(genericDataConfig.getPredicates()).length > 0)
            processedFilters.push(genericDataConfig.getPredicates());

        if (processedFilters && !this._isEmpty(processedFilters)) {
            query.filter = {
                $and: processedFilters
            };
        }
    },

    /**
     * Recursively process filter nodes to handle nested logical operators
     * @param {Object|Array} filterNode - The filter node to process
     * @return {Object} - The processed filter node in DSL format
     * @private
     */
    _processFilterNode: function(filterNode) {
        // Handle array of filter objects with field, operator, value format
        var conditions = [];
        if (Array.isArray(filterNode)) {
            for (var i = 0; i < filterNode.length; i++) {
                var filter = filterNode[i];
                // Process each filter object that has field, operator, value structure
                if (filter && filter.field && filter.operator && filter.value !== undefined) {
                    var processedCondition = this._processSingleFilter(filter);
                    if (processedCondition !== null && !this._isEmpty(processedCondition)) {
                        conditions.push(processedCondition);
                    }
                }
            }
        }
        return conditions;
    },

    /**
     * Process a single filter object with field, operator, value format
     * @param {Object} filter - Filter object with field, operator, value properties
     * @return {Object} - Processed filter in DSL format
     * @private
     */
    _processSingleFilter: function(filter) {
        if (!filter || !filter.field || !filter.operator) {
            return null;
        }
        var mappedOp = this._getSupportedOperator(filter.operator);
        if (!mappedOp) {
            gs.warn('GenericConfigDSLAdaptor: Skipping unsupported operator: ' + filter.operator);
            return null; // Unsupported operator
        }
        var result = {};
        var fieldCondition = {};
        fieldCondition[mappedOp] = filter.value;
        result[filter.field] = fieldCondition;
        return result;
    },

    /**
     * Add grouping fields to the DSL query
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addGrouping: function(query, genericDataConfig) {
        // Only apply grouping if there are aggregates
        var aggregates = genericDataConfig.getAggregates();
        if (!aggregates || aggregates.length === 0) {
            return;
        }

        // First try to get explicit grouping fields
        var groupBy = genericDataConfig.getGroupBys();
        var projections = genericDataConfig.getProjections();
        var isExplicitGroupBy = groupBy && groupBy.length > 0; // Track if groupBy is explicit
        var rollup = genericDataConfig.getRollup();

        // If groupBy is present, ensure all groupBy fields are in projections
        if (isExplicitGroupBy) {
            var projectionMap = {};

            if (projections && projections.length > 0) {
                // Create a map of existing projections
                for (var j = 0; j < projections.length; j++) {
                    var projection = projections[j];
                    if (projection.field) {
                        projectionMap[projection.field] = true;
                        if (projection.alias) {
                            projectionMap[projection.alias] = true;
                        }
                    }
                }
            }

            // Add groupBy fields to projections if not already present
            for (var k = 0; k < groupBy.length; k++) {
                if (groupBy[k]) {
                    var groupField = String(groupBy[k]);
                    if (!projectionMap[groupField]) {
                        var projObj = {};
                        projObj[groupField] = new TelemetryUtils().sanitizeColumnAlias(groupField);
                        query.projection.push(projObj);
                    }
                }
            }
        }

        // If no explicit grouping, generate from projections 
        // (excluding aggregates which are never part of grouping)
        if (!isExplicitGroupBy) {
            if (projections && projections.length > 0) {
                groupBy = [];
                for (var i = 0; i < projections.length; i++) {
                    var proj = projections[i];
                    // Only add field-based projections to group by
                    if (proj.field) {
                        // Use alias if provided, otherwise use field name
                        groupBy.push(proj.alias || proj.field);
                    }
                }
            }
        }

        if (groupBy && groupBy.length > 0) {
            // Handle isShowOther logic - transform groupBy[0] into object with name, others, max_groups
            if (isExplicitGroupBy && !rollup) {
                query.group = groupBy.slice(); // Copy the entire array
                query.group[0] = {
                    "name": this.telemetryUtils.sanitizeColumnAlias(groupBy[0]),
                    "others": genericDataConfig.getIsShowOther(),
                    "max_groups": genericDataConfig.getLimit()
                };
            } else {
                query.group = groupBy;
            }
        }
    },

    /**
     * Add ordering fields and sort direction to the DSL query
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addOrdering: function(query, genericDataConfig) {
        var orderBy = genericDataConfig.getOrderBys();

        // Apply default ordering based on aggregation when:
        // 1. GroupBy is present
        // 2. No explicit orderBy is specified
        if (this._isEmpty(orderBy) && !this._isEmpty(genericDataConfig.getGroupBys())) {
            query.order = [];
            var aggregates = genericDataConfig.getAggregates();
            if (!this._isEmpty(aggregates)) {
                // Use the first aggregate column for ordering
                var firstAgg = aggregates[0];
                if (firstAgg && firstAgg.alias) {
                    const orderObj = {};
                    orderObj[firstAgg.alias] = 'desc'; // Default to descending order for aggregates
                    query.order.push(orderObj);
                    return;
                }
            }
        }

        // Process explicit order fields if present
        if (!this._isEmpty(orderBy)) {
            query.order = [];
            
            // Build a map of valid columns from aggregations and projections
            var validColumns = this._getValidOrderColumns(genericDataConfig);
            
            for (var i = 0; i < orderBy.length; i++) {
                var orderField = orderBy[i];
                if (!orderField || !orderField.column) {
                    continue;
                }

                const orderObj = {};
                const sortOrder = (orderField.order || 'desc').toLowerCase();
                var columnToUse = orderField.column;

                // Check if the specified column exists in aggregations or projections
                if (!validColumns.hasOwnProperty(orderField.column)) {
                    // Fallback to first aggregation alias if available
                    var aggregates = genericDataConfig.getAggregates();
                    if (!this._isEmpty(aggregates)) {
                        var firstAgg = aggregates[0];
                        if (firstAgg && firstAgg.alias) {
                            columnToUse = firstAgg.alias;
                        }
                    }
                }

                // Create order object with determined column and sort direction
                orderObj[columnToUse] = sortOrder;
                query.order.push(orderObj);
            }
        }
    },

    /**
     * Get valid columns for ordering from aggregations and projections
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @return {Object} - Map of valid column names that can be used for ordering
     * @private
     */
    _getValidOrderColumns: function(genericDataConfig) {
        var validColumns = {};
        
        // Add aggregation aliases to valid columns
        var aggregates = genericDataConfig.getAggregates();
        if (!this._isEmpty(aggregates)) {
            for (var i = 0; i < aggregates.length; i++) {
                var agg = aggregates[i];
                if (agg && agg.alias) {
                    validColumns[agg.alias] = true;
                }
            }
        }
        
        // Add projection column names to valid columns
        var projections = genericDataConfig.getProjections();
        if (!this._isEmpty(projections)) {
            for (var j = 0; j < projections.length; j++) {
                var proj = projections[j];
                if (proj && proj.field) {
                    // Add the actual column name that will appear in the result
                    // If alias exists, use alias; otherwise use field name
                    var columnName = proj.alias || proj.field;
                    validColumns[columnName] = true;
                }
            }
        }
        
        return validColumns;
    },

    /**
     * Add limit and offset to the DSL query
     * @param {Object} query - The DSL query object
     * @param {Object} genericDataConfig - The GenericDataConfig object
     * @private
     */
    _addLimitAndOffset: function(dsl, genericDataConfig) {
        var limit = genericDataConfig.getLimit();
        if (limit > 0) {
            dsl.query["paging"] = {
                "limit": parseInt(limit, 10)
            };
            var pageNumber = genericDataConfig.getPageNumber();
            if (pageNumber && pageNumber > 0) {
                var skip = (parseInt(pageNumber, 10) - 1) * limit;
                dsl.query.paging.skip = skip;
            }
        }

        var offset = genericDataConfig.getOffset();
        if (offset) {
            dsl.query.offset = parseInt(offset, 10);
        }
    },

    /**
     * Get the supported DSL operator for a given operator string
     * @param {string} op - The operator to map
     * @return {string|null} - The mapped DSL operator or null if unsupported
     * @private
     */
    _getSupportedOperator: function(op) {
        if (!op) {
            return null;
        }
        // If already in DSL format (starts with $)
        if (op.indexOf('$') === 0) {
            return GenericConfigDSLAdaptor.ALLOWED_OPERATORS[op] ? op : null;
        }
        // Otherwise map from standard operator format
        var mappedOp = GenericConfigDSLAdaptor.OPERATOR_MAP[op];
        return mappedOp && GenericConfigDSLAdaptor.ALLOWED_OPERATORS[mappedOp] ? mappedOp : null;
    },

    /**
     * Get the DSL function name for a given function string
     * @param {string} func - The function name to convert to DSL format
     * @return {string|null} - The DSL function name or null if unsupported
     * @private
     */
    _getDSLFunction: function(func) {
        if (!func) {
            return null;
        }
        // If already in DSL format with $ prefix
        if (func.indexOf('$') === 0) {
            // Verify it's in the allowed functions list
            return GenericConfigDSLAdaptor.ALLOWED_FUNCTIONS.hasOwnProperty(func.toLowerCase()) ? func.toLowerCase() : null;
        }

        // Ensure the reverse lookup map is initialized
        this._initializeFunctionLookup();

        // Convert to DSL format and verify it's supported
        return GenericConfigDSLAdaptor.FUNCTION_TO_DSL[func.toLowerCase()] || null;
    },

    /**
     * Lazy initialization of the function-to-DSL reverse lookup map
     * This approach is safer for ServiceNow script includes than IIFE
     * @private
     */
    _initializeFunctionLookup: function() {
        if (GenericConfigDSLAdaptor.FUNCTION_TO_DSL === null) {
            GenericConfigDSLAdaptor.FUNCTION_TO_DSL = {};
            for (var dslFunc in GenericConfigDSLAdaptor.ALLOWED_FUNCTIONS) {
                var actualFunc = GenericConfigDSLAdaptor.ALLOWED_FUNCTIONS[dslFunc];
                GenericConfigDSLAdaptor.FUNCTION_TO_DSL[actualFunc] = dslFunc;
            }
        }
    },


    /**
     * Check if an object is empty
     * @param {Object} obj - The object to check
     * @return {boolean} - True if the object is empty
     * @private
     */
    _isEmpty: function(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    },

    type: 'GenericConfigDSLAdaptor'
};

// Static class-level constants - shared across all instances
GenericConfigDSLAdaptor.ALLOWED_OPERATORS = {
    '$eq': true,
    '$neq': true,
    '$gt': true,
    '$gte': true,
    '$lt': true,
    '$lte': true,
    '$like': true,
    '$ilike': true,
    '$not': true,
    '$in': true,
    '$between': true,
    '$and': true,
    '$or': true
};

GenericConfigDSLAdaptor.ALLOWED_FUNCTIONS = {
    '$count': 'count',
    '$sum': 'sum',
    '$avg': 'avg',
    '$unique': 'uniq',
    '$quantile': 'quantile',
    '$histogramQuantiles': 'histogramquantiles',
    '$startOfDay': 'toStartOfDay',
    '$startOfWeek': 'toMonday',
    '$startOfMonth': 'toStartOfMonth',
    '$startsWith': 'startsWithUTF8',
    '$toHour': 'toHour',
    '$min': 'min',
    '$max': 'max',
    '$toDurationBucket': 'toDurationBucket',
    '$toGroupArray': 'groupUniqArray',
    '$hasAny': 'hasAny',
    '$hasAll': 'hasAll',
    '$isNull': 'isNull',
    '$isNotNull': 'isNotNull',
    '$hasProperty': 'mapContains',
    '$uniqueDivide': 'divide',
    '$divide': 'divide',
    '$countIf': 'countIf',
    '$sumIf': 'sumIf'
};

GenericConfigDSLAdaptor.ALLOWED_ORDER_FUNCTIONS = {
    '$toLower': 'lower'
};

GenericConfigDSLAdaptor.OPERATOR_MAP = {
    'eq': '$eq',
    'neq': '$neq',
    'gt': '$gt',
    'gte': '$gte',
    'lt': '$lt',
    'lte': '$lte',
    'like': '$like',
    'ilike': '$ilike',
    'in': '$in',
    'between': '$between',
    'is': '$eq',
    'on': '$eq',
    'not': '$not',
    'contains': '$like'
};

// Lazy-initialized reverse lookup - safer for ServiceNow script includes
GenericConfigDSLAdaptor.FUNCTION_TO_DSL = null;
