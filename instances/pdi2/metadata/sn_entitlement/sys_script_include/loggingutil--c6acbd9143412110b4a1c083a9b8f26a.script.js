            var LoggingUtil = Class.create();
            LoggingUtil.prototype = {
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
                    var licErrgr = new GlideRecord('licensing_error');
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

                /** Enables error auditing without putting the errors in syslog. Syslog errors are controlled via isEntitlementLoggingEnabled() */
                auditErrorWithoutLog: function(className, methodName, message, errorCode, errorType) {
                    const logMessage = this.createLogMessage(className, methodName, message);
                    this._logLicensingError(errorCode, errorType, logMessage);
                },

                logErrorWithoutAudit: function(className, methodName, message) {
                    const logMessage = this.createLogMessage(className, methodName, message);
                    gs.error(logMessage);
                },

                createLogMessage: function(className, methodName, message) {
                    return className.concat(LicensingEngineConstants.DOT).concat(methodName).concat(LicensingEngineConstants.COLON).concat(message);
                },

                logCouldNotFind: function(className, methodName, message) {
                    var infoMsg = LicensingEngineConstants.COULD_NOT_FIND_.concat(message);
                    gs.info(this.createLogMessage(className, methodName, infoMsg));
                },

                serializeAttributes: function(attributeMap) {
                    var result = LicensingEngineConstants.EMPTY_STRING;
                    for (var key in attributeMap) {
                        var value = attributeMap[key];
                        result = (gs.nil(result)) ? key : result.concat(LicensingEngineConstants.COMMA).concat(key);
                        if (!gs.nil(value))
                            result = result.concat(LicensingEngineConstants.EQUALS).concat(value);
                    }
                    return result;
                },

                logRecordDoesNotExists: function(scriptName, tableName, argString) {
                    let conditions = this.serializeAttributes(this.createAttributeMap(argString));
                    let errorMsg = scriptName.concat(LicensingEngineConstants.COLON).concat(LicensingEngineConstants.RECORD_DOES_NOT_EXISTS_IN_TABLE)
                        .concat(tableName).concat(LicensingEngineConstants.WHERE).concat(conditions);
                    gs.error(errorMsg);
                    this._logLicensingError(LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_RECORD_EXIST, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API, errorMsg);
                },

                createAttributeMap: function(argString) {
                    var argArray = argString.split(LicensingEngineConstants.COMMA);
                    var attributeMap = {};
                    for (var i = 0; i < argArray.length; i += 2)
                        attributeMap[argArray[i]] = argArray[i + 1];
                    return attributeMap;
                },

                logInvalidArtifact: function(artifactType, artifactId) {
                    var artifactDetails = this.serializeAttributes({
                        type: artifactType,
                        id: artifactId
                    });
                    var errorMsg = LicensingEngineConstants.INVALID_ARTIFACT_SPECIFIED.concat(artifactDetails);
                    gs.error(errorMsg);
                    this._logLicensingError(LicensingEngineConstants.ENTITLEMENT_API_CODE.INVALID_ARTIFACT, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API, errorMsg);
                },

                logCouldNotDetermine: function(className, methodName, message) {
                    var infoMsg = LicensingEngineConstants.COULD_NOT_DETERMINE.concat(message);
                    gs.info(this.createLogMessage(className, methodName, infoMsg));
                },

                logErrorInDetermining: function(className, methodName, message, error) {
                    var errorMsg = LicensingEngineConstants.ERROR_IN_DETERMINING.concat(message).concat(LicensingEngineConstants.COLON).concat(error);
                    gs.error(this.createLogMessage(className, methodName, errorMsg));
                },

                isEntitlementLoggingEnabled: function() {
                    return gs.getProperty('glide.licensing_engine.entitlement.logging', false).toLowerCase() === 'true';
                },

                type: 'LoggingUtil'
            };
