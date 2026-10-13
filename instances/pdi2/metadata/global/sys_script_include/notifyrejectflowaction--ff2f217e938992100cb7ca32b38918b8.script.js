var NotifyRejectFlowAction = Class.create();
NotifyRejectFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.rejectAction = this.action.addReject();
        this.reason = null;
    },

    // Setters
    setReason: function( /*String*/ reason) {
        if (gs.nil(reason) || typeof reason != "string")
            this.notifyFlowErrorHandler.throwFlowActionSetterError(this.type, "reason");
        this.reason = reason;
    },

    execute: function() {
        if (gs.nil(this.reason) || gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        this.rejectAction.setReason(this.reason);

        // Save the reject action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyRejectFlowAction'
});
