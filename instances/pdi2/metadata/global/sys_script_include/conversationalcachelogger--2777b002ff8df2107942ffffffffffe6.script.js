var ConversationalCacheLogger = Class.create();
ConversationalCacheLogger.prototype = {
	initialize: function (source, traceId, conversation) {
		this.source = source || "Conversational Cache";
		this.debugOn = gs.getProperty('com.glide.cs.og.cache.log.debug', 'false') == 'true';
		this.setContext(traceId, conversation);
	},
	/**
	 * (Re)builds the underlying logger so that trace_id and conversation are emitted in the
	 * syslog context map (not just in the message text). Blank values are skipped so that
	 * they do not clutter the context map.
	 */
	setContext: function (traceId, conversation) {
		var context = {
			source: this.source
		};
		if (!gs.nil(traceId)) {
			context.trace_id = traceId;
		}
		if (!gs.nil(conversation)) {
			context.conversation = conversation;
		}
		this._context = context;
		this._logger = new sn_log.GlideLogger(this.source, context, Object.keys(context));
	},
	_log: function (level, args) {
		this._logger[level].apply(this._logger, args);
	},
	info: function (msg) {
		this._log('info', arguments);
	},
	warn: function (msg) {
		this._log('warn', arguments);
	},
	error: function (msg) {
		this._log('error', arguments);
	},
	debug: function (msg) {
		if (this.debugOn) {
			this._log('debug', arguments);
		}
	},

	type: 'ConversationalCacheLogger'
};
