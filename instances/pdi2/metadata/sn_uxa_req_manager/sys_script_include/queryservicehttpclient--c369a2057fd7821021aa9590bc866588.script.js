var QueryServiceHttpClient = Class.create();
QueryServiceHttpClient.prototype = Object.extendsObject(AbstractQueryServiceHttpClient, {
    initialize: function(config, params) {
        this.logger = QueryServiceApiLogger.getLogger('QueryServiceHttpClient');
        this.analyticsSettings = sn_app_analytics.SNAnalytics.retrieveSettings(config.app_table_name, config.app_record_id);
        if (gs.nil(this.analyticsSettings)) {
            var errMsg = 'Analytics settings not found for Application, ' + config.app_table_name + ", " + config.app_record_id;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.TARGET_URL = config.endpoint;
        this.params = params;
        this.config = config;
        this.client = new sn_app_analytics.SNAnalyticsQueryService();
    },

    doGet: function() {
        var response = this.client.get(this.TARGET_URL);
        return this._processResponse(response);
    },

    doPost: function(payload) {
        payload = this._addParamsToPayload(payload);
        var response = this.client.post(this.TARGET_URL, payload);
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
        /*
        var statusCode = 200; //this.client.getStatusCode();
        if (statusCode < 200 || statusCode >= 300) {
            var errMsg = 'Error while processing the request for the endpoint - ' + this.config.endpoint + ', Error message: ' + this.client.getErrorMessage() + ', Error response: ' + response;
            this.logger.error(errMsg);
            var error = new Error(errMsg);
            error.response = response;

            throw error;
        }*/
        //gs.info(`QueryServiceHttpClient- API: ${this.TARGET_URL}\nResponse: ${JSON.stringify(response)}`);
        try {
            response = response?.replaceAll(NaN, "0") || response;
            response = JSON.parse(response);
        } catch (ex) {
            //Error Messages:
            //QueryServiceHTTPClient Error: Status 400 - [Bad Request] [{ "Error": "Unknown operator $startsWith" } ]
            //QueryServiceHTTPClient Error: Status 500 - [Internal Server Error] 
            const msg = `Error while parsing the response - ${JSON.stringify(response)}. Error: ex`;
            this.logger.error(msg);
            const errorPattern = /Status\s(\d+)\s-\s\[(.+)\](?:\s\[\{\s?"Error":\s?"(.+)"\s?\}\])?/;
            const match = response.match(errorPattern);
            const errorRespone = {};
            if (match) {
                const statusCode = match[1]; // Extract status code
                errorRespone.statusCode = statusCode;
                const statusText = match[2]; // Extract status text (e.g., "Bad Request", "Internal Server Error")
                errorRespone.message = statusText;
            } else {
                const msg = `QueryServiceHttpClient- API: ${this.TARGET_URL}\nResponse: ${JSON.stringify(response)}`;
                this.logger.debug("Could not parse the error response. Message: " + msg);
            }
            errorRespone.detail = response;
            throw errorRespone;
        }

        return response;
    },

    type: 'QueryServiceHttpClient'
});
