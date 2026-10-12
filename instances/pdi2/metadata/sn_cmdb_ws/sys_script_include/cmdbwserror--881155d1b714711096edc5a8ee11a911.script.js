var CMDBWsError = Class.create();
CMDBWsError.prototype = Object.extendsObject(Error, {
    /**
     * This is generic Error class for all CMDB Workspace App
     */
    CODE: undefined,
    MSG: undefined,
    DETAILS: undefined,
    SOURCE: undefined,
    ACTION: undefined,
    ORIGINAL_ERROR: undefined,
    ORIGINAL_MULTIPLE_ERRORS: undefined,

    /**
     * Initialize the Error object.
     * @param {*} errObj : {
     *   code: string (required)
     *   message: translated string (required)
     *   details: string (required)
     *   source: string (required)
     *   action: string (optional),
     *   logError: boolean (optional),
     *   originalError: Error (optional)
     * }
     * */
    initialize: function(errObj) {
        var errCode = errObj.code || "UNKNOWN_ERROR";
        var errMsg = errObj.message || sn_i18n.Message.getMessage("sn_cmdb_ws", "Something went wrong. Please try again later.");
        var source = errObj.source || "sn_cmdb_ws";
        var action = errObj.action;
        var errDetails = errObj.details;
        var logError = errObj.logError;
        var originalError = errObj.originalError;
        var originalMultipleErrors = errObj.originalMultipleErrors;

        Error.call(this, errDetails);

        this.CODE = errCode;
        this.MSG = errMsg;
        this.DETAILS = errDetails;
        this.SOURCE = source;
        this.ACTION = action;
        this.ORIGINAL_MULTIPLE_ERRORS = originalMultipleErrors;

        if (logError) {
            var gl = new global.GSLog("", source);
            var logString = "SOURCE=\"" + source + "\" ACTION=\"" + action + "\" CODE=\"" + errCode + "\" DETAILS=\"" + errDetails + "\"";
            if (originalError) {
                var message = originalError.message;
                var stack = originalError.stack;
                if (message) {
                    logString += " ORIGINAL_ERROR=\"" + message + "\"";
                    this.ORIGINAL_ERROR = message;
                }
                if (stack)
                    logString += " STACK_TRACE=" + stack;
            }
            if (originalMultipleErrors) {
                for (var i = 0; i < originalMultipleErrors.length; i++) {
                    var singleError = originalMultipleErrors[i];
                    var singleMessage = singleError.message;
                    var singleStack = singleError.stack;
                    if (singleMessage) {
                        logString += " ORIGINAL_MULTIPLE_ERRORS[" + i + "]=\"" + singleMessage + "\"";
                    }
                    if (singleStack) {
                        logString += " STACK_TRACE=" + singleStack;
                    }
                }
            }
            gl.logError(logString);
        }
    },

    toString: function() {
        return JSON.stringify({
            CODE: this.CODE,
            ACTION: this.ACTION,
            MSG: this.MSG,
            DETAILS: this.DETAILS,
            SOURCE: this.SOURCE
        });
    },

    type: 'CMDBWsError'
});
