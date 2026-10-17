var NotifyHangUpFlowAction = Class.create();
NotifyHangUpFlowAction.prototype = Object.extendsObject(BaseNotifyFlowAction, {
    initialize: function() {
        BaseNotifyFlowAction.prototype.initialize.apply(this, arguments);
        this.hangUpAction = this.action.addHangUp();
    },

    execute: function() {
        if (gs.nil(this.notifyCallGR))
            this.notifyFlowErrorHandler.throwInvalidInputsToAction(this.type);

        // Save the hang up action into a new notify_wf_activity
        var json = this.action.toJson();
        var notifyActivityGR = new GlideRecord(NotifyFlowConstants.TABLES.NOTIFY_WF_ACTIVITY);
        notifyActivityGR.initialize();
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_CALL, this.notifyCallGR.getUniqueValue());
        notifyActivityGR.setValue(NotifyFlowConstants.COLUMNS.NOTIFY_ACTION, json);
        notifyActivityGR.insert();

        this._setNotifyActivityGR(notifyActivityGR);
    },

    type: 'NotifyHangUpFlowAction'
});
