var APIKeyBuilder = Class.create();
APIKeyBuilder.prototype = {
    initialize: function() {
        this.keyParts = [];
        this.delimiter = '_';
    },

    /**
     * Add a service name component to the API key
     * @param {String} serviceName - Service name from Telemetry DTO
     * @returns {APIKeyBuilder} - This builder instance for chaining
     */
    withServiceName: function(serviceName) {
        if (serviceName.startsWith("StringAttributes.")) {
            const parts = serviceName.split("StringAttributes.");
            if (parts.length > 1 && parts[1]) {
                serviceName = parts[1];
            }
        }
        this._addComponentIfValid(serviceName);
        return this;
    },

    /**
     * Add a data type component to the API key
     * @param {String} dataType - Data type from Telemetry DTO
     * @returns {APIKeyBuilder} - This builder instance for chaining
     */
    withDataType: function(dataType) {
        this._addComponentIfValid(dataType);
        return this;
    },

    /**
     * Add a data category component to the API key
     * @param {String} dataCategory - Data category from Telemetry DTO
     * @returns {APIKeyBuilder} - This builder instance for chaining
     */
    withDataCategory: function(dataCategory) {
        this._addComponentIfValid(dataCategory);
        return this;
    },

    /**
     * Add a component to the key parts if it's valid
     * @param {String} value - Component value
     * @private
     */
    _addComponentIfValid: function(value) {
        if (value && typeof value === 'string' && value.trim() !== '') {
            // Sanitize the value by removing any delimiter characters and whitespace
            var sanitizedValue = value.trim();
            this.keyParts.push(sanitizedValue);
        }
    },

    /**
     * Build the final API key from all components
     * @returns {String} - The generated API key
     */
    build: function() {
        if (this.keyParts.length === 0) {
            gs.warn("APIKeyBuilder: No components added to the API key");
            return "";
        }

        return this.keyParts.join(this.delimiter);
    },

    /**
     * Build the API key directly from an Telemetry DTO
     * @param {Object} telemetryDTO - The Telemetry DTO object
     * @returns {String} - The generated API key
     */
    buildFromDTO: function(telemetryDTO) {
        if (!telemetryDTO) {
            gs.error("APIKeyBuilder: Cannot build API key from null Telemetry DTO");
            return "";
        }

        this.withServiceName(telemetryDTO.getServiceName())
            .withDataType(telemetryDTO.getDataType());

        //.withDataCategory(telemetryDTO.dataCategory);

        return this.build();
    },

    type: 'APIKeyBuilder'
};
