var BaseNotifyFlowAction = Class.create();
BaseNotifyFlowAction.prototype = {
    initialize: function() {
        this.action = new SNC.NotifyAction();
        this.notifyCallGR = null;
        this.notifyActivityGR = null;
        this.notifyFlowErrorHandler = new NotifyFlowErrorHandler();
    },

    // Getters
    getNotifyActivityGR: function() {
        return this.notifyActivityGR;
    },

    // Setters
    setNotifyCall: function( /*GlideRecord */ notifyCallGR) {
        if (gs.nil(notifyCallGR) || !notifyCallGR.isValidRecord())
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "notifyCallGR");
        this.notifyCallGR = notifyCallGR;
    },

    _setNotifyActivityGR: function( /*GlideRecord */ notifyActivityGR) {
        if (gs.nil(notifyActivityGR) || !notifyActivityGR.isValidRecord())
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "notifyActivityGR");
        this.notifyActivityGR = notifyActivityGR;
    },

    execute: function() {},

    type: 'BaseNotifyFlowAction'
};
