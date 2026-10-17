var AnalyticsApiLogger = Class.create();

AnalyticsApiLogger.DEBUG = 0;
AnalyticsApiLogger.INFO = 1;
AnalyticsApiLogger.WARN = 2;
AnalyticsApiLogger.ERROR = 3;

AnalyticsApiLogger.level = gs.getProperty('sn_analytics_api.com.glide.ci.analytics.api.log_level', AnalyticsApiLogger.WARN);

AnalyticsApiLogger.isDebugEnabled = function() {
    return AnalyticsApiLogger.level <= AnalyticsApiLogger.DEBUG;
};

AnalyticsApiLogger.isInfoEnabled = function() {
    return AnalyticsApiLogger.level <= AnalyticsApiLogger.INFO;
};

AnalyticsApiLogger.isWarnEnabled = function() {
    return AnalyticsApiLogger.level <= AnalyticsApiLogger.WARN;
};

AnalyticsApiLogger.isErrorEnabled = function() {
    return AnalyticsApiLogger.level <= AnalyticsApiLogger.ERROR;
};

AnalyticsApiLogger.getLogger = function(source) {
    return new AnalyticsApiLogger(source);
};

AnalyticsApiLogger.prototype = {
    initialize: function(source) {
        this.source = 'Analytics API';
        if (source)
            this.source = source;
    },

    debug: function(msg) {
        if (AnalyticsApiLogger.isDebugEnabled())
            gs.debug(this._getFormattedString(msg));
    },

    info: function(msg) {
        if (AnalyticsApiLogger.isInfoEnabled())
            gs.info(this._getFormattedString(msg));
    },

    warn: function(msg) {
        if (AnalyticsApiLogger.isWarnEnabled())
            gs.warn(this._getFormattedString(msg));
    },

    error: function(msg) {
        if (AnalyticsApiLogger.isErrorEnabled())
            gs.error(this._getFormattedString(msg));
    },

    _getFormattedString: function(msg) {
        return this.source + " :: " + msg;
    },

    type: 'AnalyticsApiLogger'
};
