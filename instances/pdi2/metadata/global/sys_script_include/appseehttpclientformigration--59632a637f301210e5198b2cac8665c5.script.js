var AppseeHttpClientForMigration = Class.create();
AppseeHttpClientForMigration.prototype = {
    initialize: function(config, params) {
        this.analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(config.app_table_name, config.app_record_id);
        if (gs.nil(this.analyticsSettings)) {
            var errMsg = 'Analytics settings not found for Application, ' + config.app_table_name + ", " + config.app_record_id;
            gs.error(errMsg);
            throw new Error(errMsg);
        }
        this.TARGET_URL = config.endpoint;
        this.apiKey = this.analyticsSettings.getApiKey();
        this.params = params;
        this.config = config;
        this.client = sn_app_analytics.SNAnalytics.getAPIHttpClientForMigration();
        if (this.config.baseURL)
            this.client.setBaseURL(this.config.baseURL);
    },

    doGet: function() {
        var response = this.client.get(this.TARGET_URL);
        return this._processResponse(response);
    },

    doPost: function(payload) {
        payload = this._addParamsToPayload(payload);
        this._setJsonContentType();
        var response = this.client.postPayload(this.TARGET_URL, JSON.stringify(payload));
        return this._processResponse(response);
    },

    doPut: function(payload) {
        payload = this._addParamsToPayload(payload);
        this._setJsonContentType();
        var response = this.client.put(this.TARGET_URL, JSON.stringify(payload));
        return this._processResponse(response);
    },

    doDelete: function(payload) {
        payload = this._addParamsToPayload(payload);
        this._setJsonContentType();
        var response = this.client.del(this.TARGET_URL, JSON.stringify(payload));
        return this._processResponse(response);
    },

    doPatch: function(payload) {
        payload = this._addParamsToPayload(payload);
        this._setJsonContentType();
        var response = this.client.patch(this.TARGET_URL, JSON.stringify(payload));
        return this._processResponse(response);
    },

    addHeader: function(key, value) {
        this.client.addHeader(key, value);
    },

    _addParamsToPayload: function(payload) {
        if (!this.params)
            return;
        var keys = Object.keys(this.params);
        payload = payload || {};
        for (var i = 0; i < keys.length; i++) {
            payload[keys[i]] = this.params[keys[i]];
        }
        return payload;
    },

    _setJsonContentType: function() {
        this.addHeader("Content-Type", "application/json");
    },

    _processResponse: function(response) {
        var statusCode = this.client.getStatusCode();
        if (statusCode < 200 || statusCode >= 300) {
            var errMsg = 'Error while processing the request for the endpoint - ' + this.config.endpoint + ', Error message: ' + this.client.getErrorMessage() + ', Error response: ' + response;
            gs.error(errMsg);
            var error = new Error(errMsg);
            error.response = response;

            throw error;
        }
        return response;
    },
    type: 'AppseeHttpClientForMigration'
};
