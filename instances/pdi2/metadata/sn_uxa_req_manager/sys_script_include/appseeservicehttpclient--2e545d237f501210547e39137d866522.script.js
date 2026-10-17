var AppseeServiceHttpClient = Class.create();
AppseeServiceHttpClient.prototype = Object.extendsObject(AbstractAppseeServiceHttpClient, {
    initialize: function(config, params) {
        this.logger = QueryServiceApiLogger.getLogger('AppseeServiceHttpClient');
        this.analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(config.app_table_name, config.app_record_id);
        if (gs.nil(this.analyticsSettings)) {
            var errMsg = 'Analytics settings not found for Application, ' + config.app_table_name + ", " + config.app_record_id;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.TARGET_URL = config.endpoint;
        this.apiKey = this.analyticsSettings.getApiKey();
        this.params = params;
        this.config = config;
        var baseURL = sn_app_analytics.SNAnalytics.getAPIServerHost();
        this.config.baseURL = baseURL;
        this.client = sn_app_analytics.SNAnalytics.getAPIHttpClient();
        if (baseURL)
            this.client.setBaseURL(baseURL);

    },

    doGet: function() {
        var response = this.client.get(this.TARGET_URL);
        return this._processResponse(response);
    },

    doPost: function(payload) {
        payload = this._addParamsToPayload(payload);
        var response = this.client.postPayload(this.TARGET_URL, JSON.stringify(payload));
        return this._processResponse(response);
    },

    doPut: function(payload) {
        payload = this._addParamsToPayload(payload);
        var response = this.client.put(this.TARGET_URL, payload);
        return this._processResponse(response);
    },

    doDelete: function(payload) {
        payload = this._addParamsToPayload(payload);
        var response = this.client.del(this.TARGET_URL, payload);
        return this._processResponse(response);
    },

    doPatch: function(payload) {
        payload = this._addParamsToPayload(payload);
        var response = this.client.patch(this.TARGET_URL, payload);
        return this._processResponse(response);
    },

    addHeader: function(key, value) {
        //this.client.addHeader(key, value);
    },

    isObject: function(x) {
        return typeof x === 'object' && !Array.isArray(x) && x !== null;
    },

    _addParamsToPayload: function(payload) {
        if (!this.params)
            return;

        var keys = Object.keys(this.params);
        payload = payload || {};
        for (var i = 0; i < keys.length; i++) {
            if (this.config.stringify_object_params === true && this.isObject(this.params[keys[i]])) {
                this.params[keys[i]] = JSON.stringify(this.params[keys[i]]);
            }
            payload[keys[i]] = this.params[keys[i]];
        }
        return payload;
    },

    _processResponse: function(response) {
        var statusCode = 200; //this.client.getStatusCode();
        if (statusCode < 200 || statusCode >= 300) {
            var errMsg = 'Error while processing the request for the endpoint - ' + this.config.endpoint + ', Error message: ' + this.client.getErrorMessage() + ', Error response: ' + response;
            this.logger.error(errMsg);
            var error = new Error(errMsg);
            error.response = response;

            throw error;
        }
        this.logger.debug("AppseeServiceHttpClient Response: " + JSON.stringify(response));
        return JSON.parse(response);
    },

    type: 'AppseeServiceHttpClient'
});
