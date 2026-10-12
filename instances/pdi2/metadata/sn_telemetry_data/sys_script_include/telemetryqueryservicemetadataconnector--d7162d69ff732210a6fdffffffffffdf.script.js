var TelemetryQueryServiceMetadataConnector = Class.create();
TelemetryQueryServiceMetadataConnector.prototype = Object.extendsObject(BaseTelemetryConnector, {
    executeQuery: function(telemetryDto) {
        try {
            var apiKey = new APIKeyBuilder().buildFromDTO(telemetryDto);
            // Get API configuration using the base method
            var apiConfig = this.getApiConfig(apiKey);

            // Transform the telemetryDto to a request payload
            var requestData = this._buildRequestPayload(telemetryDto);

            // Use the base class method to execute the HTTP request
            var response = this.executeHttpRequest(
                apiConfig.api_endpoint,
                requestData,
                apiConfig.method,
                apiConfig.api_headers
            );

            return response;
        } catch (ex) {
            gs.error('TelemetryQueryServiceMetadataConnector.executeQuery error: ' + ex.message);
            throw ex;
        }
    },

    /**
     * Build request payload from generic configuration
     * @param {TelemetryMetadataDTO} telemetryDto - The telemetryMetadata dto object
     * @returns {Object} - Request payload object
     * @private
     */
    _buildRequestPayload: function(telemetryDto) {
        if (!telemetryDto) {
            throw new Error('telemetryDto is required');
        }

        var serviceName = telemetryDto.getServiceName();
        var dataType = telemetryDto.getDataType();
        var payload = {
            'data_type': dataType
        };

        if (serviceName) {
            payload['service_name'] = serviceName;
        }
        return payload;
    },

    type: 'TelemetryQueryServiceMetadataConnector'
});
