var AnalyticsApiUtils = Class.create();
AnalyticsApiUtils.prototype = {
    initialize: function(logger) {
        this.logger = logger;
    },

    getApiResponse: function(params, config, payload) {
        var debugEnabled = AnalyticsApiLogger.isDebugEnabled();
        this.logger.debug(config.endpoint + ' params are - ' + JSON.stringify(params));
        var startTime = debugEnabled ? 0 : new Date().getTime();
        var response = new AppseeAnalytics(config, params).postRequest(payload);
        var endTime = debugEnabled ? 0 : new Date().getTime();
        var debugMsg = debugEnabled ? '' : config.endpoint + ' response is - ' + response + ' with response time - ' + (endTime - startTime) + ' milliseconds';
        this.logger.debug(debugMsg);
        return response;
    },

    type: 'AnalyticsApiUtils'
};
