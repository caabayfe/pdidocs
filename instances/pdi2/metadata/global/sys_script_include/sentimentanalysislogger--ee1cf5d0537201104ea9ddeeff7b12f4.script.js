var SentimentAnalysisLogger = Class.create();
SentimentAnalysisLogger.prototype = {
    initialize: function(source) {
        this.source = 'Sentiment';
        if (source)
            this.source = source;
            var logContext = {
                "app": "CI",
                "track": "Sentiment",
                "source": source
            };
            this.logger = new sn_log.GlideLogger(source, logContext, ["app", "track", "userId", "inboundId"]);
    },

    debug: function(msg, args) {
        args = this.stringifyArgs(args);
        args = [msg].concat(args);
        this.logger.debug.apply(this.logger, args);

    },

    info: function(msg, args) {
        args = this.stringifyArgs(args);
        args = [msg].concat(args);
        this.logger.info.apply(this.logger, args);
    },

    warn: function(msg, args) {
        args = this.stringifyArgs(args);
        args = [msg].concat(args);
        this.logger.warn.apply(this.logger, args);
    },

    error: function(msg, args) {
        args = this.stringifyArgs(args);
        args = [msg].concat(args);
        this.logger.error.apply(this.logger, args);

    },

    addToLoggerContext: function(context) {
        var ctx = new sn_log.GlideLogContext(context);
    },

    isString: function(x) {
        return Object.prototype.toString.call(x) === '[object String]';
    },

    stringifyArgs: function(args) {
        // if args is an not an array, convert to array
        if (!Array.isArray(args) || !args.length) {
            args = [args];
        }
        // convert args to strings
        var i;
        for (i = 0; i < args.length; i++) {
            if (!this.isString(args[i])) {
                args[i] = JSON.stringify(args[i]);
            }
        }
        return args;
    },

    type: 'SentimentAnalysisLogger'
};
