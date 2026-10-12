var TelemetryDataProviderFacade = Class.create();
TelemetryDataProviderFacade.prototype = {
    initialize: function() {
        this.validationService = new ValidationService();
        this.telemetryGenericConfigAdapter = new TelemetryGenericConfigAdaptor();
        this.connectorFactory = new ConnectorFactory();
        //this.responseTransformer = new GenericResponseTransformer();
    },

    /**
     * Fetch data based on the Telemetry DTO specification
     * @param {TelemetryDTO} telemetryDto - The DTO containing request parameters
     * @param {String} dataStore - The data store to query
     * @returns {Object} - Transformed response data
     */
    fetchData: function(telemetryDto, dataStore = "telemetry_data") {
        if (!telemetryDto || !dataStore) {
            gs.error('TelemetryDataProviderFacade: Missing required parameters. telemetryDto and dataStore are required.');
            throw new Error('Missing required parameters. telemetryDto and dataStore are required.');
        }
        // 1. Validate the DTO
        var isValid = this.validationService.validate(telemetryDto);
        if (!isValid) {
            throw new Error('Invalid Telemetry DTO configuration.');
        }
        try {
            // 2. Create the generic data config object
            var genericDataConfig = this.telemetryGenericConfigAdapter.createGenericDataConfigObject(telemetryDto);
            // 3. Get the appropriate connector
            var connector = this.connectorFactory.getConnector(dataStore);
            if (!connector) {
                gs.error('TelemetryDataProviderFacade: No connector found for data store: ' + dataStore);
                throw new Error('No connector found for data store: ' + dataStore);
            }
            // Execute the query
            var response = connector.executeQuery(genericDataConfig);
            // 4. Transform the response
            var transformedResponse = new ResponseTransformerService().transform(response, telemetryDto);
            // 5. Return the transformed response
            return transformedResponse;
        } catch (ex) {
            gs.error('TelemetryDataProviderFacade.fetchData error: ' + ex.message);
            throw ex;
        }
    },

    type: 'TelemetryDataProviderFacade'
};
