var TelemetryMetadataProviderFacade = Class.create();
TelemetryMetadataProviderFacade.prototype = {
    initialize: function() {
        this.validationService = new ValidationService();
        this.connectorFactory = new ConnectorFactory();
    },

    /**
     * Fetch metadata based on the Telemetry DTO specification
     * @param {TelemetryDTO} telemetryDto - The DTO containing request parameters
     * @param {String} dataStore - The data store to query
     * @returns {Object} - Transformed response data
     */
    fetchMetadata: function(telemetryDto, dataStore = "telemetry_metadata") {
        if (!telemetryDto || !dataStore) {
            gs.error('TelemetryMetadataProviderFacade: Missing required parameters. telemetryDto and dataStore are required.');
            throw new Error('Missing required parameters. telemetryDto and dataStore are required.');
        }

        // 1. Validate the DTO (only when fetching "metric-details" metadata API)
        if (telemetryDto.getServiceName() != '') {
            var isValid = this.validationService.validateMetadata(telemetryDto);
            if (!isValid) {
                throw new Error('Invalid Telemetry Metadata DTO configuration.');
            }
        }

        try {
            // 1. Get the appropriate connector
            var connector = this.connectorFactory.getConnector(dataStore);
            if (!connector) {
                gs.error('TelemetryMetadataProviderFacade: No connector found for data store: ' + dataStore);
                throw new Error('No connector found for data store: ' + dataStore);
            }

            // 4. Execute the query
            var response = connector.executeQuery(telemetryDto);

            // 5. Transform the response
            var transformedResponse = new ResponseTransformerService().transform(response, telemetryDto);

            // 6. Return the transformed response
            return transformedResponse;

        } catch (ex) {
            gs.error('TelemetryMetadataProviderFacade.fetchMetadata error: ' + ex.message);
            throw ex;
        }
    },

    type: 'TelemetryMetadataProviderFacade'
};
