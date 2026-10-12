var QueryServiceAnalytics = Class.create();
QueryServiceAnalytics.prototype = {
    initialize: function(config, params) {
        this.logger = QueryServiceApiLogger.getLogger('QueryServiceApiLogger');
        var validation = this._validate(config, params);
        if (validation.status == 'FAIL') {
            errMsg = validation.message + ' for the endpoint - ' + config.endpoint;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.client = new QueryServiceHttpClient(config, params);
    },

    postRequest: function(payload) {
        return this.client.doPost(payload);
    },

    getRequest: function() {
        return this.client.doGet();
    },

    deleteRequest: function(payload) {
        return this.client.doDelete(payload);
    },

    putRequest: function(payload) {
        return this.client.doPut(payload);
    },

    patchRequest: function(payload) {
        return this.client.doPatch(payload);
    },

    _validate: function(config, params) {
        var paramKeys = Object.keys(params);
        return this._validateRequiredParams(config.required_params, paramKeys);

    },

    _validateRequiredParams: function(requiredParams, paramKeys) {
        for (var i = 0; i < requiredParams.length; i++) {
            var hasParam = new global.ArrayUtil().contains(paramKeys, requiredParams[i]);
            if (!hasParam) {
                return {
                    status: 'FAIL',
                    message: 'Required param not found - ' + requiredParams[i]
                };
            }
        }
        return {
            status: 'PASS',
        };
    },

    createAddSessionPayload: function(payload) {
        if (!Array.isArray(payload)) {
            var errMsg = 'Error while processing the payload, please provide list of sessions.';
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        return {
            'sessions': payload,
        };
    },

    type: 'QueryServiceAnalytics'
};
