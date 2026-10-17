var TrendResponseTransformer = Class.create();
TrendResponseTransformer.prototype = {
    initialize: function() {
        this.currentColumns = null;
        this.currentColumnIndices = null;
    },

    transform: function(response, telemetryDTO) {
        try {
            // Validate input data structure
            if (!response || !response.columns || !response.rows) {
                return this._getErrorResult("Invalid response format");
            }

            let result = this._getResultObject();

            result.response = {
                ...result.response,
                data: this._getData(response, telemetryDTO),
                metadata: this._getMetaData(telemetryDTO, response),
                filters: this._getFilters(telemetryDTO)
            };

            return result;
        } catch (error) {
            gs.error('TrendResponseTransformer: Error transforming response - ' + error.message);
            return this._getErrorResult('Error transforming trend data: ' + error.message);
        }
    },

    /**
     *
     * @param {Object} response - ClickHouse response with columns and rows
     * @param {TelemetryDTO} telemetryDTO - Telemetry DTO with configuration
     * @return {Array} - Array of arrays with header and data rows
     * @private
     */
    _getData: function(response, telemetryDTO) {
        // Check if groupBy is defined in telemetryDTO
        let groupBys = telemetryDTO.getGroupBys();

        if (groupBys && groupBys.length > 0) {
            return this._getGroupedData(response, telemetryDTO);
        } else {
            return this._getSimpleData(response, telemetryDTO);
        }
    },


    _getGroupedData: function(response, telemetryDTO) {
        // Extract unique group values and validate
        let groupBys = this._extractUniqueGroupValues(response);
        if (groupBys.length === 0) {
            return [];
        }

        // Store groupBys in response for metadata generation
        response.groupBys = groupBys;

        // Create headers with generic value names
        let headers = this._createGroupedHeaders(groupBys);

        // Process rows into grouped data structure
        let data = this._processRowsIntoGroups(response.rows, groupBys);

        // Add headers at the beginning
        data.unshift(headers);

        // Handle missing date ranges for grouped data
        return this._updateMissingDateRangeGrouped(data, telemetryDTO);
    },

    /**
     * Extract unique group values from ClickHouse response
     * @param {Object} response - ClickHouse response with rows
     * @return {Array} - Array of unique group values
     * @private
     */
    _extractUniqueGroupValues: function(response) {
        const columnIndices = this._findColumnIndices(response.columns);
        // Store column info for use in other functions
        this.currentColumns = response.columns;
        this.currentColumnIndices = columnIndices;

        const groupBySet = new Set();

        response.rows.forEach(row => {
            const rawGroupValue = row[columnIndices.groupByIndex];
            const groupValue = (rawGroupValue === "" || rawGroupValue === null || rawGroupValue === undefined) ?
                TelemetryConstants.UNKNOWN_GROUP_VALUE :
                rawGroupValue.toString();

            groupBySet.add(groupValue);
        });

        return Array.from(groupBySet);
    },

    /**
     * Dynamically find column indices based on column metadata
     * @param {Array} columns - ClickHouse columns array
     * @return {Object} - Object with timeIndex, valueIndex, groupByIndex
     * @private
     */
    _findColumnIndices: function(columns) {
        if (columns.length === 0) {
            return {
                timeIndex: -1,
                valueIndex: -1,
                groupByIndex: -1
            };
        }

        // Predictable structure with ordered data: [StartTime, GroupColumn, Count]
        return {
            timeIndex: 0, // Always StartTime
            valueIndex: columns.length - 1, // Always Count (last column)
            groupByIndex: 1 // Always the group column (middle)
        };
    },

    /**
     * Create headers with generic value names
     * @param {Array} groupBys - Array of unique group values
     * @return {Array} - Header array with generic names
     * @private
     */
    _createGroupedHeaders: function(groupBys) {
        let headers = [TelemetryConstants.TIMESTAMP];
        for (let i = 0; i < groupBys.length; i++) {
            headers.push(TelemetryConstants.VALUE + i);
        }
        return headers;
    },

    /**
     * Process rows into grouped data structure
     * @param {Array} rows - ClickHouse response rows
     * @param {Array} groupBys - Array of unique group values
     * @return {Array} - Processed data rows
     * @private
     */
    _processRowsIntoGroups: function(rows, groupBys) {

        // First pass: Group all rows by timestamp
        let timestampMap = this._groupRowsByTimestamp(rows);

        // Second pass: Convert to array format with proper ordering
        return this._convertTimestampMapToArrays(timestampMap, groupBys);
    },

    /**
     * Group rows by timestamp into a map structure
     * @param {Array} rows - ClickHouse response rows
     * @return {Object} - Map with timestamp as key and group values as nested object
     * @private
     */
    _groupRowsByTimestamp: function(rows) {
        const {
            timeIndex,
            valueIndex,
            groupByIndex
        } = this.currentColumnIndices;

        return rows.map(row => {
            const timestamp = row[timeIndex];
            const rawValue = row[valueIndex];
            const rawGroup = row[groupByIndex];

            // Normalize group value
            const group = (rawGroup === "" || rawGroup === null || rawGroup === undefined) ?
                TelemetryConstants.UNKNOWN_GROUP_VALUE :
                rawGroup.toString();

            // Handle quantiles arrays - extract first element if array
            const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

            return {
                timestamp,
                group,
                value
            };
        }).reduce((timestampMap, {
            timestamp,
            group,
            value
        }) => {
            // Initialize timestamp group if needed
            if (!timestampMap[timestamp]) {
                timestampMap[timestamp] = {};
            }

            timestampMap[timestamp][group] = value;
            return timestampMap;
        }, {});
    },

    /**
     * Convert timestamp map to array format - data pre-sorted by ClickHouse
     * @param {Object} timestampMap - Map with datetime string as key and group values
     * @param {Array} groupBys - Array of unique group values for ordering
     * @return {Array} - Array of data rows with datetime strings and group values
     * @private
     */
    _convertTimestampMapToArrays: function(timestampMap, groupBys) {
        let data = [];

        // Data is pre-sorted (desc order), just use keys as-is
        let timestamps = Object.keys(timestampMap);

        for (let i = 0; i < timestamps.length; i++) {
            let dateTimeStr = timestamps[i];
            let rowData = this._buildGroupedDataRow(dateTimeStr, timestampMap[dateTimeStr], groupBys);
            data.push(rowData);
        }

        return data;
    },

    /**
     * Build a single grouped data row with datetime string and group values - FIXED
     * @param {String} dateTimeStr - Datetime string "2025-09-12 06:00:00"
     * @param {Object} groupData - Object with group values for this timestamp
     * @param {Array} groupBys - Array of unique group values for ordering
     * @return {Array} - Single row with datetime string and group values in order
     * @private
     */
    _buildGroupedDataRow: function(dateTimeStr, groupData, groupBys) {
        const values = groupBys.map(group => {
            return groupData[group] || 0;
        });
        values.unshift(dateTimeStr);
        return values;
    },

    /**
     * Update missing date ranges for grouped data
     * @param {Array} groupedData - Array with headers and data rows
     * @param {TelemetryDTO} telemetryDTO - Telemetry DTO with configuration
     * @return {Array} - Updated array with missing dates filled
     * @private
     */
    _updateMissingDateRangeGrouped: function(groupedData, telemetryDTO) {
        if (groupedData.length < 2) {
            return groupedData;
        }

        let headers = groupedData[0];
        let dataRows = groupedData.slice(1);
        let numGroups = headers.length - 1;

        // Extract date range from existing data
        let dateRange = this._extractDateRangeFromGroupedData(dataRows, telemetryDTO);

        // Create lookup map for existing data
        let existingDataMap = this._createGroupedDataMap(dataRows);

        // Fill missing dates and return complete data
        return this._fillMissingGroupedDates(headers, dateRange, existingDataMap, numGroups);
    },

    /**
     * Extract date range from grouped data rows - SIMPLIFIED LIKE SIMPLE DATA
     * @param {Array} dataRows - Data rows (excluding headers) with datetime strings
     * @param {TelemetryDTO} telemetryDTO - Telemetry DTO with configuration
     * @return {Array} - Array of datetime strings for complete range
     * @private
     */
    _extractDateRangeFromGroupedData: function(dataRows, telemetryDTO) {
        let startDate, endDate;

        if (dataRows.length > 0) {
            // Backend returns data in DESC order (newest first, oldest last)
            endDate = dataRows[0][0]; // First row = latest timestamp
            startDate = dataRows[dataRows.length - 1][0]; // Last row = earliest timestamp
        }

        let trendInterval = telemetryDTO && telemetryDTO.getTrendByInterval() || TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR;
        let rangeStartDate = telemetryDTO && telemetryDTO.getStartTime() || startDate;
        let rangeEndDate = telemetryDTO && telemetryDTO.getEndTime() || endDate;

        return this.generateDateRange(rangeStartDate, rangeEndDate, trendInterval);
    },

    /**
     * Convert a data row from datetime string to milliseconds timestamp
     * @param {Array} row - Row with datetime string as first element
     * @return {Array} - Row with milliseconds timestamp as first element
     * @private
     */
    _convertRowToMilliseconds: function(row) {
        let dateTimeStr = row[0];
        let timestamp = this._dateStringToMilliseconds(dateTimeStr);
        return [timestamp.toString()].concat(row.slice(1));
    },


    /**
     * Create lookup map for existing grouped data by timestamp
     * @param {Array} dataRows - Data rows (excluding headers)
     * @return {Object} - Map with timestamp as key and row as value
     * @private
     */
    _createGroupedDataMap: function(dataRows) {
        let existingDataMap = {};
        for (let i = 0; i < dataRows.length; i++) {
            let row = dataRows[i];
            existingDataMap[row[0]] = row; // Key is timestamp in milliseconds as string
        }
        return existingDataMap;
    },

    /**
     * Fill missing dates in grouped data with zero values
     * @param {Array} headers - Header row
     * @param {Array} dateRange - Complete date range (datetime strings)
     * @param {Object} existingDataMap - Map of existing data by timestamp
     * @param {Number} numGroups - Number of group columns
     * @return {Array} - Complete data with headers and filled rows
     * @private
     */
    _fillMissingGroupedDates: function(headers, dateRange, existingDataMap, numGroups) {
        let completeData = [headers];

        for (let i = 0; i < dateRange.length; i++) {
            let dateKey = dateRange[i]; // Datetime string like "2025-09-12 06:00:00"

            if (existingDataMap[dateKey]) {
                // Convert existing row to milliseconds
                let existingRow = existingDataMap[dateKey];
                let convertedRow = this._convertRowToMilliseconds(existingRow);
                completeData.push(convertedRow);
            } else {
                let timestamp = this._dateStringToMilliseconds(dateKey);

                let zeroRow = [timestamp];
                for (let k = 0; k < numGroups; k++) {
                    zeroRow.push(0);
                }
                completeData.push(zeroRow);
            }
        }

        return completeData;
    },


    /**
     *
     * @param {Object} response - ClickHouse response with columns and rows
     * @param {TelemetryDTO} telemetryDTO - Telemetry DTO with configuration
     * @return {Array} - Array of arrays with header and data rows
     * @private
     */
    _getSimpleData: function(response, telemetryDTO) {
        const headers = [TelemetryConstants.TIMESTAMP, TelemetryConstants.VALUE];

        // Find time and value column indices
        let timeColumnIndex = this._findTimeColumnIndex(response.columns);
        let valueColumnIndex = this._findValueColumnIndex(response.columns, timeColumnIndex);

        if (timeColumnIndex === -1 || valueColumnIndex === -1) {
            return [headers];
        }

        // Build data map and find date range from response rows
        let dataMapResult = this._buildDataMapFromRows(response.rows, timeColumnIndex, valueColumnIndex);
        let dataMap = dataMapResult.dataMap;
        let startDate = dataMapResult.startDate;
        let endDate = dataMapResult.endDate;

        let data = [];
        let trendInterval = telemetryDTO && telemetryDTO.getTrendByInterval() || TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR;
        // Handle raw data - default to hourly aggregation
        if (trendInterval === TelemetryConstants.TRENDBY_INTERVAL.RAW) {
            trendInterval = TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR;
            dataMap = this._aggregateRawDataToHourly(dataMap);
        }

        let rangeStartDate = telemetryDTO && telemetryDTO.getStartTime() || startDate;
        let rangeEndDate = telemetryDTO && telemetryDTO.getEndTime() || endDate;

        // Get dataRange values between rangeStartDate and rangeEndDate
        if (rangeStartDate && rangeEndDate) {
            let dateRange = this.generateDateRange(rangeStartDate, rangeEndDate, trendInterval);
            data = this.updateMissingDateRange(dataMap, dateRange);
        }

        return [headers].concat(data);
    },

    /**
     * Find time column index in ClickHouse response
     * @param {Array} columns - ClickHouse columns array
     * @return {Number} - Column index or -1 if not found
     * @private
     */
    _findTimeColumnIndex: function(columns) {
        return 0;
    },

    /**
     * Find value column index in ClickHouse response
     * @param {Array} columns - ClickHouse columns array
     * @param {Number} timeColumnIndex - Index of time column to exclude
     * @return {Number} - Column index or -1 if not found
     * @private
     */
    _findValueColumnIndex: function(columns, timeColumnIndex) {
        return columns.length - 1;
    },

    /**
     * Build data map from response rows and determine date range
     * @param {Array} rows - ClickHouse response rows
     * @param {Number} timeColumnIndex - Index of time column
     * @param {Number} valueColumnIndex - Index of value column
     * @return {Object} - Object with dataMap, startDate, and endDate
     * @private
     */
    _buildDataMapFromRows: function(rows, timeColumnIndex, valueColumnIndex) {
        let dataMap = {};
        let startDate;
        let endDate;

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let fullDateTime = row[timeColumnIndex]; // "2025-09-02 12:00:00"

            if (i === 0) {
                startDate = fullDateTime;
                endDate = fullDateTime;
            } else {
                if (fullDateTime < startDate) startDate = fullDateTime;
                if (fullDateTime > endDate) endDate = fullDateTime;
            }

            // Handles both simple values and array values (for quantiles)
            let rawValue = row[valueColumnIndex];
            dataMap[fullDateTime] = Array.isArray(rawValue) ? rawValue[0] : rawValue;
        }

        return {
            dataMap: dataMap,
            startDate: startDate,
            endDate: endDate
        };
    },

    /**
     * Aggregate raw timestamp data to hourly buckets
     * @param {Object} rawDataMap - Map with precise timestamps
     * @return {Object} - Map with hourly timestamps
     * @private
     */
    _aggregateRawDataToHourly: function(rawDataMap) {
        let hourlyMap = {};

        for (let timeStamp in rawDataMap) {
            // Convert "2025-09-18 16:15:51" to "2025-09-18 16:00:00"
            let hourlyTimestamp = this._truncateToHour(timeStamp);
            hourlyMap[hourlyTimestamp] = (hourlyMap[hourlyTimestamp] || 0) + rawDataMap[timeStamp];
        }

        return hourlyMap;
    },

    /**
     * Truncate timestamp to hour boundary
     * @param {String} timestamp - "2025-09-18 16:15:51"
     * @return {String} - "2025-09-18 16:00:00"
     * @private
     */
    _truncateToHour: function(timestamp) {
        let parts = timestamp.split(' ');
        let datePart = parts[0];
        let timePart = parts[1];
        let hour = timePart.split(':')[0];
        return datePart + ' ' + hour + ':' + TelemetryConstants.MINUTES_SECONDS;
    },

    /**
     * Fill missing date ranges with 0 values
     * Handles Telemetry intervals: 1hr, 6hr, 12hr, 24hr
     * @param {Object} dataMap - Map of date -> value
     * @param {Array} dateRange - Array of date strings
     * @return {Array} - Array of [timestamp_ms_string, value] arrays
     */
    updateMissingDateRange: function(dataMap, dateRange) {
        let data = [];
        for (let i = 0; i < dateRange.length; i++) {
            let dateKey = dateRange[i];
            let count = dataMap[dateKey] || 0;
            let timestamp = this._dateStringToMilliseconds(dateKey);

            data.push([timestamp.toString(), count]);
        }
        return data;
    },

    _dateStringToMilliseconds: function(dateTimeStr) {
        // Convert to timestamp using GlideDateTime for reliable conversion
        let gdt = new GlideDateTime();
        gdt.setValue(dateTimeStr); // setValue treats input as UTC, no conversion

        return gdt.getNumericValue();
    },

    /**
     * Generate date range for Telemetry rollup intervals
     * Handles Telemetry intervals: 1hr, 6hr, 12hr, 24hr
     * @param {String} startDate - Start date string
     * @param {String} endDate - End date string  
     * @param {String} interval - Telemetry rollup interval (1hr, 6hr, 12hr, 24hr)
     * @return {Array} - Array of date strings
     */
    generateDateRange: function(startDate, endDate, interval) {
        let dateRange = [];
        let startDateStr = (typeof startDate === 'string') ? startDate : startDate.toString();
        let endDateStr = (typeof endDate === 'string') ? endDate : endDate.toString();

        let alignedStartDate = this._alignToBoundary(startDateStr, interval);
        let currentDate = new GlideDateTime();
        currentDate.setValue(alignedStartDate);

        let endDateTime = new GlideDateTime();
        endDateTime.setValue(endDateStr);

        while (currentDate.compareTo(endDateTime) <= 0) {
            dateRange.push(currentDate.getValue());
            let timeInMilliSeconds;

            // Map Telemetry rollup intervals to time increments
            switch (interval) {
                case TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR:
                    timeInMilliSeconds = 3600000; // 1 hour in milliseconds
                    break;
                case TelemetryConstants.TRENDBY_INTERVAL.SIX_HOUR:
                    timeInMilliSeconds = 21600000; // 6 hours in milliseconds
                    break;
                case TelemetryConstants.TRENDBY_INTERVAL.TWELVE_HOUR:
                    timeInMilliSeconds = 43200000; // 12 hours in milliseconds
                    break;
                case TelemetryConstants.TRENDBY_INTERVAL.TWENTY_FOUR_HOUR:
                    timeInMilliSeconds = 86400000; // 24 hours in milliseconds
                    break;
                case TelemetryConstants.TRENDBY_INTERVAL.MONTH:
                    currentDate.addMonthsUTC(1);
                    continue; // Skip the rest of the loop for monthly case
                default:
                    timeInMilliSeconds = 3600000; // Default to 1 hour
                    break;
            }
            currentDate.add(timeInMilliSeconds);
        }

        return dateRange;
    },

    /**
     * Align datetime string to ClickHouse rollup boundaries
     * @param {String} dateTimeStr - Input datetime string "2025-08-16 18:30:00"
     * @param {String} interval - Telemetry interval
     * @return {String} - Aligned datetime string
     * @private
     */
    _alignToBoundary: function(dateTimeStr, interval) {
        // Input is already in correct format "yyyy-MM-dd HH:mm:ss"
        // Parse directly without timezone conversion to avoid IST/UTC issues
        const datePart = dateTimeStr.substring(0, 10); // "yyyy-MM-dd"
        const hour = parseInt(dateTimeStr.substring(11, 13), 10);


        let alignedHour;

        switch (interval) {
            case TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR:
                return this._formatAlignedDateTime(datePart, hour);
            case TelemetryConstants.TRENDBY_INTERVAL.SIX_HOUR:
                alignedHour = Math.floor(hour / 6) * 6;
                return this._formatAlignedDateTime(datePart, alignedHour);
            case TelemetryConstants.TRENDBY_INTERVAL.TWELVE_HOUR:
                alignedHour = Math.floor(hour / 12) * 12;
                return this._formatAlignedDateTime(datePart, alignedHour);
            case TelemetryConstants.TRENDBY_INTERVAL.TWENTY_FOUR_HOUR:
                return this._formatAlignedDateTime(datePart, 0);
            case TelemetryConstants.TRENDBY_INTERVAL.MONTH:
                return this._formatAlignedDateTime(dateTimeStr.substring(0, 7) + '-01', 0); // "yyyy-MM-01"
            default:
                return this._formatAlignedDateTime(datePart, hour);
        }
    },

    /**
     * Helper method to format datetime string with aligned hour
     * @param {String} datePart - Date part (YYYY-MM-DD)
     * @param {Number} hour - Hour to format (0-23)
     * @return {String} - Formatted datetime string
     * @private
     */
    _formatAlignedDateTime: function(datePart, hour) {
        const formattedHour = hour < 10 ? '0' + hour : hour;
        return datePart + ' ' + formattedHour + ':' + TelemetryConstants.MINUTES_SECONDS;
    },

    /**
     *
     * Removed groupBy functionality as not needed for Telemetry UI
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @param {Object} response - Base response object
     * @return {Object} - metadata object
     * @private
     */
    _getMetaData: function(telemetryDTO, response) {
        let groupBys = telemetryDTO.getGroupBys();
        let actualGroupValues = response.groupBys;

        let metadataObj = {
            aggregateBy: 0,
            dataSourceLabel: "Telemetry: custom later",
            timeZone: "SESSION",
            eventData: {},
            trendBy: this._getTrendBy(telemetryDTO),
            series: this._getSeries(telemetryDTO, actualGroupValues),
            format: this._getFormat(telemetryDTO)
        };

        // Add groupBy metadata if this is grouped data
        if (groupBys && groupBys.length > 0 && actualGroupValues && actualGroupValues.length > 0) {
            metadataObj.groupBy = this._getGroupBy(telemetryDTO, groupBys, actualGroupValues);
        }

        return metadataObj;
    },

    /**
     *
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @return {Object} - TrendBy object
     * @private
     */
    _getTrendBy: function(telemetryDTO) {
        return {
            fieldType: "glide_date_time",
            id: "start_time",
            label: "Start Time"
        };
    },

    /**
     *
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @return {Array} - Series array
     * @private
     */
    _getSeries: function(telemetryDTO, actualGroupValues) {
        let series = [];

        if (actualGroupValues && actualGroupValues.length > 0) {
            for (let i = 0; i < actualGroupValues.length; i++) {
                series.push({
                    id: TelemetryConstants.VALUE + i,
                    label: actualGroupValues[i],
                    type: TelemetryConstants.VALUE
                });
            }
        } else {
            // Single series for non-grouped data
            let metricType = "exp_histogram" || telemetryDTO.getMetricType();
            series.push({
                id: TelemetryConstants.VALUE,
                label: metricType,
                type: TelemetryConstants.VALUE
            });
        }

        return series;
    },

    /**
     *
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @return {Object} - Format object
     * @private
     */
    _getFormat: function(telemetryDTO) {
        return {
            frequency: TelemetryConstants.TRENDBY_INTERVAL_MAPPING[telemetryDTO.getTrendByInterval()] || TelemetryConstants.MINUTELY,
            unitFormat: "{0}"
        };
    },

    /**
     * Generate groupBy metadata
     * @param {Object} telemetryDTO - Telemetry Data Transfer Object
     * @param {Array} groupByFields - Array of group field names from telemetryDTO
     * @param {Array} actualGroupValues - Array of actual group field names from the response
     * @return {Array} - Array of groupBy metadata objects
     * @private
     */
    _getGroupBy: function(telemetryDTO, groupByFields, actualGroupValues) {
        let groupByArray = [];
        let elements = [];

        // Generate elements for each actual group value
        for (let i = 0; i < actualGroupValues.length; i++) {
            let groupValue = actualGroupValues[i];

            let seriesObj = {
                id: TelemetryConstants.VALUE + i,
                type: TelemetryConstants.VALUE,
                label: groupValue
            };

            let elementObj = {
                series: [seriesObj],
                id: groupValue.toLowerCase(),
                label: groupValue
            };

            elements.push(elementObj);
        }

        // Create groupBy metadata using field names (what we're grouping BY)
        for (let j = 0; j < groupByFields.length; j++) {
            let fieldName = groupByFields[j]; // "StringAttributes.http.request.method"
            let fieldType = this._extractFieldTypeFromName(fieldName);
            groupByArray.push({
                id: fieldName,
                fieldType: fieldType,
                label: fieldName,
                elements: elements
            });
        }

        return groupByArray;
    },

    /**
     * Extract field type from Telemetry field name prefix
     * @param {String} fieldName - Field name like "StringAttributes.http.request.method"
     * @return {String} - Field type: "string", "number", "boolean"
     * @private
     */
    _extractFieldTypeFromName: function(fieldName) {
        if (!fieldName || typeof fieldName !== 'string') {
            return "string";
        }

        // Extract prefix before the first dot
        let prefix = fieldName.split('.')[0].toLowerCase();

        if (prefix.includes('string')) {
            return "string";
        } else if (prefix.includes('number') || prefix.includes('int') || prefix.includes('float')) {
            return "number";
        } else if (prefix.includes('boolean') || prefix.includes('bool')) {
            return "boolean";
        }

        // Default to string if no match
        return "string";
    },


    /**
     * Get the base result object structure
     * @return {Object} Base result object
     * @private
     */
    _getResultObject: function() {
        return {
            order: 0,
            response: {
                data: [],
                metadata: {
                    aggregateBy: 0,
                    dataSourceLabel: "Telemetry Telemetry Data",
                    timeZone: "SESSION",
                    eventData: {},
                    format: {
                        frequency: TelemetryConstants.TRENDBY_INTERVAL.ONE_HOUR,
                        unitFormat: "{0}"
                    },
                    trendBy: {
                        fieldType: "",
                        id: "",
                        label: ""
                    },
                    series: [{
                        id: "",
                        label: "",
                        type: ""
                    }]
                }
            }
        };
    },

    /**
     * Get error result object
     * @param {String} message - Error message
     * @return {Object} Error result object
     * @private
     */
    _getErrorResult: function(message) {
        let result = this._getResultObject();
        result.error = message || 'Unknown error occurred';
        return result;
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


    type: 'TrendResponseTransformer'
};
