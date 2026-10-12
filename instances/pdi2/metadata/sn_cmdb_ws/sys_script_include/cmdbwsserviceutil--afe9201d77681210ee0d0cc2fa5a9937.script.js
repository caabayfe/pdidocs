var CMDBWsServiceUtil = Class.create();
CMDBWsServiceUtil.prototype = {
    initialize: function() {
    },

    type: 'CMDBWsServiceUtil',

    ERROR_CODES: {
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
        MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAMETER'
    },

    /**
     * Executes the given function and handles the error
     * @param {Object} context context about where the call is made from including source and action
     * @param {Function} fn function to execute
	 * @param {...*} args arguments to pass to the function
     * @returns {*} result
     * */
    execute: function(context, fn) {
        if (typeof fn === "function") {
            try {
                var args = Array.prototype.slice.call(arguments, 2);
                return fn.apply(this, args);
            } catch (e) {
                var error = e;
                if (!(error instanceof CMDBWsError)) {
                    error = new CMDBWsError({
                        code: this.ERROR_CODES.UNKNOWN_ERROR,
                        message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Something went wrong. Please try again later."),
                        source: context.source,
                        action: context.action,
                        details: e.message,
                        logError: true,
                        originalError: e
                    });
                }

                throw error;
            }
        }
    },

    /**
     * Validates if the given parameter is nil or not. If it is nill throw the error with provided information
     * @param {*} param
     * @param {Object} errorInfo
     * {
     *   source: "",
     *   message: "",
     *   details: "",
     *   logError: false
     * }
     * */
    validateRequiredParam: function(param, errorInfo) {
        // gs.nil does not validate if an array is empty, so using JSUtil.nil
        if (global.JSUtil.nil(param)) {
            throw new CMDBWsError({
                code: errorInfo.code || this.ERROR_CODES.MISSING_REQUIRED_PARAM,
                action: errorInfo.action,
                source: errorInfo.source,
                message: errorInfo.message || sn_i18n.Message.getMessage("sn_cmdb_ws", "Required parameter missing"),
                details: errorInfo.details || "Required parameter missing",
                logError: errorInfo.logError || false
            });
        }
    },

    parseBoolean: function(paramValue, paramName) {
        if (gs.nil(paramValue))
            throw paramName ?
                new Error(gs.getMessage("Empty value supplied for parameter:{0}", [paramName])) :
                new Error(gs.getMessage("Empty boolean value"));

        if (typeof paramValue === 'boolean')
            return paramValue;
        var val = paramValue.toString().toLowerCase();
        if (val == 'true' || val == '1')
            return true;
        else if (val == 'false' || val == '0')
            return false;
        else
            throw paramName ?
                new Error(gs.getMessage("Invalid value({0}) supplied for parameter:{1}", [paramValue, paramName])) :
                new Error(gs.getMessage("Invalid boolean value ({0})", [paramValue]));
    }
};
