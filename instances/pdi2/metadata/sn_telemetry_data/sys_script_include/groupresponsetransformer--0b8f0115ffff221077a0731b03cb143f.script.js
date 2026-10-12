var GroupResponseTransformer = Class.create();
GroupResponseTransformer.prototype = {
    initialize: function() {
        // Initialize any required utilities or constants
    },

    /**
     * Transform group query response data with columns and rows structure
     * @param {Object} response - The raw response containing columns and rows
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object for context
     * @returns {Object} Structured response with data, metadata, and filters
     */
    transform: function(response, telemetryDTO) {
        try {
            let result = this._getResultObject();

            // Validate input
            if (!response || !response.columns || !response.rows) {
                gs.warn('GroupResponseTransformer: Invalid response structure. Expected columns and rows properties.');
                return result;
            }

            result.response = {
                ...result.response,
                data: this._getData(response, telemetryDTO),
                metadata: this._getMetaData(response, telemetryDTO),
                filters: this._getFilters(telemetryDTO)
            };

            return result;
        } catch (error) {
            gs.error('GroupResponseTransformer: Error transforming response - ' + error.message);
            return this._getResultObject();
        }
    },

    /**
     * Process the raw data into structured format with headers and rows
     * @param {Object} response - Response with columns and rows
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @returns {Array} Structured data array with headers as first row
     */
    _getData: function(response, telemetryDTO) {
        const resColumns = response.columns || [];
        const resRows = response.rows || [];
        let data = [];
        var telemetryUtils = new TelemetryUtils();
        if (resColumns.length) {
            // Create headers from column definitions
            const headers = [];

            const groupsBys = telemetryDTO.getGroupBys();
            for (let index = 0; index < groupsBys.length; index++) {
                let group = resColumns[index][0];
                group = telemetryUtils.transformAttribute(group);
                headers.push(group);
            }

            headers.push("value");
            data.push(headers);

            if (resRows?.length)
                data = [...data, ...resRows.map(row => {
                    const newRow = row.slice(0, -1);
                    const value = row[row.length - 1];
                    // Extract first element from array for percentile values
                    newRow.push(Array.isArray(value) ? value[0] : value);
                    return newRow;
                })];
        }

        return data;

    },

    /**
     * Generate metadata for the response
     * @param {Object} response - Response with columns and rows
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @returns {Object} Metadata object
     */
    _getMetaData: function(response, telemetryDTO) {
        const resColumns = response.columns || [];
        const resRows = response.rows || [];

        return {
            groupBy: this._getGroupByMetadata(resColumns, resRows),
            series: this._getSeriesMetadata(resColumns),
            format: this._getFormatMetadata(resColumns),
            aggregateBy: 0,
            timeZone: "SESSION"
        };
    },

    /**
     * Generate group by metadata from columns
     * @param {Array} columns - Array of column definitions
     * @param {Array} rows - Array of data rows
     * @returns {Array} Group by metadata array
     */
    _getGroupByMetadata: function(columns, rows) {
        const groupByMetadata = [];
        const resRows = rows || [];
        var telemetryUtils = new TelemetryUtils();

        // Get group by values map for all columns
        const groupValuesMap = this._getGroupByValues(columns, resRows);

        // Process all columns except the last one (which is typically the value column)
        for (let i = 0; i < columns.length - 1; i++) {
            const [columnName, dataType] = columns[i];
            const sanitizedName = this._sanitizeColumnName(columnName);
            const transformedId = telemetryUtils.transformAttribute(columnName);

            groupByMetadata.push({
                fieldType: dataType ? this._mapDataType(dataType) : 'string',
                id: transformedId,
                label: sanitizedName,
                series: this._getGroupBySeries(sanitizedName),
                elements: this._getGroupByElements(groupValuesMap, columnName, i)
            });
        }

        return groupByMetadata;
    },

    /**
     * Generate series metadata
     * @param {Array} columns - Array of column definitions
     * @returns {Array} Series metadata array
     */
    _getSeriesMetadata: function(columns) {
        const series = [];

        if (columns.length > 0) {
            const lastColumn = columns[columns.length - 1];
            const [columnName, dataType] = lastColumn;

            series.push({
                id: "value",
                label: this._sanitizeColumnName(columnName),
                type: "value"
            });
        }

        return series;
    },

    /**
     * Generate format metadata
     * @param {Array} columns - Array of column definitions
     * @returns {Object} Format metadata
     */
    _getFormatMetadata: function(columns) {
        return {
            frequency: "daily",
            unitFormat: "{0}",
            precision: 0
        };
    },

    /**
     * Get filters object (placeholder for future filter support)
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @returns {Object} Filters object
     */
    _getFilters: function(telemetryDTO) {
        return {
            appliedFilters: telemetryDTO.getAppliedFilters(),
            notAppliedFilters: telemetryDTO.getNotAppliedFilters()
        };
    },

    /**
     * Sanitize column names by converting underscores to readable labels
     * @param {String} columnName - Original column name
     * @returns {String} Sanitized column name
     */
    _sanitizeColumnName: function(columnName) {
        if (!columnName) return '';

        // Convert patterns like "NumberAttributes__http__response__status_code" to "Http Response Status Code"
        return columnName
            .replace(/^[^_]*__/, '') // Remove prefix before double underscore
            .replace(/__/g, ' ') // Replace double underscores with spaces
            .replace(/_/g, ' ') // Replace single underscores with spaces
            .replace(/\b\w/g, function(letter) {
                return letter.toUpperCase(); // Capitalize first letter of each word
            });
    },

    /**
     * Get unique values for each group by column from the response data
     * @param {Array} columns - Array of column definitions
     * @param {Array} rows - Array of data rows
     * @returns {Object} Map of column names to their unique values
     */
    _getGroupByValues: function(columns, rows) {
        const groupValuesMap = {};

        // Initialize map for each column (except the last value column)
        for (let i = 0; i < columns.length - 1; i++) {
            const columnName = columns[i][0];
            if (!groupValuesMap[columnName]) {
                groupValuesMap[columnName] = new Set();
            }
        }

        // Collect unique values for each column
        for (let i = 0; i < columns.length - 1; i++) {
            const columnName = columns[i][0];
            rows.forEach(row => {
                groupValuesMap[columnName].add(row[i]);
            });
        }

        return groupValuesMap;
    },

    /**
     * Generate elements array for a specific group by field with proper boolean and empty value handling
     * @param {Object} groupValuesMap - Map of column names to their unique values
     * @param {String} columnName - The column name to process
     * @param {Number} columnIndex - The column index for reference
     * @returns {Array} Array of element objects with id, label, and eventData
     */
    _getGroupByElements: function(groupValuesMap, columnName, columnIndex) {
        const elements = [];
        const uniqueKeys = new Set();

        if (!groupValuesMap[columnName]) {
            // If no values found, return empty element
            const element = {
                id: '',
                label: '',
                eventData: {}
            };
            elements.push(element);
        } else {
            for (let value of groupValuesMap[columnName]) {
                // Handle boolean values - convert undefined/null to '(empty)' and ensure string conversion
                if (columnName.includes('Boolean')) {
                    value = (value === undefined || value === null) ? '(empty)' : String(value);
                }

                // Handle empty values - convert falsy values to '(empty)'
                value = value ? value : '(empty)';

                // Avoid duplicates using Set
                if (!uniqueKeys.has(value)) {
                    uniqueKeys.add(value);
                    const element = {
                        id: value,
                        label: value,
                        eventData: {}
                    };
                    elements.push(element);
                }
            }
        }

        return elements;
    },

    /**
     * Generate series metadata for a group by field
     * @param {String} fieldLabel - The field label
     * @returns {Array} Series array with single value series
     */
    _getGroupBySeries: function(fieldLabel) {
        const series = [];
        const seriesObject = {
            id: "value",
            label: fieldLabel || "value",
            type: "value"
        };
        series.push(seriesObject);
        return series;
    },

    /**
     * Map ClickHouse data types to UI field types
     * @param {String} dataType - ClickHouse data type
     * @returns {String} Mapped field type
     */
    _mapDataType: function(dataType) {
        if (!dataType) return 'string';

        const lowerType = dataType.toLowerCase();
        if (lowerType.includes('int') || lowerType.includes('float') || lowerType.includes('double')) {
            return 'number';
        }
        if (lowerType.includes('bool')) {
            return 'boolean';
        }
        if (lowerType.includes('date') || lowerType.includes('time')) {
            return 'datetime';
        }
        return 'string';
    },

    /**
     * Get the base result object structure
     * @returns {Object} Base result object
     */
    _getResultObject: function() {
        return {
            order: 0,
            response: {
                data: [],
                filters: {
                    appliedFilters: [],
                    notAppliedFilters: []
                },
                metadata: {
                    aggregateBy: 0,
                    format: {
                        unitFormat: '{0}',
                        precision: 0
                    },
                    groupBy: [],
                    timeZone: "SESSION"
                }
            }
        };
    },

    type: 'GroupResponseTransformer'
};
