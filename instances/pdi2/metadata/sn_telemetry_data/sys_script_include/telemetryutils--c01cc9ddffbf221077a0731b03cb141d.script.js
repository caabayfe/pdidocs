var TelemetryUtils = Class.create();
TelemetryUtils.prototype = {
    initialize: function() {},

    getStartEndDatesByISO86Value: function(startTimeISO86Str) {
        const dateRange = {};
        if (startTimeISO86Str.match(TelemetryConstants.ISO86_DATE_INTERVAL_REGEX)) {
            const [interval, period] = startTimeISO86Str.slice(1).match(/\d{1,}|\w{1}/g);
            const periodType = TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING[period];
            let endTime = new GlideDateTime();
            let startTime = new GlideDateTime();
            switch (periodType) {
                case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.D:
                    startTime.addDaysLocalTime(-1 * interval);
                    break;
                case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.W:
                    startTime.addWeeksLocalTime(-1 * interval);
                    break;
                case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.M:
                    startTime.addMonthsLocalTime(-1 * interval);
                    break;
                case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.Y:
                    startTime.addYearsLocalTime(-1 * interval);
                    break;
            }
            startTime = this._formatDateWithTime(startTime, true);
            endTime = this._formatDateWithTime(endTime, false);
            dateRange.startDate = this.convertUserTZtoUTC(startTime);
            dateRange.endDate = this.convertUserTZtoUTC(endTime);
        }
        return dateRange;
    },

    getUserGDT: function(utcGdt = new GlideDateTime()) {
        const userGdt = new GlideDateTime(utcGdt.getDisplayValueInternal());
        return userGdt;
    },

    convertUserTZtoUTC: function(dateTime) {
        const date = new GlideDateTime();
        date.setDisplayValueInternal(dateTime);
        return date;
    },

    isPercentile: function(aggregateFunction) {
        var percentilePattern = /^p\d{1,2}$/i; // Match p followed by 1 or 2 digits (P0-P99), case insensitive
        if (percentilePattern.test(aggregateFunction)) {
            return true; // Skip validation for percentile patterns
        }
        return false;
    },

    /**
     * Gets the aggregation function and column from the sn_telemetry_aggregation_config table
     * @param {String} aggregateFunction - The UI aggregation function name
     * @param {String} metricType - The metric type
     * @returns {Object} - Object containing aggregateFunction and aggregateColumn
     */
    getAggregations: function(aggregateFunction, metricType) {
        var result = {
            aggregateFunction: aggregateFunction,
            aggregateColumn: null
        };

        try {
            var gr = new GlideRecord('sn_telemetry_aggregation_config');
            gr.addQuery('ui_aggregation', aggregateFunction);
            gr.addQuery('metric_type', metricType);
            gr.query();
            if (gr.next()) {
                result.aggregateFunction = gr.getValue('aggregation_function');
                result.aggregateColumn = gr.getValue('aggregation_column');
            }
        } catch (ex) {
            gs.error("Error querying sn_telemetry_aggregation_config table: " + ex.message);
        }

        return result;
    },

    sanitizeColumnAlias: function(column) {
        return column.replace(/\./g, '__')
            .replace(/^DISTINCT\s+/i, '')
            .replace(/\['/g, '__')
            .replace(/'\]/g, '')
            .replace(/\s/g, '');
    },

    transformAttribute: function(str) {
        if (!str || typeof str !== 'string') return str;

        const prefixes = ['NumberAttributes__', 'BooleanAttributes__', 'StringAttributes__'];
        const prefix = prefixes.find(p => str.startsWith(p));

        if (prefix) {
            // Extract the base prefix name (without trailing __)
            const basePrefixName = prefix.slice(0, -2);
            // Get the remaining part after prefix and transform
            const remaining = str.slice(prefix.length);
            const transformed = remaining.replace(/__/g, '.');

            return `${basePrefixName}.${transformed}`;
        }

        return str;
    },

    /**
     * Calculates the shifted date range for comparison purposes
     * @param {String} startTime - The start time (ISO86 date string like "P1M" or actual date string)
     * @param {String} endTime - The end time (optional, only used when startTime is not ISO86 format)
     * @returns {Object} - Object containing shiftedStartDate and shiftedEndDate
     */
    getShiftedDateRangeForComparison: function(startTime, endTime) {
        try {

            const {
                startDate,
                endDate
            } = this._sanitizeDateForGlideDateTime(startTime, endTime);

            // Route to appropriate handler based on input type
            if (this._isISO86Interval(startDate, endDate)) {
                return this._getShiftedRangeFromISO86Interval(startDate);
            } else if (startDate && endDate) {
                return this._getShiftedRangeFromDateRange(startDate, endDate);
            }
            return {};
        } catch (error) {
            gs.debug('TelemetryUtils.getShiftedDateRangeForComparison: Error calculating shifted date range: ' + error.message);
            return {};
        }
    },

    /**
     * Checks if the input represents an ISO86 interval string
     * @param {String} startTime - The start time string
     * @param {String} endTime - The end time string
     * @returns {Boolean} True if startTime is ISO86 interval and endTime is not provided
     * @private
     */
    _isISO86Interval: function(startTime, endTime) {
        return !endTime && startTime && startTime.match && startTime.match(TelemetryConstants.ISO86_DATE_INTERVAL_REGEX);
    },

    /**
     * Calculates shifted date range from ISO86 interval string (e.g., "P1M", "P2W")
     * @param {String} iso86Interval - The ISO86 interval string
     * @returns {Object} Object containing shiftedStartDate and shiftedEndDate
     * @private
     */
    _getShiftedRangeFromISO86Interval: function(iso86Interval) {
        const [interval, period] = iso86Interval.slice(1).match(/\d{1,}|\w{1}/g);
        const periodType = TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING[period];

        const originalRange = this.getStartEndDatesByISO86Value(iso86Interval);
        if (!originalRange.startDate || !originalRange.endDate) {
            return {};
        }

        const originalStartGDT = new GlideDateTime(originalRange.startDate);
        const originalEndGDT = new GlideDateTime(originalRange.endDate);

        return this._shiftDatesByInterval(originalStartGDT, originalEndGDT, interval, periodType);
    },

    /**
     * Calculates shifted date range from actual start and end dates
     * @param {String} startTime - The start time string
     * @param {String} endTime - The end time string
     * @returns {Object} Object containing shiftedStartDate and shiftedEndDate
     * @private
     */
    _getShiftedRangeFromDateRange: function(startTime, endTime) {
        const startGDT = new GlideDateTime();
        startGDT.setDisplayValueInternal(startTime);
        const endGDT = new GlideDateTime();
        endGDT.setDisplayValueInternal(endTime);

        if (!startGDT.isValid() || !endGDT.isValid()) {
            return {};
        }

        const durationMs = endGDT.getNumericValue() - startGDT.getNumericValue() + 1000;
        const shiftedStartTime = new GlideDateTime(startGDT);
        const shiftedEndTime = new GlideDateTime(endGDT);

        shiftedStartTime.add(-durationMs);
        shiftedEndTime.add(-durationMs);

        return {
            shiftedStartDate: shiftedStartTime,
            shiftedEndDate: shiftedEndTime
        };
    },

    /**
     * Shifts dates backward by the specified interval and period type
     * Creates non-overlapping consecutive periods by ending past period exactly 1 second before current starts
     * @param {GlideDateTime} startGDT - The original start date (e.g., 2025-07-12 18:30:00)
     * @param {GlideDateTime} endGDT - The original end date (e.g., 2025-10-13 18:29:59)
     * @param {Number} interval - The interval amount (e.g., 3 for P3M)
     * @param {String} periodType - The period type (D, W, M, Y)
     * @returns {Object} Object containing shiftedStartDate and shiftedEndDate
     * Example: Current (2025-07-12 18:30:00 - 2025-10-13 18:29:59) → Past (2025-04-12 18:30:00 - 2025-07-12 18:29:59)
     * @private
     */
    _shiftDatesByInterval: function(startGDT, endGDT, interval, periodType) {
        const shiftedStartTime = new GlideDateTime(startGDT);
        const shiftedEndTime = new GlideDateTime(startGDT);

        const shiftAmount = -1 * interval;

        // Shift start date backward by interval
        switch (periodType) {
            case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.D:
                shiftedStartTime.addDaysLocalTime(shiftAmount);
                break;
            case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.W:
                shiftedStartTime.addWeeksLocalTime(shiftAmount);
                break;
            case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.M:
                shiftedStartTime.addMonthsLocalTime(shiftAmount);
                break;
            case TelemetryConstants.RELATIVE_DATE_PERIOD_MAPPING.Y:
                shiftedStartTime.addYearsLocalTime(shiftAmount);
                break;
        }

        // Set end to exactly 1 second before current start (creates perfectly consecutive, non-overlapping periods)
        // Current starts 2025-07-12 18:30:00 → Past ends 2025-07-12 18:29:59
        shiftedEndTime.add(-1000); // Subtract 1000ms (1 second)

        return {
            shiftedStartDate: shiftedStartTime,
            shiftedEndDate: shiftedEndTime
        };
    },

    getPercentChange: function(newValue, oldValue, decimalPoints = 2) {
        const changeData = {
            change: newValue - oldValue,
            changePercent: 0
        };
        if (changeData.change == 0)
            return changeData;

        if (oldValue == 0) {
            changeData.changePercent = 100;
            return changeData;
        }
        changeData.changePercent = ((changeData.change / oldValue) * 100).toFixed(decimalPoints);
        return changeData;
    },

    /**
     * Enhances response with change tracking data
     * @param {Object} currentResponse - Current period response
     * @param {Object} pastResponse - Past period response  
     * @param {Object} dataConfiguration - Configuration with change flags
     * @returns {Object} Enhanced response with change data
     */
    enhanceResponseWithChangeTracking: function(currentResponse, pastResponse, dataConfiguration) {
        try {
            if (!this._isValidForChangeTracking(currentResponse, pastResponse, dataConfiguration)) {
                return currentResponse;
            }

            const enhancedResponse = JSON.parse(JSON.stringify(currentResponse));
            const changeValues = this._calculateChangeValues(enhancedResponse, pastResponse);

            if (!changeValues) {
                return enhancedResponse;
            }

            const responseData = enhancedResponse.response;
            if (responseData && responseData.data && Array.isArray(responseData.data) && responseData.data.length >= 2) {
                // Use helper methods for clean, modular processing
                this._enhanceWithChangeData(responseData, changeValues, dataConfiguration);
                this._addChangeMetadata(responseData, changeValues);
                this._generateVisualMetadata(responseData, changeValues, dataConfiguration);
            }

            return enhancedResponse;

        } catch (error) {
            gs.debug('TelemetryUtils.enhanceResponseWithChangeTracking: Error enhancing response: ' + error.message);
            return currentResponse; // Return original on error
        }
    },

    /**
     * Validates inputs for change tracking
     * @param {Object} currentResponse - Current period response
     * @param {Object} pastResponse - Past period response
     * @param {Object} dataConfiguration - Configuration object
     * @returns {Boolean} True if valid for change tracking
     * @private
     */
    _isValidForChangeTracking: function(currentResponse, pastResponse, dataConfiguration) {
        return !!(currentResponse && pastResponse && dataConfiguration);
    },

    /**
     * Calculates change and percentage values between current and past responses
     * @param {Object} enhancedResponse - Enhanced current response
     * @param {Object} pastResponse - Past period response
     * @returns {Object|null} Change values object or null if calculation not possible
     * @private
     */
    _calculateChangeValues: function(enhancedResponse, pastResponse) {
        const currentValue = this._extractValueFromResponse(enhancedResponse);
        const pastValue = this._extractValueFromResponse(pastResponse);

        if (currentValue === null || pastValue === null || !enhancedResponse?.response?.data) {
            return null;
        }

        const changeData = this.getPercentChange(currentValue, pastValue);
        return {
            change: changeData.change,
            changePercentage: parseFloat(changeData.changePercent),
            currentValue: currentValue,
            pastValue: pastValue
        };
    },

    /**
     * Adds change columns to response data based on configuration
     * @param {Object} responseData - Response data object to enhance
     * @param {Object} changeValues - Calculated change values
     * @param {Object} dataConfiguration - Configuration with change flags
     * @private
     */
    _enhanceWithChangeData: function(responseData, changeValues, dataConfiguration) {
        if (!responseData?.data || !Array.isArray(responseData.data) || responseData.data.length < 2) {
            return;
        }

        const headers = [...responseData.data[0]];
        const values = [...responseData.data[1]];

        if (dataConfiguration.includeChange === true) {
            headers.push("change");
            values.push(String(Math.round(changeValues.change)));
        }

        if (dataConfiguration.includeChangePercentage === true) {
            headers.push("changePercent");
            values.push(String(Math.round(changeValues.changePercentage)));
        }

        responseData.data = [headers, values];
    },

    /**
     * Adds change metadata to response
     * @param {Object} responseData - Response data object to enhance
     * @param {Object} changeValues - Calculated change values
     * @private
     */
    _addChangeMetadata: function(responseData, changeValues) {
        if (!responseData.metadata) {
            responseData.metadata = {};
        }
        if (!responseData.metadata.changeData) {
            responseData.metadata.changeData = {};
        }

        responseData.metadata.changeData.change = changeValues.change;
        responseData.metadata.changeData.changePercentage = changeValues.changePercentage;
    },

    /**
     * Generates visual metadata using SimpleResponseTransformer
     * @param {Object} responseData - Response data object to enhance
     * @param {Object} changeValues - Calculated change values
     * @param {Object} dataConfiguration - Configuration object
     * @private
     */
    _generateVisualMetadata: function(responseData, changeValues, dataConfiguration) {
        if (!this._shouldGenerateVisualMetadata(dataConfiguration)) {
            return;
        }

        try {
            const simpleResponseTransformer = new SimpleResponseTransformer();
            const shiftedRange = this.getShiftedDateRangeForComparison(dataConfiguration.startTime, dataConfiguration.endTime);
            const metadataFromTransformer = simpleResponseTransformer.updateChangeInMetadata(responseData.metadata, shiftedRange.shiftedStartDate, shiftedRange.shiftedEndDate);
            //Object.assign(responseData.metadata, metadataFromTransformer);
        } catch (error) {
            gs.debug('TelemetryUtils._generateVisualMetadata: Error generating visual metadata: ' + error.message);
        }
    },

    /**
     * Determines if visual metadata should be generated
     * @param {Object} dataConfiguration - Configuration object
     * @returns {Boolean} True if visual metadata should be generated
     * @private
     */
    _shouldGenerateVisualMetadata: function(dataConfiguration) {
        return dataConfiguration.includeChange === true || dataConfiguration.includeChangePercentage === true;
    },

    /**
     * Extracts numeric value from transformed response format
     * @param {Object} response - Transformed response from SimpleResponseTransformer
     * @returns {Number|null} Extracted value or null if not found
     */
    _extractValueFromResponse: function(response) {
        try {
            // Handle transformed response format from SimpleResponseTransformer
            // Format: {"order":0,"response":{"data":[["value"],[1359509]],...}}
            if (response && response.response && response.response.data) {
                const data = response.response.data;
                if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1]) && data[1].length > 0) {
                    return parseFloat(data[1][0]);
                }
            }

            return null;
        } catch (error) {
            gs.debug('TelemetryUtils._extractValueFromResponse: Error extracting value: ' + error.message);
            return null;
        }
    },

    /**
     * Checks if change tracking is supported for the given data category
     * @param {String} dataCategory - The data category to check
     * @returns {Boolean} True if change tracking is supported
     */
    isChangeTrackingSupportedCategory: function(dataCategory) {
        return dataCategory === 'simple' || dataCategory === 'score';
    },

    /**
     * Formats a date/datetime input to a standardized date string with time
     * @param {String|GlideDateTime} dateInput - Date input (string or GlideDateTime)
     * @param {Boolean} isStartOfDay - True for 00:00:00, false for 23:59:59
     * @return {String} - Formatted date string like "2025-09-26 00:00:00"
     * @private
     */
    _formatDateWithTime: function(dateInput, isStartOfDay) {
        if (!dateInput) {
            return '';
        }
        try {
            var gd;
            // Handle different input types
            if (typeof dateInput === 'string') {
                gd = new GlideDateTime(dateInput);
            } else if (dateInput && typeof dateInput.getLocalDate === 'function') {
                // Already a GlideDateTime object
                gd = dateInput;
            } else {
                return '';
            }
            // Format with appropriate time
            var timeString = isStartOfDay ? '00:00:00' : '23:59:59';
            return `${gd.getLocalDate()} ${timeString}`;
        } catch (error) {
            gs.debug('TelemetryUtils._formatDateWithTime: Error formatting date: ' + error.message);
            return '';
        }
    },

    _sanitizeDateForGlideDateTime: function(startTime = '', endTime = '') {
        const dates = {
            startDate: startTime?.replace('T', ' '),
            endDate: endTime?.replace('T', ' ')
        };

        // Convert UTC date to local time if needed.
        // NOTE: DA sends timestamps in UTC, while UXA uses local time.
        // To ensure consistency across the app, we convert UTC to local time before proceeding.
        if (dates.startDate?.includes('Z')) {
            dates.startDate = this._formatDateWithTime(dates.startDate, true);
        }

        if (dates.endDate?.includes('Z')) {
            dates.endDate = this._formatDateWithTime(dates.endDate, false);
        }

        return dates;
    },

    dateFromDynamicDateRange: function(dynamicTimeRange, start, end) {
        let {
            startDate,
            endDate
        } = this._sanitizeDateForGlideDateTime(start, end);

        if (dynamicTimeRange) {
            dynamicTimeRange = dynamicTimeRange.replace('SN_DYNAMIC_DATERANGE__', '');
            let dates = {};
            let isDateRangeHandled = true;
            
            switch (dynamicTimeRange) {
                case 'TODAY':
                    dates = this.getLastXDaysDateRange(0);
                    break;
                case 'YESTERDAY':
                    dates = this.getLastXDaysDateRange(1);
                    endDate = new GlideDateTime(dates.endDate);
                    endDate.addDaysLocalTime(-1);
                    dates.endDate = endDate;
                    break;
                case 'LAST_7_DAYS':
                    dates = this.getLastXDaysDateRange(7);
                    break;
                case 'LAST_30_DAYS':
                    dates = this.getLastXDaysDateRange(30);
                    break;
                case 'LAST_60_DAYS':
                    dates = this.getLastXDaysDateRange(60);
                    break;
                case 'LAST_90_DAYS':
                    dates = this.getLastXDaysDateRange(90);
                    break;
                case 'THIS_MONTH':
                    startDate = new GlideDateTime();
                    startDate.setDayOfMonthLocalTime(1);
                    startDate = startDate.getLocalDate().getValue();
                    dates.startDate = `${startDate} 00:00:00`;

                    endDate = new GlideDateTime();
                    endDate.setDayOfMonthLocalTime(31);
                    endDate = endDate.getLocalDate().getValue();
                    dates.endDate = `${endDate} 23:59:59`;
                    break;
                default:
                    isDateRangeHandled = false;
                    // Apply the same logic as the else block for unhandled dynamicTimeRange values
                    if (start) {
                        startDate = this._formatDateWithTime(start, true);
                    }
                    if (end) {
                        endDate = this._formatDateWithTime(end, false);
                    }
                    break;
            }
            
            if (isDateRangeHandled) {
                startDate = dates.startDate;
                endDate = dates.endDate;
            }
        } else {
            if (start) {
                startDate = this._formatDateWithTime(start, true);
            }

            if (end) {
                endDate = this._formatDateWithTime(end, false);
            }
        }

        startDate = this.convertUserTZtoUTC(startDate || start);
        endDate = this.convertUserTZtoUTC(endDate || end);

        return {
            startDate,
            endDate
        };
    },

    getLastXDaysDateRange: function(delayInDays = 30) {
        var gdt = new GlideDateTime();
        const endDate = gdt.getLocalDate().getValue();
        gdt.addDaysLocalTime(-1 * delayInDays);
        var startDate = gdt.getLocalDate().getValue();
        return {
            startDate: `${startDate} 00:00:00`,
            endDate: `${endDate} 23:59:59`
        };
    },

    type: 'TelemetryUtils'
};
