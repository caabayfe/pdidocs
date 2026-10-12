var TelemetryMetadataUIAdaptor = Class.create();
TelemetryMetadataUIAdaptor.prototype = {
    initialize: function() {},

    createDTO: function(requestPayload) {
        var telemetryDTO = new TelemetryMetadataDTO();

        if (!requestPayload.configuration) {
            throw new Error('configuration object is required');
        }

        var config = requestPayload.configuration;

        if (config.serviceName) {
            telemetryDTO.setServiceName(config.serviceName);
        }

        if (config.dataType) {
            telemetryDTO.setDataType(config.dataType);
        }

        return telemetryDTO;
    },

    type: 'TelemetryMetadataUIAdaptor'
};
