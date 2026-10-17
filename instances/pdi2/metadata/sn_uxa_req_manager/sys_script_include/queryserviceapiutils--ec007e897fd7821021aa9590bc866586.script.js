var QueryServiceApiUtils = Class.create();
QueryServiceApiUtils.prototype = {
    initialize: function(logger) {
        this.logger = logger;
    },

    getApiResponse: function(params, config) {
        try {
            var debugEnabled = this.logger.isDebugEnabled();
            var startTime = debugEnabled ? new Date().getTime() : 0;
            var response = new QueryServiceAnalytics(config, params).postRequest(params);
            return response;
        } catch (err) {
            response = err;
            throw err;
        } finally {
            if (debugEnabled) {
                const endTime = new Date().getTime();
                const debugMsg = config.endpoint + ' params are - ' + JSON.stringify(params) + ' and response is - ' + JSON.stringify(response) + ' with response time - ' + (endTime - startTime) + ' milliseconds';
                this.logger.debug(debugMsg);
            }
        }
    },

    type: 'QueryServiceApiUtils'
};
