var CIAnalyticsLogger = Class.create();
var LOGGING_CONTEXT = {
    app: 'CI',
    track: 'ETL',
    layer: 'Script'
};
var LOGGER_NAME = "sn_ci_analytics.CIAnalyticsLogger";

CIAnalyticsLogger.getLogger = function(context) {
    return new CIAnalyticsLogger(context);
};

CIAnalyticsLogger.prototype = {
    initialize: function(context) {
        if ((context == null) || (typeof context != 'object')) {
            context = {
                source: context ? context : 'CI Analytics'
            }
        }
        context.app = LOGGING_CONTEXT.app;
        context.track = LOGGING_CONTEXT.track;
        context.layer = LOGGING_CONTEXT.layer;
        this.logger = new sn_log.GlideLogger(LOGGER_NAME, context, Object.keys(context));
    },

    _formatInputs: function(msg, args) {
        var arr = [msg];
        if (args && args.length) {
            arr = arr.concat(args);
        }
        return arr;
    },

    debug: function(msg, args) {
        this.logger.debug.apply(this.logger, this._formatInputs(msg, args));
    },

    debugJson: function(msg, jsonObj) {
        if (!this.isDebugEnabled())
            return;
        var jsonStr = JSON.stringify(jsonObj);
        msg = msg.replace('{}', '{0}');
        this.debug(msg, [jsonStr]);
    },

    info: function(msg, args) {
        this.logger.info.apply(this.logger, this._formatInputs(msg, args));
    },

    warn: function(msg, args) {
        this.logger.warn.apply(this.logger, this._formatInputs(msg, args));
    },

    error: function(msg, args) {
        this.logger.error.apply(this.logger, this._formatInputs(msg, args));
    },

    isDebugEnabled: function() {
        return gs.isDebugging();
    },

    type: 'CIAnalyticsLogger'
};
