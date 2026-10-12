var TelemetryDataHandler = Class.create();
TelemetryDataHandler.prototype = {
    initialize: function() {
        this.telemetryUtils = new TelemetryUtils();
        this.telemetryUIAdaptor = new TelemetryUIAdaptor();
        this.telemetryDataProviderFacade = new TelemetryDataProviderFacade();
    },

    getData: function(params) {
        // TODO: Remove the below code for previous date range once DA starts sending date range in the dataConfiguration for sparkLine.
        //Use these variables to hold the startTime and endTime for previous configuration.
        let previousDataConfigurationStartTime, previousDataConfigurationEndTime;
        const responses = [];
        params.dataConfigurations?.forEach((dataConfiguration, index) => {
            //In case of score sparkline, the DA dataConfiguration does not have startTime and endTime, because of which query service API call fails. Hence, update the respective dataConfiguration with previousDataConfiguration date range.
            if (!dataConfiguration.startTime && previousDataConfigurationStartTime) {
                dataConfiguration.startTime = previousDataConfigurationStartTime;
                dataConfiguration.endTime = previousDataConfigurationEndTime;
            }

            var response = this._fetchData(dataConfiguration, params?.filterConfigurations);

            // Store current values as previous BEFORE making the next dataConfiguration API call
            if (dataConfiguration.startTime) {
                previousDataConfigurationStartTime = dataConfiguration.startTime;
                previousDataConfigurationEndTime = dataConfiguration.endTime;
            }

            if (response) {
                response.order = index;
                // Check if change tracking is requested and supported for this dataCategory
                const needsChangeData = this._shouldCalculateChanges(dataConfiguration);

                if (needsChangeData && this._isChangeTrackingSupportedCategory(dataConfiguration)) {
                    // Get comparison data from past period
                    const pastResponse = this._fetchPastPeriodData(dataConfiguration, params?.filterConfigurations);

                    if (pastResponse) {
                        // Calculate changes and enhance the response using TelemetryUtils
                        response = this.telemetryUtils.enhanceResponseWithChangeTracking(response, pastResponse, dataConfiguration);
                    }
                }

                responses.push(response);
            }
        });

        return responses;
    },

    query: function(params) {
        const queryServiceHttpClient = new QueryServiceHttpClient();
        const dataType = params.dataType;
        // Add headers from whitelist based on dataType. This ensures, no custom headers are passed. 
        if (dataType && TelemetryConstants.DATATYPE_HEADERS[dataType]) {
            var headers = TelemetryConstants.DATATYPE_HEADERS[dataType];
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    queryServiceHttpClient.addHeader(key, headers[key]);
                }
            }
        }

        return queryServiceHttpClient.doDirectPost(params.url, params.payload);
    },


    /**
     * Determines if change calculations should be performed
     * @param {Object} dataConfiguration - The data configuration object
     * @returns {boolean} - True if change calculations are needed
     * @private
     */
    _shouldCalculateChanges: function(dataConfiguration) {
        return dataConfiguration.includeChange === true ||
            dataConfiguration.includeChangePercentage === true;
    },


    /**
     * Checks if the dataCategory supports change tracking (only 'simple' and 'score')
     * @param {Object} dataConfiguration - The data configuration object
     * @returns {boolean} - True if change tracking is supported for this category
     * @private
     */
    _isChangeTrackingSupportedCategory: function(dataConfiguration) {
        return this.telemetryUtils.isChangeTrackingSupportedCategory(dataConfiguration.dataCategory);
    },

    /**
     * Common helper method to create DTO and fetch data for any configuration
     * @param {Object} dataConfiguration - The data configuration object
     * @returns {Object|null} - Response from the API call or null if failed
     * @private
     */
    _fetchData: function(dataConfiguration, filterConfiguration) {
        try {
            const telemetryDTO = this.telemetryUIAdaptor.createDTO(dataConfiguration, filterConfiguration);
            return this.telemetryDataProviderFacade.fetchData(telemetryDTO);
        } catch (error) {
            gs.error('TelemetryDataHandler._fetchData: Error fetching data: ' + error.message);
            throw error;
        }
    },

    /**
     * Fetches data for the past period (shifted by the same duration)
     * @param {Object} dataConfiguration - The original data configuration
     * @returns {Object} - Response from the past period API call
     * @private
     */
    _fetchPastPeriodData: function(dataConfiguration, filterConfiguration) {
        try {
            // Create a copy of the data configuration for the past period
            const pastDataConfiguration = JSON.parse(JSON.stringify(dataConfiguration));

            // Calculate shifted date range
            const shiftedRange = this.telemetryUtils.getShiftedDateRangeForComparison(pastDataConfiguration.startTime, pastDataConfiguration.endTime);

            if (shiftedRange.shiftedStartDate && shiftedRange.shiftedEndDate) {
                // Update the configuration with shifted dates
                pastDataConfiguration.startTime = shiftedRange.shiftedStartDate.getDisplayValueInternal();
                pastDataConfiguration.endTime = shiftedRange.shiftedEndDate.getDisplayValueInternal();

                // Remove change flags to avoid infinite recursion
                delete pastDataConfiguration.includeChange;
                delete pastDataConfiguration.includeChangePercentage;

                // Use shared helper to fetch data for past period
                return this._fetchData(pastDataConfiguration, filterConfiguration);
            }
        } catch (error) {
            gs.error('TelemetryDataHandler._fetchPastPeriodData: Error fetching past period data: ' + error.message);
        }

        return null;
    },

    getMetadata: function(payload) {
        const metadataDTO = new TelemetryMetadataUIAdaptor().createDTO(payload);
        return new TelemetryMetadataProviderFacade().fetchMetadata(metadataDTO);
    },

    handleQueryRequest: function(params) {
        return this.getData(params);
    },

    type: 'TelemetryDataHandler'
};
