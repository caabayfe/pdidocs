var NotifyFlowErrorHandler = Class.create();
NotifyFlowErrorHandler.prototype = {
    initialize: function() {},

    throwInvalidAction: function() {
        var error = new Error(gs.getMessage("Invalid Notify Flow Action."));
        error.name = "InvalidActionError";
        throw error;
    },

    throwFlowActionSetterError: function( /*String*/ notifyFlowAction, /*String*/ propName) {
        var error = new Error(gs.getMessage("Invalid value to set to '{0}' in {1}", [propName, notifyFlowAction]));
        error.name = "InvalidValueToFlowActionSetterError";
        throw error;
    },


    throwInvalidInputsToAction: function( /*String*/ action) {
        var error = new Error(gs.getMessage("Inputs to action {0} is not well defined.", action));
        error.name = "InvalidInputsToFlowActionError";
        throw error;
    },

    throwActionExecutionFailed: function( /*String*/ action) {
        var error = new Error(gs.getMessage("Failed to execute {0} action.", action));
        error.name = "ActionExecutionFailedError";
        throw error;
    },

    throwNotifyFlowActionError: function( /*String*/ notifyFlowAction, /*String*/ errorMessage) {
        var error = new Error(errorMessage);
        error.name = "NotifyFlowActionError [" + notifyFlowAction + "]";
        throw error;
    },

    isActionExecutionFailed: function( /*String*/ notifyWFActivityState) {
        if (notifyWFActivityState === NotifyFlowConstants.COLUMN_VALUES.FAILED)
            return true;
        return false;
    },

    type: 'NotifyFlowErrorHandler'
};
