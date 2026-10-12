var APIConfigLookupService = Class.create();
APIConfigLookupService.prototype = {
    initialize: function() {
        this.TABLE_NAME = 'sn_telemetry_api_service_config';
    },

    /**
     * Lookup API configuration from GenericDataConfig object
     * Extracts apiKey from metadata and performs lookup
     * @param {GenericDataConfig} genericDataConfig - The generic data configuration object
     * @returns {Object|null} - API configuration object or null if not found
     */
    getConfig: function(apiKey) {
        /*
		if (!genericDataConfig) {
            this.logger.error('getConfig: GenericDataConfig object is required');
            return null;
        }

        var apiKey = genericDataConfig.getApiKey();
		*/
        return this.lookupByKey(apiKey);
    },

    /**
     * Lookup API configuration by API key
     * @param {String} apiKey - The API key to search for
     * @returns {Object|null} - API configuration object or null if not found
     */
    lookupByKey: function(apiKey) {
        if (!apiKey) {
            throw new Error('lookupByKey: API key is required');
        }

        try {
            var gr = new GlideRecord(this.TABLE_NAME);
            gr.addQuery('api_key', apiKey);
            gr.query();

            if (gr.next()) {
                return this._createConfigObject(gr);
            }

            // remove the (service) from the api key to fetch it from the table
            const firstUnderscoreIndex = apiKey.indexOf('_');
            if (firstUnderscoreIndex === -1) {
                return null;
            }

            var newApiKey = apiKey.substring(firstUnderscoreIndex + 1);
            gr = new GlideRecord(this.TABLE_NAME);
            gr.addQuery('api_key', newApiKey);
            gr.query();

            if (gr.next()) {
                return this._createConfigObject(gr);
            }

        } catch (ex) {
            this.logger.error('lookupByKey error: ' + ex.message);
            return null;
        }
        return null;
    },

    /**
     * Create configuration object from GlideRecord
     * @param {GlideRecord} gr - GlideRecord containing API configuration
     * @returns {Object} - API configuration object
     * @private
     */
    _createConfigObject: function(gr) {
        var config = {
            sys_id: gr.getValue('sys_id'),
            api_key: gr.getValue('api_key'),
            api_endpoint: gr.getValue('api_endpoint'),
            api_headers: gr.getValue('api_headers') || {},
            method: gr.getValue('method') || 'GET' // Default to GET if method is not specified
        };

        // Parse headers if present
        if (config.api_headers) {
            try {
                config.api_headers = JSON.parse(config.api_headers);
            } catch (e) {
                gs.error('Failed to parse API headers JSON for key ' + config.api_key);
                config.api_headers = {};
            }
        }

        return config;
    },

    type: 'APIConfigLookupService'
};
