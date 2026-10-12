var SncCloneLoggerUtil = Class.create();
SncCloneLoggerUtil.prototype = {
    initialize: function() {
    },

    type: 'SncCloneLoggerUtil'
};

/*
 * Utility method to log message as info
 */
SncCloneLoggerUtil.info = function(cloneId, logMessage, source) {
	SncCloneLoggerUtil.log(cloneId, logMessage, CloneConstants.logLevel.LOG_LEVEL_INFO, source);
};

/*
 * Utility method to log message as error
 */
SncCloneLoggerUtil.error = function(cloneId, logMessage, source) {
	SncCloneLoggerUtil.log(cloneId, logMessage, CloneConstants.logLevel.LOG_LEVEL_ERROR, source);
};

/*
 * Utility method to log message
 */
SncCloneLoggerUtil.log = function(cloneId, logMessage, logLevel, source) {
	if(gs.nil(cloneId))
		return;

	var logTableGr = new GlideRecord(CloneConstants.tableName.CLONE_LOG);
	if(!logTableGr.isValid())
		return;
	
	logTableGr.initialize();
	logTableGr.setValue('clone_request', cloneId);
	logTableGr.setValue('message', logMessage);
	logTableGr.setValue('level', logLevel);
	logTableGr.setValue('source', source);
	logTableGr.insert();

};
