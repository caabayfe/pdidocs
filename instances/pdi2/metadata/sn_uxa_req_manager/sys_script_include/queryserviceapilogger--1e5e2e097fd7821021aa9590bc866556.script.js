var QueryServiceApiLogger = Class.create();

QueryServiceApiLogger.DEBUG = 0;
QueryServiceApiLogger.INFO = 1;
QueryServiceApiLogger.WARN = 2;
QueryServiceApiLogger.ERROR = 3;

QueryServiceApiLogger.getLogger = function(source) {
    return new QueryServiceApiLogger(source);
};

QueryServiceApiLogger.prototype = {
    initialize: function(source) {
        this.source = 'QueryService';
        this.level = gs.getProperty('sn_uxa_req_manager.analytics.queryservice.api.logging.level', QueryServiceApiLogger.WARN);

        if (source)
            this.source += '.' + source;
    },

    isDebugEnabled: function() {
      return this.level <= QueryServiceApiLogger.DEBUG;
    },

    isErrorEnabled: function() {
      return this.level <= QueryServiceApiLogger.ERROR;
    },

    isWarnEnabled: function() {
      return this.level <= QueryServiceApiLogger.WARN;
    },

    isInfoEnabled: function() {
      return this.level <= QueryServiceApiLogger.INFO;
    },

    debug: function(msg) {
        if (this.isDebugEnabled())
            gs.debug(this._getFormattedString(msg));
    },

    info: function(msg) {
        if (this.isInfoEnabled())
            gs.info(this._getFormattedString(msg));
    },

    warn: function(msg) {
        if (this.isWarnEnabled())
            gs.warn(this._getFormattedString(msg));
    },

    error: function(msg) {
        if (this.isErrorEnabled())
            gs.error(this._getFormattedString(msg));
    },

    _getFormattedString: function(msg) {
        return this.source + " :: " + msg;
    },

    type: 'QueryServiceApiLogger'
};
