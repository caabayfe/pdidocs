var LinkUnfurlingLoggingUtils = Class.create();
LinkUnfurlingLoggingUtils.prototype = {

	initialize: function() {
	},

	atDebug: function(url, conversationId) {
		return this._getLogger(sn_log.GlideLogger.atDebug, url, conversationId);
	},

	atInfo: function(url, conversationId) {
		return this._getLogger(sn_log.GlideLogger.atInfo, url, conversationId);
	},

	atWarn: function(url, conversationId) {
		return this._getLogger(sn_log.GlideLogger.atWarn, url, conversationId);
	},

	atError: function(url, conversationId) {
		return this._getLogger(sn_log.GlideLogger.atError, url, conversationId);
	},

	_getLogger: function(loggerType, url, conversationId) {
		var logger = loggerType()
			.withLoggerName('com.glide.cs.link_unfurling')
			.withContext('app', 'CI')
			.withContext('track', 'Link Unfurling')
			.withPrintableContext(['app', 'track', 'url', 'conversation']);

		if (!gs.nil(url))
			logger = logger.withContext('url', url);

		if (!gs.nil(conversationId))
			logger = logger.withContext('conversation', conversationId)

		return logger;
	},

	type: 'LinkUnfurlingLoggingUtils'
};
