var BaseTelemetryConnector = Class.create();
BaseTelemetryConnector.prototype = {
    initialize: function() {
        this.apiConfigLookupService = new APIConfigLookupService();
    },

    // Common method to execute HTTP requests based on config
    executeHttpRequest: function(endpoint, requestData, method, headers) {
        // Set default method if not provided
        method = method || 'POST';

        const queryServiceHttpClient = new QueryServiceHttpClient();

        // Set headers
        if (headers && typeof headers === 'object') {
            Object.keys(headers).forEach(function(key) {
                queryServiceHttpClient.addHeader(key, headers[key]);
            }, this);
        }

        // Execute request based on method
        var response = null;
        switch (method.toUpperCase()) {
            case 'GET':
                response = queryServiceHttpClient.doGet(endpoint);
                break;
            case 'POST':
                response = queryServiceHttpClient.doPost(endpoint, requestData);
                break;
            case 'PUT':
                response = queryServiceHttpClient.doPut(endpoint, requestData);
                break;
            case 'DELETE':
                response = queryServiceHttpClient.doDelete(endpoint);
                break;
            case 'PATCH':
                response = queryServiceHttpClient.doPatch(endpoint, requestData);
                break;
            default:
                gs.error('BaseTelemetryConnector: Unsupported HTTP method: ' + method);
                throw new Error('Unsupported HTTP method: ' + method);
        }

        return response;
    },

    // Common method to get API configuration
    getApiConfig: function(apiKey) {
        var config = this.apiConfigLookupService.getConfig(apiKey);
        if (!config) {
            throw new Error('No API configuration found for key: ' + apiKey);
        }
        return config;
    },

    type: 'BaseTelemetryConnector'
};
