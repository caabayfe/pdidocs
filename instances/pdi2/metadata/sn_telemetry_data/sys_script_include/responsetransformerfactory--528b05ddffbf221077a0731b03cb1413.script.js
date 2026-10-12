var ResponseTransformerFactory = Class.create();
ResponseTransformerFactory.prototype = {
    initialize: function() {},

    /**
     * Get an appropriate response transformer based on data category and service
     * Will use the transformer_config table to determine the correct transformer
     * 
     * @param telemetryDto
     * @return {Object} An instance of ResponseTransformer
     */
    getTransformer: function(telemetryDto) {
        var dataCategory = null;
        if (!TelemetryConstants.Telemetry_TYPES.includes(telemetryDto.getDataType())) {
            dataCategory = telemetryDto.getDataCategory();
        }
        const service = telemetryDto.getServiceName();
        var transformerName = this._getTransformerName(dataCategory, service, telemetryDto.getDataType());
        // Use GlideScriptedExtensionPoint to get the transformer instance
        const extensionPoints = new GlideScriptedExtensionPoint().getExtensions('TelemetryResponseTransformer');
        let transformer;
        extensionPoints.forEach(function(extensionPoint) {

            if (extensionPoint.type == transformerName) {
                gs.debug("Calling transformer: " + extensionPoint.type);
                //var result = element.transform("Hello");
                //gs.info("Result : " + JSON.stringify(result));
                transformer = extensionPoint;
                return transformer;
            }
        });

        if (!transformer) {
            throw new Error('Could not find transformer for category: ' + dataCategory + ' and service: ' + service);
        }

        return transformer;
    },

    /**
     * Get transformer name from configuration
     * @private
     */
    _getTransformerName: function(dataCategory, service, dataType) {

        var grTransformerConfig = new GlideRecord('sn_telemetry_response_transformer_config');
        grTransformerConfig.addActiveQuery();

        // For metadata case
        if (TelemetryConstants.Telemetry_TYPES.includes(dataType)) {
            grTransformerConfig.addQuery('data_type', dataType);
            grTransformerConfig.query();

            if (grTransformerConfig.next()) {
                return grTransformerConfig.getValue('response_transformer');
            }
        }

        if (!dataCategory) {
            return null;
        }

        // If service is provided, look for service-specific transformer first
        if (service) {

            grTransformerConfig.addQuery('service', service);
            grTransformerConfig.addQuery('data_category', dataCategory);
            grTransformerConfig.addQuery('data_type', dataType);

            grTransformerConfig.query();

            if (grTransformerConfig.next()) {
                return grTransformerConfig.getValue('response_transformer');
            }
        }

        // Look for a default transformer for this category (with empty service field)
        grTransformerConfig.initialize();
        //grTransformerConfig.addActiveQuery();
        grTransformerConfig.addQuery('data_category', dataCategory);
        grTransformerConfig.query();

        if (grTransformerConfig.next()) {
            return grTransformerConfig.getValue('response_transformer');
        }

        return null; // No configured transformer found
    },

    type: 'ResponseTransformerFactory'
};
