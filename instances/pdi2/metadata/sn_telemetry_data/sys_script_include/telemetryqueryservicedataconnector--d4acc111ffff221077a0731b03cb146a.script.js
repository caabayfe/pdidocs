var TelemetryQueryServiceDataConnector = Class.create();
TelemetryQueryServiceDataConnector.prototype = Object.extendsObject(BaseTelemetryConnector, {
    executeQuery: function(genericDataConfig) {
        try {
            // Get API configuration using the base method
            var apiConfig = this.getApiConfig(genericDataConfig.getApiKey());

            // Transform the generic config to a request payload
            var requestData = new GenericConfigDSLAdaptor().convert(genericDataConfig);

            // Use the base class method to execute the HTTP request
            var response = this.executeHttpRequest(
                apiConfig.api_endpoint,
                requestData,
                apiConfig.method,
                apiConfig.api_headers
            );

            return response;
        } catch (ex) {
            gs.error('TelemetryQueryServiceDataConnector.executeQuery error: ' + ex.message);
            throw ex;
        }
    },

    type: 'TelemetryQueryServiceDataConnector'
});
