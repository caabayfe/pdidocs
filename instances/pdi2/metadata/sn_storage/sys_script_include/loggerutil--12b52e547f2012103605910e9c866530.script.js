var LoggerUtil = Class.create();
LoggerUtil.prototype = {
    initialize: function() {},

    logInfo: function(className, methodName, message) {
        gs.info(this.createLogMessage(className, methodName, message));
    },

    logWarn: function(className, methodName, message) {
        gs.warn(this.createLogMessage(className, methodName, message));
    },

    logError: function(className, methodName, message, errorCode, errorType) {
        const logMessage = this.createLogMessage(className, methodName, message);
        gs.error(logMessage);
        if (!gs.nil(errorCode) && !gs.nil(errorType))
            this._logLicensingError(errorCode, errorType, logMessage);
    },

    _logLicensingError: function(errorCode, errorType, errorDetails) {
        let licErrgr = new GlideRecord('licensing_error');
        licErrgr.initialize();
        licErrgr.addEncodedQuery("sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()");
        licErrgr.addQuery("error_code", errorCode);
        licErrgr.query();
        if (licErrgr.getRowCount() < 100) {
            licErrgr.error_code = errorCode;
            licErrgr.error_type = errorType;
            licErrgr.error_details = errorDetails;
            licErrgr.insert();
        }
    },

    createLogMessage: function(className, methodName, message) {
        return className.concat('.').concat(methodName).concat(': ').concat(message);
    },

    type: 'LoggerUtil'
};
