var ResponseTransformerService = Class.create();
ResponseTransformerService.prototype = {
    initialize: function() {},

    /**
     * Transform raw response data into a standardized format
     * @param {Object} rawResponse - Raw response data from connector
     * @param {TelemetryDTO} telemetryDto - The original Telemetry DTO used for the query
     * @returns {Object} - Transformed response object
     */
    transform: function(response, telemetryDto) {
        if (!response) {
            throw new Error('ResponseTransformerService: Raw response is null or undefined');
        }

        var transformer = new ResponseTransformerFactory().getTransformer(telemetryDto);
        if (!transformer) {
            throw new Error('Could not find transformer for category: ' + telemetryDto.getDataCategory() + ' and service: ' + telemetryDto.getService());
        }
        response = transformer.transform(response, telemetryDto);
        return response;
    },

    type: 'ResponseTransformerService'
};
