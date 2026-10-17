var QueryServiceHttpClient = Class.create();
QueryServiceHttpClient.prototype = {
    initialize: function() {
        this.client = new sn_app_analytics.SNAnalyticsQueryService();
    },

    /**
     * Perform a GET request to the specified endpoint
     * @param {String} endpoint - The API endpoint URL
     * @returns {Object|String} - The response from the API
     */
    doGet: function(endpoint) {
        try {
            var response = this.client.get(endpoint);
            return this._processResponse(response, endpoint);
        } catch (ex) {
            this._handleError(ex, 'GET', endpoint);
            throw ex;
        }
    },

    /**
     * Perform a POST request to the specified endpoint
     * @param {String} endpoint - The API endpoint URL
     * @param {String} payload - The JSON payload as string
     * @returns {Object|String} - The response from the API
     */
    doPost: function(endpoint, payload) {
        try {
            //return "hello";
            payload = this._addParamsToPayload(payload);
            var response = this.client.post(endpoint, payload);
            return this._processResponse(response, endpoint);
        } catch (ex) {
            this._handleError(ex, 'POST', endpoint);
            throw ex;
        }
    },

    doDirectPost: function(endpoint, payload) {
        try {
            return  this.client.post(endpoint, payload);
        } catch (ex) {
            this._handleError(ex, 'POST', endpoint);
            throw ex;
        }
    },

    _addParamsToPayload: function(payload) {
        //if (!this.payload)
        //return;
        var keys = Object.keys(payload);
        payload = payload || {};
        for (var i = 0; i < keys.length; i++) {
            if (this.isObject(payload[keys[i]])) {
                payload[keys[i]] = JSON.stringify(payload[keys[i]]);
            }
            payload[keys[i]] = payload[keys[i]];
        }
        return payload;
    },

    isObject: function(x) {
        return typeof x === 'object' && !Array.isArray(x) && x !== null;
    },

    /**
     * Perform a PUT request to the specified endpoint
     * @param {String} endpoint - The API endpoint URL
     * @param {String} payload - The JSON payload as string
     * @returns {Object|String} - The response from the API
     */
    doPut: function(endpoint, payload) {
        try {
            var response = this.client.put(endpoint, payload);
            return this._processResponse(response, endpoint);
        } catch (ex) {
            this._handleError(ex, 'PUT', endpoint);
            throw ex;
        }
    },

    /**
     * Perform a DELETE request to the specified endpoint
     * @param {String} endpoint - The API endpoint URL
     * @param {String} payload - The JSON payload as string (optional)
     * @returns {Object|String} - The response from the API
     */
    doDelete: function(endpoint, payload) {
        try {
            var response = this.client.del(endpoint, payload);
            return this._processResponse(response, endpoint);
        } catch (ex) {
            this._handleError(ex, 'DELETE', endpoint);
            throw ex;
        }
    },

    /**
     * Perform a PATCH request to the specified endpoint
     * @param {String} endpoint - The API endpoint URL
     * @param {String} payload - The JSON payload as string
     * @returns {Object|String} - The response from the API
     */
    doPatch: function(endpoint, payload) {
        try {
            var response = this.client.patch(endpoint, payload);
            return this._processResponse(response, endpoint);
        } catch (ex) {
            this._handleError(ex, 'PATCH', endpoint);
            throw ex;
        }
    },

    /**
     * Add a header to be sent with requests
     * @param {String} key - Header key
     * @param {String} value - Header value
     */
    addHeader: function(key, value) {
        if (!key) {
            this.logger.warn('addHeader: Key is required');
            return;
        }
        // Apply header directly to client
        this.client.addHeader(key, value);
    },

    /**
     * Process the API response
     * @param {String} response - The raw API response
     * @returns {Object|String} - The processed response
     * @private
     */
    _processResponse: function(response) {
        try {
            response = response?.replaceAll(NaN, "0") || response;
            response = JSON.parse(response);
        } catch (ex) {
            //Error Messages:
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

    /**
     * Handle errors from API requests
     * @param {Error|Object} ex - The exception object
     * @param {String} method - The HTTP method used
     * @param {String} endpoint - The API endpoint that was called
     * @private
     */
    _handleError: function(ex, method, endpoint) {
        var errorMsg = 'Error during ' + method + ' request to ' + endpoint;
        if (ex.message) {
            errorMsg += ': ' + ex.message;
        }
        this.logger.error(errorMsg);
    },

    type: 'QueryServiceHttpClient'
};
