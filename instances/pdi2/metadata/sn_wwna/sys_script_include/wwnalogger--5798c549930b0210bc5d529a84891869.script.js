var WWNALogger = Class.create();
WWNALogger.prototype = {
    initialize: function(source = "sn-wwna") {
        this.logger = new sn_log.GlideLogger(source);
        this.isLoggerEnabled = this.isLoggingEnabled();
    },
    info: function(msg, args) {
        if (this.isLoggerEnabled) {
            this.logger.info(msg, args);
        }
    },
    warn: function(msg, args) {
        if (this.isLoggerEnabled) {
            this.logger.warn(msg, args);
        }
    },
    error: function(msg, args) {
        if (this.isLoggerEnabled) {
            this.logger.error(msg, args);
        }
    },
    isLoggingEnabled: function() {
        var flag = gs.getProperty("sn_wwna.logging.enabled", false);
        return flag == "true" || flag == true;
    },
    type: 'WWNALogger'
};
